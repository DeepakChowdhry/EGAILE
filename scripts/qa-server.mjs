// Disposable local QA instance. Never connects to the real Firebase project.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const port = '3011';
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', port],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      EGAILE_BUILD_DIR: '.next-qa',
      EGAILE_DATA_DIR: path.join(process.cwd(), '.data', 'qa-' + randomUUID()),
      EGAILE_BACKEND: 'local',
      NEXT_PUBLIC_BACKEND: 'local',
      LOCAL_OWNER_MODE: 'true',
      APP_ORIGIN: 'http://127.0.0.1:' + port,
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
      RESEND_API_KEY: '',
      NOTIFICATION_FROM: '',
      NOTIFICATION_TO: '',
    },
  },
);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code || 0));
