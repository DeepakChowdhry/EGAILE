import { randomUUID } from 'node:crypto';
import { supportEmail, supportPhone, processAreas } from '../lib/enquiry-options';
import { transaction, readStore, type RecordData } from './db';
type Enquiry = RecordData & {
  reference: string;
  body: Record<string, string>;
  status: string;
  created_at: string;
};
export async function dispatchNotifications(taskId?: string) {
  if (!process.env.RESEND_API_KEY) return { configured: false, processed: 0 };
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
          support_accepted_at?: string;
          requester_accepted_at?: string;
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
      return {
        id: candidate.id,
        lead,
        attempts: current.attempts,
        token,
        supportAccepted: current.support_accepted_at,
        requesterAccepted: current.requester_accepted_at,
      };
    });
    if (!job) continue;
    let error = '',
      permanent = false;
    try {
      const body = job.lead.body;
      const details = [
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        `Company: ${body.company}`,
        `Country: ${body.country === 'IN' ? 'India' : body.country || 'Not specified'}`,
        `Area of interest: ${body.serviceLabel || 'Not specified'}`,
        `Industry: ${body.industryLabel || 'Not specified'}`,
        `Process area: ${processAreas.find((option) => option.value === body.processArea)?.label || body.processArea || 'Not specified'}`,
        '',
        'Your enquiry:',
        body.message,
      ].join('\n');
      const messages = [
        {
          kind: 'support',
          accepted: job.supportAccepted,
          to: process.env.NOTIFICATION_TO || supportEmail,
          replyTo: body.email,
          subject: `New EGAILE enquiry — ${job.lead.reference}`,
          text: `A new enquiry has been received. Reference: ${job.lead.reference}\n\n${details}`,
        },
        {
          kind: 'requester',
          accepted: job.requesterAccepted,
          to: body.email,
          replyTo: supportEmail,
          subject: `We’ve received your enquiry — ${job.lead.reference}`,
          text: `Hello ${body.name},\n\nThank you for contacting EGAILE. Your enquiry has been received by our Support Team.\n\nReference: ${job.lead.reference}\n\n${details}\n\nYou can reply to this email to continue the conversation.\n\nSupport Team\nEGAILE\n${supportEmail}\n${supportPhone}`,
        },
      ];
      for (const message of messages) {
        if (message.accepted) continue;
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            // Preserve the existing support notification key across this upgrade.
            'Idempotency-Key': message.kind === 'support' ? job.id : `${job.id}:requester`,
          },
          body: JSON.stringify({
            from: process.env.NOTIFICATION_FROM || `EGAILE Support Team <${supportEmail}>`,
            to: [message.to],
            reply_to: message.replyTo,
            subject: message.subject,
            text: message.text,
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) {
          error = 'PROVIDER_' + response.status;
          permanent =
            response.status >= 400 &&
            response.status < 500 &&
            ![408, 409, 429].includes(response.status);
          break;
        }
        // Save progress so a failed requester email does not resend the support email.
        await transaction(async (db) => {
          const current = await db.get<RecordData & { lease_token: string }>(
            'deliveryTasks',
            job.id,
          );
          if (current?.lease_token === job.token)
            await db.set('deliveryTasks', job.id, {
              ...current,
              [`${message.kind}_accepted_at`]: new Date().toISOString(),
            });
        });
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
