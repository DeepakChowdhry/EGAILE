import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config';

test('enabled analytics is permitted by CSP without opening private framing or arbitrary connections', async () => {
  const previous = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
  try {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    const rules = await config.headers!();
    const policy = rules[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value;
    const directive = (name: string) =>
      policy.split(';').find((s) => s.trim().startsWith(name + ' '))!;
    assert.match(directive('script-src'), /https:\/\/www\.googletagmanager\.com/);
    assert.match(directive('connect-src'), /https:\/\/\*\.google-analytics\.com/);
    assert.match(directive('connect-src'), /https:\/\/\*\.analytics\.google\.com/);
    assert.match(directive('frame-ancestors'), /'none'/);
    assert.doesNotMatch(directive('connect-src'), /(?:^|\s)\*(?:\s|$)/);
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false';
    const disabled = await config.headers!();
    assert.doesNotMatch(
      disabled[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value,
      /googletagmanager|google-analytics/,
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
    else process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = previous;
  }
});
