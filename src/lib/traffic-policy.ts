export const consentKey = 'egaile-analytics-consent-v1';
const lifetime = 180 * 86400000;
export type TrafficChoice = 'accepted' | 'declined';
export function readTrafficChoice(value: string | null, now = Date.now()): TrafficChoice | null {
  try {
    const saved = JSON.parse(value || 'null');
    return saved &&
      ['accepted', 'declined'].includes(saved.choice) &&
      typeof saved.time === 'number' &&
      saved.time <= now &&
      now - saved.time < lifetime
      ? saved.choice
      : null;
  } catch {
    return null;
  }
}
export function trafficAllowed(host: string, enabled: boolean, production: boolean) {
  return enabled && production && ['egaile.com', 'www.egaile.com'].includes(host);
}
export function publicTrafficPath(path: string, publicPaths: string[]) {
  return !/^\/(admin|preview|api)(\/|$)/.test(path) && publicPaths.includes(path);
}
