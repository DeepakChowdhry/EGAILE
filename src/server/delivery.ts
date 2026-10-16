import { randomUUID } from 'node:crypto';
import { transaction, readStore, type RecordData } from './db';
type Enquiry = RecordData & {
  reference: string;
  body: Record<string, string>;
  status: string;
  created_at: string;
};
export async function dispatchNotifications(taskId?: string) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_FROM || !process.env.NOTIFICATION_TO)
    return { configured: false, processed: 0 };
  const db = await readStore();
  const candidates = taskId
    ? await db
        .get<RecordData & { state: string; next_attempt: string }>('deliveryTasks', taskId)
        .then((t) => (t ? [{ ...t, id: taskId }] : []))
    : await db.find<RecordData & { state: string; next_attempt: string }>(
        'deliveryTasks',
        'state',
        'in',
        ['pending', 'processing'],
        100,
        'next_attempt',
        true,
      );
  let processed = 0;
  for (const candidate of candidates) {
    if (processed >= 10) break;
    if (
      !['pending', 'processing'].includes(candidate.state) ||
      candidate.next_attempt > new Date().toISOString()
    )
      continue;
    const job = await transaction(async (db) => {
      const current = await db.get<
        RecordData & {
          state: string;
          attempts: number;
          enquiry_id: string;
          lease_until: string;
          next_attempt: string;
        }
      >('deliveryTasks', candidate.id);
      if (!current) return null;
      const lead = await db.get<Enquiry>('enquiries', current.enquiry_id);
      const now = new Date().toISOString();
      if (
        !lead ||
        !['pending', 'processing'].includes(current.state) ||
        current.next_attempt > now ||
        (current.state === 'processing' && current.lease_until > now)
      )
        return null;
      const token = randomUUID();
      await db.set('deliveryTasks', candidate.id, {
        ...current,
        state: 'processing',
        lease_until: new Date(Date.now() + 120000).toISOString(),
        lease_token: token,
      });
      return { id: candidate.id, lead, attempts: current.attempts, token };
    });
    if (!job) continue;
    let error = '',
      permanent = false;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': job.id,
        },
        body: JSON.stringify({
          from: process.env.NOTIFICATION_FROM,
          to: [process.env.NOTIFICATION_TO],
          subject: `EGAILE enquiry ${job.lead.reference}`,
          text: `A new enquiry is available in the protected EGAILE dashboard. Reference: ${job.lead.reference}`,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        error = 'PROVIDER_' + response.status;
        permanent =
          response.status >= 400 &&
          response.status < 500 &&
          ![408, 409, 429].includes(response.status);
      }
    } catch {
      error = 'PROVIDER_TIMEOUT';
    }
    await transaction(async (db) => {
      const current = await db.get<RecordData & { lease_token: string }>('deliveryTasks', job.id);
      if (!current || current.lease_token !== job.token) return;
      const attempts = job.attempts + 1;
      await db.set('deliveryTasks', job.id, {
        ...current,
        state: error ? (permanent || attempts >= 5 ? 'failed' : 'pending') : 'accepted',
        attempts,
        next_attempt: new Date(
          Date.now() + Math.min(43200000, 60000 * 5 ** (attempts - 1)),
        ).toISOString(),
        lease_until: '',
        lease_token: '',
        error_code: error,
      });
    });
    processed++;
  }
  return { configured: true, processed };
}
