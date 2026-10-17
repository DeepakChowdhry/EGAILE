import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const day = '2026-10-17';
const file = (p) => readFile(path.join('test-results', p), 'utf8');
const groups = [];
for (const [name, p] of [
  ['Connected website HTTP', 'http-connected.json'],
  ['Disposable API workflows', 'http-isolated.json'],
  ['Browser journeys and responsive layouts', 'browser.json'],
  ['Cloud readiness', 'readiness.json'],
]) {
  const data = JSON.parse(await file(p));
  groups.push({ name, rows: data.results.map((r) => ({ ...r, name: r.name || r.test })) });
}
for (const [name, p] of [
  ['Local repository and policy tests', 'unit-final.txt'],
  ['Firebase emulator tests', 'firebase-final.txt'],
]) {
  const log = await file(p);
  const rows = [...log.matchAll(/^✔ (.+?) \(([\d.]+)ms\)/gm)].map((m, i) => ({
    id: 'TEST-' + (i + 1),
    name: m[1],
    status: 'PASS',
    evidence: m[2] + ' ms',
  }));
  if (!rows.length || /^✖ /m.test(log)) throw Error('Incomplete or failing evidence: ' + p);
  groups.push({ name, rows });
}
groups.push({
  name: 'Compilation',
  rows: [
    {
      id: 'BUILD',
      name: 'Next.js production build',
      status: 'PASS',
      evidence: 'next build using .next-qa: exit 0; all routes compiled.',
    },
    { id: 'TYPES', name: 'TypeScript noEmit', status: 'PASS', evidence: 'tsc --noEmit: exit 0.' },
    {
      id: 'FUNCTIONS',
      name: 'Firebase notification and recovery functions build',
      status: 'PASS',
      evidence: (await file('functions-build.txt')).trim(),
    },
  ],
});
const results = groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.name })));
const count = (status) => results.filter((r) => r.status === status).length;
const fixes = [
  [
    'F-01',
    'Duplicate browser-title suffix',
    'Process & gap assessment | EGAILE | EGAILE',
    'Configured SEO titles now use Next.js absolute titles; public service and approach metadata retested.',
    'PASS',
  ],
  [
    'F-02',
    'Cloud contact form described local storage',
    'Firebase-connected contact page said submissions stay on this computer.',
    'Storage notice now follows the selected database backend. Connected and disposable contact-page checks passed.',
    'PASS',
  ],
  [
    'F-03',
    'Analytics blocked by Content Security Policy',
    'Google tag script and GA4 collection hosts were absent from allowed sources.',
    'Narrow required hosts are permitted when Analytics is enabled. Disabled mode remains closed; consent/domain/private-path gates retained and tested. Live collection remains untested.',
    'PASS',
  ],
];
const scope =
  'Connected site: http://127.0.0.1:3010 (public browsing and read-only checks). Disposable site: http://127.0.0.1:3011 (synthetic enquiry, local admin editing, preview, publish and recovery). Firebase Auth/Firestore: demo-egaile emulators; no real memberships or business content changed.';
const limitations =
  'This is a local functional regression assessment, not production acceptance. Browser checks used the Codex in-app Chromium browser: desktop public pages at 1440 px, admin at 1280 px, public/admin phone layouts at measured 320 px, and the private 390 px draft view. No Safari/Firefox, independent screen reader, production load/soak, penetration or deployed-domain test was performed. Local successes do not establish production capacity or third-party delivery.';
const note =
  'Initial harness issues were corrected separately from product defects: the dispatch endpoint correctly returns 401 (not the initial test expectation of 403); the bundled PDF Java runtime lacked an emulator module, so a checksum-verified portable official Temurin runtime was used; the full Firestore test run initially omitted its documented synthetic RATE_LIMIT_SECRET, causing four dependent failures, then passed all 18 after correcting the test environment. The three emulator-only tests are skipped in the local run and passed in the separate emulator run. Totals count checks per environment, including repeated coverage.';
const evidence = (r) =>
  typeof r.evidence === 'object' ? JSON.stringify(r.evidence) : r.evidence || '';
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
let md = `# EGAILE website test results — ${day}\n\n${count('PASS')} passed · ${count('FAIL')} failed on final retest · ${count('BLOCKED')} blocked · ${count('NOT RUN')} not run.\n\n**Release decision: cloud launch is not yet verified.** Three code defects were corrected and retested. Complete the blocked cloud configuration and live integration checks before public launch.\n\n## Scope\n\n${scope}\n\n${limitations}\n\n## Defects and retest\n\n| ID | Defect | Before | Correction / retest | Final |\n|---|---|---|---|---|\n${fixes.map((r) => '| ' + r.join(' | ').replaceAll(' | EGAILE', ' / EGAILE') + ' |').join('\n')}\n\n## Detailed results\n`;
for (const g of groups)
  md += `\n### ${g.name}\n\n| ID | Check | Final status | Evidence |\n|---|---|---|---|\n${g.rows.map((r) => '| ' + [r.id, r.name, r.status, evidence(r)].map((s) => String(s).replaceAll('|', ' / ').replaceAll('\n', ' ')).join(' | ') + ' |').join('\n')}\n`;
md += `\n## Repeating the tests\n\n- Normal website running on port 3010: \`npm run test:http\`.\n- In another terminal: \`npm run qa:serve\`, then \`npm run test:http:isolated\`. Restart the disposable server for a fresh dataset/rate allowance.\n- \`npm test\`, \`npm run typecheck\`, \`npm run build\`, \`npm run functions:build\`. Use \`EGAILE_BUILD_DIR=.next-qa\` for a separate build while development runs.\n- Firebase: Java 21+, \`EGAILE_BACKEND=firebase\`, \`FIREBASE_PROJECT_ID=demo-egaile\`, a synthetic \`RATE_LIMIT_SECRET\`, then \`npx firebase emulators:exec --project demo-egaile --only auth,firestore "node --import tsx --test tests/*.test.ts"\`.\n- Browser journeys were performed through the connected in-app browser, not a checked-in cross-browser Playwright suite.\n\n## Test-environment notes\n\n${note}\n\nAnalytics policy reference: [Google tag Content Security Policy guidance](https://developers.google.com/tag-platform/security/guides/csp). Portable Java source: [Adoptium official download API](https://adoptium.net/installation/ci-scripts).\n`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EGAILE · Website QA results</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#142331;font:16px/1.6 'Segoe UI',Arial,sans-serif}main{max-width:1160px;margin:auto;padding:44px 28px}header{border-bottom:1px solid #ccd6df;padding-bottom:24px}.eyebrow{color:#11635c;font-size:12px;font-weight:700;letter-spacing:.15em}h1{font-size:44px;letter-spacing:-.04em;line-height:1.15;margin:12px 0}h2{font-size:24px;margin:32px 0 14px}h3{font-size:18px}.meta{color:#526170}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:26px 0}.card{background:white;padding:20px;border-radius:12px;border:1px solid #d7dfe5}.card strong{display:block;font-size:40px;line-height:1.2}.pass{color:#096044}.fail{color:#a22121}.blocked{color:#895600}.not-run{color:#48576c}.notice{background:#fff4da;border-left:4px solid #bb8010;padding:18px 22px}.panel{background:white;padding:22px;border:1px solid #d7dfe5;border-radius:12px;margin:20px 0}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:#4b5b6c;background:#f0f4f7}th,td{padding:12px;border-bottom:1px solid #dfe6eb;vertical-align:top}td:first-child{white-space:nowrap;font-weight:600}td:last-child{min-width:200px}tr:last-child td{border:0}.status{font-weight:700;white-space:nowrap}details{background:white;border:1px solid #d7dfe5;border-radius:10px;margin:12px 0;padding:16px}summary{cursor:pointer;font-weight:600}label{font-weight:600}select,button{font:inherit;padding:8px 12px;border:1px solid #b7c6d1;border-radius:6px;background:white;color:#142331}button{cursor:pointer;margin-left:10px}.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:24px}.small{font-size:13px;color:#526170}a{color:#0a5f9d}@media(max-width:650px){main{padding:24px 16px}h1{font-size:34px}.cards{grid-template-columns:repeat(2,1fr)}.card{padding:14px}.card strong{font-size:32px}}@media print{body{background:white}main{max-width:none;padding:0}.toolbar{display:none}details{break-inside:auto}summary{break-after:avoid}.panel{break-inside:avoid}h1{font-size:30px}}
</style><main><header><p class="eyebrow">EGAILE / QUALITY REVIEW</p><h1>Website test results.</h1><p class="meta">17 October 2026 · Local regression and end-to-end workflows</p></header><div class="cards">${[
  ['PASS', 'Passed'],
  ['FAIL', 'Failed after fixes'],
  ['BLOCKED', 'Blocked'],
  ['NOT RUN', 'Not run'],
]
  .map(
    ([s, l]) =>
      `<div class="card"><strong class="${s.toLowerCase().replace(' ', '-')}">${count(s)}</strong>${l}</div>`,
  )
  .join(
    '',
  )}</div><div class="notice"><strong>Code fixes verified. Cloud launch still needs setup checks.</strong><br>Three product defects were corrected and retested. Blocked and unrun integrations are listed separately; they are not counted as passes.</div><h2>What was fixed</h2><div class="panel table-wrap"><table><tr><th>Defect</th><th>Before</th><th>Correction and retest</th><th>Final</th></tr>${fixes.map((r) => `<tr><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td class="status pass">PASS</td></tr>`).join('')}</table></div><h2>Remaining cloud checks</h2><div class="panel table-wrap"><table><tr><th>Check</th><th>Status</th><th>Why</th></tr>${groups
  .find((g) => g.name === 'Cloud readiness')
  .rows.map(
    (r) =>
      `<tr><td>${esc(r.name)}</td><td class="status ${r.status.toLowerCase().replace(' ', '-')}">${r.status}</td><td>${esc(evidence(r))}</td></tr>`,
  )
  .join(
    '',
  )}</table></div><h2>Scope and limits</h2><p>${esc(scope)}</p><p class="small">${esc(limitations)}</p><h2>Every recorded result</h2><div class="toolbar"><label for="status">Show</label><select id="status"><option value="">All statuses</option><option>PASS</option><option>FAIL</option><option>BLOCKED</option><option>NOT RUN</option></select><button onclick="document.querySelectorAll('details').forEach(d=>d.open=true);window.print()">Print / save PDF</button></div>${groups.map((g) => `<details><summary>${esc(g.name)} · ${g.rows.length} checks</summary><div class="table-wrap"><table><tr><th>ID</th><th>Check</th><th>Status</th><th>Evidence</th></tr>${g.rows.map((r) => `<tr data-status="${esc(r.status)}"><td>${esc(r.id)}</td><td>${esc(r.name)}</td><td class="status ${r.status.toLowerCase().replace(' ', '-')}">${esc(r.status)}</td><td>${esc(evidence(r))}</td></tr>`).join('')}</table></div></details>`).join('')}<h2>Test-environment notes</h2><p class="small">${esc(note)}</p><p class="small">Reference: <a href="https://developers.google.com/tag-platform/security/guides/csp">Google tag CSP guidance</a> · <a href="https://adoptium.net/installation/ci-scripts">Official portable Java download</a></p><script>document.getElementById('status').addEventListener('change',e=>{document.querySelectorAll('tr[data-status]').forEach(r=>r.hidden=!!e.target.value&&r.dataset.status!==e.target.value);if(e.target.value)document.querySelectorAll('details').forEach(d=>d.open=true)})</script></main></html>`;
const out = path.resolve('..', 'outputs');
await mkdir(out, { recursive: true });
await mkdir('docs', { recursive: true });
await writeFile(path.join(out, `egaile-qa-report-${day}.html`), html);
await writeFile(path.join(out, `egaile-qa-report-${day}.md`), md);
await writeFile(
  path.join(out, `egaile-qa-results-${day}.json`),
  JSON.stringify({ day, fixes, results }, null, 2),
);
await writeFile(path.join('docs', `qa-results-${day}.md`), md);
console.log(
  JSON.stringify({
    pass: count('PASS'),
    fail: count('FAIL'),
    blocked: count('BLOCKED'),
    notRun: count('NOT RUN'),
    report: path.join(out, `egaile-qa-report-${day}.html`),
  }),
);
