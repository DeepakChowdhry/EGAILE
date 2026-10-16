import { randomUUID, createHash } from 'node:crypto';
import { defaultSite, pagePath, siteSchema, type SiteContent } from '@/lib/content';
import { readStore, transaction, type Store, type RecordData } from './db';
import { backend } from './db';
import { unstable_cache } from 'next/cache';
type Head = RecordData & { version: number; settings: Omit<SiteContent, 'pages'> };
const settings = (s: SiteContent) => {
  const { pages, ...rest } = s;
  void pages;
  return rest;
};
async function getDraft(store: Store): Promise<{ site: SiteContent; version: number }> {
  const head = await store.get<Head>('contentDrafts', 'site');
  if (!head) return { site: structuredClone(defaultSite), version: 1 };
  const pages = await store.list<RecordData & { page: SiteContent['pages'][number] }>(
    'draftPages',
    151,
  );
  if (pages.length > 150) throw new Error('CONTENT_LIMIT');
  return {
    site: siteSchema.parse({ ...head.settings, pages: pages.map((p) => p.page) }),
    version: head.version,
  };
}
async function loadPublished(): Promise<{ site: SiteContent; version: number }> {
  const head = await (
    await readStore()
  ).get<RecordData & { site: SiteContent; version: number }>('publishedContent', 'site');
  if (!head) return { site: structuredClone(defaultSite), version: 1 };
  return { site: siteSchema.parse(head.site), version: head.version };
}
const cachedPublished = unstable_cache(loadPublished, ['egaile-public-content-v1'], {
  tags: ['egaile-public-content'],
  revalidate: 60,
});
export async function readContent(draft = false): Promise<{ site: SiteContent; version: number }> {
  if (draft) return transaction(getDraft);
  return backend() === 'firebase' && process.env.NODE_ENV !== 'test'
    ? cachedPublished()
    : loadPublished();
}
export async function writeContent(
  input: unknown,
  version: number,
  action: 'save' | 'publish',
  actor = 'local-owner',
) {
  const site = siteSchema.parse(input);
  if (Buffer.byteLength(JSON.stringify(site)) > 280000) throw new Error('CONTENT_LIMIT');
  return transaction(async (store) => {
    const current = await getDraft(store);
    const previous = await store.get<RecordData & { site: SiteContent }>(
      'publishedContent',
      'site',
    );
    const redirects = await store.list<RecordData & { old_path: string; new_path: string }>(
      'redirects',
      300,
    );
    if (current.version !== version) throw new Error('VERSION_CONFLICT');
    const nextVersion = version + 1,
      now = new Date().toISOString();
    if (action === 'publish') {
      const prior = previous?.site || defaultSite;
      await store.set('contentRevisions', randomUUID(), {
        site: prior,
        created_at: now,
        label: 'Before publication',
        actor,
      });
      const changes = new Map<string, string>();
      for (const old of prior.pages) {
        const next = site.pages.find((p) => p.id === old.id && p.published);
        if (next && pagePath(old) !== pagePath(next)) changes.set(pagePath(old), pagePath(next));
      }
      const livePaths = new Set(site.pages.filter((p) => p.published).map(pagePath));
      for (const redirect of redirects) {
        const target = changes.get(redirect.new_path) || redirect.new_path;
        if (livePaths.has(redirect.old_path) || !livePaths.has(target))
          await store.delete('redirects', redirect.id);
        else
          await store.set('redirects', redirect.id, {
            old_path: redirect.old_path,
            new_path: target,
          });
      }
      for (const [oldPath, newPath] of changes)
        if (!livePaths.has(oldPath))
          await store.set('redirects', createHash('sha256').update(oldPath).digest('hex'), {
            old_path: oldPath,
            new_path: newPath,
          });
      await store.set('publishedContent', 'site', {
        site: { ...site, pages: site.pages.filter((p) => p.published) },
        version: nextVersion,
        published_at: now,
        actor,
      });
    }
    await store.set('contentDrafts', 'site', {
      settings: settings(site),
      version: nextVersion,
      updated_at: now,
      actor,
    });
    for (const page of site.pages) await store.set('draftPages', page.id, { page });
    for (const page of current.site.pages)
      if (!site.pages.some((p) => p.id === page.id)) await store.delete('draftPages', page.id);
    await store.set('auditEvents', randomUUID(), {
      actor,
      action: 'content.' + action,
      entity: 'site',
      created_at: now,
    });
    return nextVersion;
  });
}
export async function history() {
  return (await readStore())
    .list<RecordData & { created_at: string; label: string }>('contentRevisions', 30, 'created_at')
    .then((rows) => rows.map(({ id, created_at, label }) => ({ id, created_at, label })));
}
export async function restoreContent(id: string, version: number, actor = 'local-owner') {
  const row = await (
    await readStore()
  ).get<RecordData & { site: SiteContent }>('contentRevisions', id);
  if (!row) throw new Error('NOT_FOUND');
  return writeContent(row.site, version, 'save', actor);
}
export async function lookupRedirect(oldPath: string) {
  const row = await (
    await readStore()
  ).get<RecordData & { new_path: string }>(
    'redirects',
    createHash('sha256').update(oldPath).digest('hex'),
  );
  return row?.new_path || null;
}
