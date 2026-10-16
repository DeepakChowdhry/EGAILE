import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { dispatchNotifications } from '../../src/server/delivery';
process.env.EGAILE_BACKEND = 'firebase';
process.env.FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
setGlobalOptions({ region: 'asia-south1', maxInstances: 2, memory: '256MiB' });
const emailKey = defineSecret('RESEND_API_KEY');
// NOTIFICATION_FROM and NOTIFICATION_TO are non-secret environment configuration.
export const deliverEnquiry = onDocumentCreated(
  { document: 'deliveryTasks/{taskId}', retry: true, secrets: [emailKey] },
  async (event) => {
    process.env.RESEND_API_KEY = emailKey.value();
    await dispatchNotifications(event.params.taskId);
  },
);
export const recoverDeliveryTasks = onSchedule(
  { schedule: 'every 5 minutes', secrets: [emailKey] },
  async () => {
    process.env.RESEND_API_KEY = emailKey.value();
    await dispatchNotifications();
  },
);
