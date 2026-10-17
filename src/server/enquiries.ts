import { z } from 'zod';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { transaction, readStore, backend, type RecordData } from './db';
import { readContent } from './content-repository';
export const enquirySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase()),
    company: z.string().trim().min(2).max(150),
    message: z.string().trim().min(20).max(3000),
    service: z.string().max(90).optional(),
    industry: z.string().max(90).optional(),
    processArea: z
      .enum([
        '',
        'software-delivery',
        'operations',
        'reporting',
        'customer-handling',
        'administration',
        'other',
      ])
      .optional(),
    country: z.enum(['', 'IN', 'OTHER']).optional(),
    privacy: z.literal(true),
    privacyVersion: z.literal('website-preview-v1'),
    sourcePath: z
      .string()
      .regex(/^\/[a-z0-9\/-]*$/)
      .max(180),
    website: z.literal(''),
  })
  .strict();
const localSalt = randomBytes(32).toString('hex');
export async function acceptEnquiry(input: unknown, key: string, ip: string) {
  if (!z.uuid().safeParse(key).success) throw new Error('INVALID_BODY');
  const body = enquirySchema.parse(input);
  const { site } = await readContent();
  const service = site.pages.find(
    (p) => p.type === 'service' && p.published && p.slug === body.service,
  );
  const industry = site.pages.find(
    (p) => p.type === 'industry' && p.published && p.slug === body.industry,
  );
  if ((body.service && !service) || (body.industry && !industry)) throw new Error('INVALID_BODY');
  if (backend() === 'firebase' && !process.env.RATE_LIMIT_SECRET)
    throw new Error('RATE_LIMIT_CONFIGURATION_REQUIRED');
  const now = new Date().toISOString(),
    payloadHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const bucket = createHmac('sha256', process.env.RATE_LIMIT_SECRET || localSalt)
    .update(ip + ':' + Math.floor(Date.now() / 600000))
    .digest('hex');
  return transaction(async (db) => {
    const existing = await db.get<RecordData & { payload_hash: string; reference: string }>(
      'submissionKeys',
      key,
    );
    const rate = await db.get<RecordData & { count: number }>('rateLimits', bucket);
    if (existing) {
      if (existing.payload_hash !== payloadHash) throw new Error('IDEMPOTENCY_CONFLICT');
      return { reference: existing.reference, duplicate: true };
    }
    if (Number(rate?.count || 0) >= 5) throw new Error('RATE_LIMITED');
    const id = randomUUID(),
      reference = 'EG-' + randomBytes(6).toString('hex').toUpperCase();
    await db.set('rateLimits', bucket, {
      count: Number(rate?.count || 0) + 1,
      expires_at: new Date(Date.now() + 600000).toISOString(),
    });
    await db.set('enquiries', id, {
      reference,
      body: {
        ...body,
        serviceId: service?.id || '',
        serviceLabel: service?.title || 'Not sure',
        industryLabel: industry?.title || 'Not specified',
      },
      status: 'New',
      created_at: now,
    });
    await db.set('submissionKeys', key, {
      payload_hash: payloadHash,
      enquiry_id: id,
      reference,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });
    await db.set('deliveryTasks', id, {
      enquiry_id: id,
      state: 'pending',
      attempts: 0,
      next_attempt: now,
      created_at: now,
      lease_until: '',
      lease_token: '',
      error_code: '',
    });
    return { reference, duplicate: false };
  });
}
type Enquiry = RecordData & {
  reference: string;
  body: Record<string, string>;
  status: string;
  created_at: string;
};
export async function listEnquiries() {
  const db = await readStore();
  const rows = await db.list<Enquiry>('enquiries', 100, 'created_at');
  return Promise.all(
    rows.map(async (row) => {
      const task = await db.get('deliveryTasks', row.id);
      return {
        ...row,
        notification: task?.state || 'not queued',
        error_code: task?.error_code || '',
      };
    }),
  );
}
const transitions: Record<string, string[]> = {
  New: ['Reviewed'],
  Reviewed: ['Contacted', 'Unqualified'],
  Contacted: ['Qualified', 'Unqualified'],
  Qualified: ['Closed'],
  Unqualified: ['Closed'],
  Closed: [],
};
export async function updateEnquiry(id: string, status: string, actor = 'local-owner') {
  return transaction(async (db) => {
    const row = await db.get<Enquiry>('enquiries', id);
    if (!row) throw new Error('NOT_FOUND');
    if (row.status !== status && !transitions[row.status]?.includes(status))
      throw new Error('INVALID_TRANSITION');
    await db.set('enquiries', id, { ...row, status });
    await db.set('auditEvents', randomUUID(), {
      actor,
      action: 'enquiry.status.' + status,
      entity: id,
      created_at: new Date().toISOString(),
    });
  });
}
export async function deleteEnquiry(id: string, actor = 'local-owner') {
  return transaction(async (db) => {
    const row = await db.get('enquiries', id);
    const keys = await db.find<RecordData & { enquiry_id: string }>(
      'submissionKeys',
      'enquiry_id',
      '==',
      id,
      10,
    );
    if (!row) throw new Error('NOT_FOUND');
    for (const key of keys) await db.delete('submissionKeys', key.id);
    await db.delete('deliveryTasks', id);
    await db.delete('enquiries', id);
    await db.set('auditEvents', randomUUID(), {
      actor,
      action: 'enquiry.deleted',
      entity: id,
      created_at: new Date().toISOString(),
    });
  });
}
export async function retryNotification(id: string, actor: string) {
  return transaction(async (db) => {
    const task = await db.get('deliveryTasks', id);
    if (!task) throw new Error('NOT_FOUND');
    if (task.state !== 'failed') throw new Error('INVALID_TRANSITION');
    await db.set('deliveryTasks', id, {
      ...task,
      state: 'pending',
      attempts: 0,
      next_attempt: new Date().toISOString(),
      lease_until: '',
      lease_token: '',
      error_code: '',
    });
    await db.set('auditEvents', randomUUID(), {
      actor,
      action: 'notification.requeued',
      entity: id,
      created_at: new Date().toISOString(),
    });
  });
}
export { dispatchNotifications } from './delivery';
