'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Members } from './Members';
import type { Permission } from '@/lib/permissions';
import { pagePath, type SiteContent, type ContentPage, type Section } from '@/lib/content';
type HistoryRow = {
  id: unknown;
  created_at: unknown;
  label: unknown;
};
type Lead = {
  id: unknown;
  reference: unknown;
  status: unknown;
  created_at: unknown;
  notification: unknown;
  body: Record<string, string>;
};
type Tab =
  'overview' | 'hero' | 'sections' | 'pages' | 'settings' | 'enquiries' | 'history' | 'members';
function Field({
  label,
  value,
  onChange,
  area = false,
  help = '',
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
  help?: string;
  type?: string;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {area ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {help && <small>{help}</small>}
    </label>
  );
}
export function Editor({
  initial,
  initialVersion,
  initialHistory,
  initialLeads,
  capabilities,
  identity,
  local,
}: {
  initial: SiteContent;
  initialVersion: number;
  initialHistory: HistoryRow[];
  initialLeads: unknown[];
  capabilities: Permission[];
  identity: string;
  local: boolean;
}) {
  const [site, setSite] = useState(initial),
    [version, setVersion] = useState(initialVersion),
    [tab, setTab] = useState<Tab>('overview'),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [history, setHistory] = useState(initialHistory),
    [leads, setLeads] = useState(initialLeads as Lead[]),
    [pageId, setPageId] = useState(initial.pages[0]?.id || ''),
    [filter, setFilter] = useState('All'),
    [deleting, setDeleting] = useState('');
  const allowed = (permission: Permission) => capabilities.includes(permission);
  const router = useRouter();
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function signout() {
    await fetch('/api/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
    router.refresh();
  }
  function change(fn: (draft: SiteContent) => void) {
    setSite((old) => {
      const next = structuredClone(old);
      fn(next);
      return next;
    });
    setDirty(true);
    setNotice('');
    setError('');
  }
  async function refresh() {
    const res = await fetch('/api/admin/content');
    if (!res.ok) throw new Error('Your session may have expired. Please sign in again.');
    const data = await res.json();
    setSite(data.site);
    setVersion(data.version);
    setHistory(data.history);
    setDirty(false);
  }
  async function contentAction(action: 'save' | 'publish' | 'restore', id?: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, site, version, id }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          res.status === 409
            ? 'Another window changed this draft. Export your content below before reloading.'
            : data.details?.join(' • ') ||
                'The change could not be saved. Please sign in again if your session expired.',
        );
      setVersion(data.version);
      setDirty(false);
      if (action === 'restore') {
        await refresh();
        setNotice('Earlier content restored to your draft. Preview and publish when ready.');
      } else {
        if (action === 'publish') {
          const r = await fetch('/api/admin/content');
          const d = await r.json();
          setHistory(d.history);
        }
        if (action === 'publish') {
          const live = await fetch('/api/content-version', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
          setNotice(
            live?.version === data.version
              ? 'Published and verified on the public content endpoint. Open the website to review it.'
              : 'Publication saved, but live propagation is not confirmed. Recheck the website before publishing again.',
          );
        } else setNotice('Draft saved. Preview shows the last saved draft.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  async function leadAction(
    action: 'status' | 'delete' | 'dispatch' | 'retry',
    id?: string,
    status?: string,
  ) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error('The enquiry action could not be completed.');
      setNotice(
        action === 'dispatch'
          ? result.configured
            ? 'Notification attempts processed.'
            : 'Email provider is not configured. Enquiries remain safely stored.'
          : action === 'delete'
            ? 'Enquiry deleted.'
            : action === 'retry'
              ? 'Notification requeued. Process due notifications to try delivery.'
              : 'Enquiry status updated.',
      );
      const r = await fetch('/api/admin/enquiries');
      setLeads((await r.json()).enquiries);
      setDeleting('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  function download(name: string, text: string, type = 'application/json') {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([text], { type }));
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  function csv() {
    const cell = (v: unknown) => {
      let s = String(v ?? '');
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    download(
      'egaile-enquiries.csv',
      [
        ['Reference', 'Date', 'Status', 'Name', 'Email', 'Company', 'Service', 'Message'],
        ...leads.map((l) => [
          l.reference,
          l.created_at,
          l.status,
          l.body.name,
          l.body.email,
          l.body.company,
          l.body.service,
          l.body.message,
        ]),
      ]
        .map((row) => row.map(cell).join(','))
        .join('\r\n'),
      'text/csv;charset=utf-8',
    );
  }
  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed.');
      change((s) => {
        s.hero.image = result.url;
      });
      setNotice('Image uploaded. Save a draft and preview before publishing.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  const currentPage = site.pages.find((p) => p.id === pageId);
  const updatePage = (fn: (p: ContentPage) => void) =>
    change((s) => {
      const p = s.pages.find((x) => x.id === pageId);
      if (p) fn(p);
    });
  function newPage() {
    const id = crypto.randomUUID();
    change((s) =>
      s.pages.push({
        id,
        type: 'page',
        slug: 'new-page-' + s.pages.length,
        published: false,
        title: 'Your new page',
        summary: 'Introduce the purpose of this page in a sentence.',
        body: 'Add your approved page content here.',
        deliverables: [],
        seoTitle: '',
        seoDescription: '',
      }),
    );
    setPageId(id);
    setTab('pages');
  }
  function addSection() {
    change((s) =>
      s.sections.push({
        id: crypto.randomUUID(),
        type: 'text',
        enabled: true,
        eyebrow: 'YOUR PERSPECTIVE',
        title: 'A new section',
        body: 'Tell your visitors something useful.',
        linkLabel: 'Start a conversation',
        linkHref: '/contact',
        items: [],
      }),
    );
  }
  const navigation: {
    id: Tab;
    label: string;
    icon: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'hero', label: 'Landing hero', icon: '◉' },
    { id: 'sections', label: 'Homepage sections', icon: '▤' },
    { id: 'pages', label: 'Pages & services', icon: '▧' },
    { id: 'settings', label: 'Site settings', icon: '⚙' },
    { id: 'enquiries', label: 'Enquiries', icon: '↗' },
    { id: 'history', label: 'History & recovery', icon: '↶' },
    { id: 'members', label: 'People & access', icon: '◎' },
  ].filter(
    (n) =>
      n.id === 'overview' ||
      (n.id === 'enquiries' && allowed('leads.read')) ||
      (n.id === 'members' && allowed('members.manage')) ||
      (!['enquiries', 'members'].includes(n.id) && allowed('content.read')),
  ) as { id: Tab; label: string; icon: string }[];
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <Link href="/" className="workspace-brand">
          EGAILE<span>.</span>
        </Link>
        <p className="workspace-caption">YOUR WEBSITE WORKSPACE</p>
        <nav aria-label="Workspace">
          {navigation.map((n) => (
            <button
              key={n.id}
              aria-current={tab === n.id ? 'page' : undefined}
              onClick={() => {
                setTab(n.id);
                setNotice('');
                setError('');
              }}
            >
              <span aria-hidden="true">{n.icon}</span>
              {n.label}
              {n.id === 'enquiries' && leads.length > 0 && <small>{leads.length}</small>}
            </button>
          ))}
        </nav>
        <div className="workspace-bottom">
          <span className="workspace-indicator" />
          {local ? 'Local edition' : 'Firebase edition'}
          <span>{identity}</span>
          <Link href="/" target="_blank">
            Open website ↗
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' }),
              });
              router.push('/admin/login');
              router.refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-toolbar">
          <div>
            <strong>{dirty ? 'Unsaved changes' : 'Content up to date'}</strong>
            <small>Draft version {version}</small>
          </div>
          <div>
            <a href="/preview" target="_blank" rel="noreferrer" className="editor-button">
              Preview draft ↗
            </a>
            <button
              disabled={busy || !allowed('content.write')}
              className="editor-button"
              onClick={() => contentAction('save')}
            >
              Save draft
            </button>
            <button
              disabled={busy || !allowed('content.publish')}
              className="editor-button filled"
              onClick={() => contentAction('publish')}
            >
              {busy ? 'Working…' : 'Publish changes ↗'}
            </button>
            <button className="editor-button" onClick={signout}>
              Sign out
            </button>
          </div>
        </header>
        <main className="workspace-content">
          <div className="workspace-title">
            <p className="eyebrow">EGAILE / MANAGE YOUR WEBSITE</p>
            <h1>{navigation.find((n) => n.id === tab)?.label}</h1>
            <p>
              {
                {
                  overview:
                    'Your content. Your decisions. A simple place to keep everything moving.',
                  hero: 'Make a strong first impression. Change the words, artwork and motion without editing code.',
                  sections: 'Choose what visitors see, and the order in which they see it.',
                  pages: 'Create and maintain pages from supported templates.',
                  settings: 'Keep your identity, contact details and navigation consistent.',
                  enquiries:
                    'Every accepted request is stored here, even when email is not configured.',
                  history:
                    'Recover an earlier published version, then preview before publishing again.',
                  members: 'Give each person an individual account and the access they need.',
                }[tab]
              }
            </p>
          </div>
          {error && (
            <div className="editor-alert error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="editor-alert success" role="status">
              {notice}
            </div>
          )}
          {tab === 'overview' && (
            <>
              <div className="overview-grid">
                <button disabled={!allowed('content.read')} onClick={() => setTab('hero')}>
                  <span>01 / FIRST IMPRESSIONS</span>
                  <h2>Shape your landing page</h2>
                  <p>Update your hero, headline and calls to action.</p>
                  <b>Open hero editor ↗</b>
                </button>
                <button disabled={!allowed('content.read')} onClick={() => setTab('pages')}>
                  <span>02 / YOUR EXPERTISE</span>
                  <h2>Grow your website</h2>
                  <p>{site.pages.length} pages. Add services, industries and articles.</p>
                  <b>Manage pages ↗</b>
                </button>
                <button disabled={!allowed('leads.read')} onClick={() => setTab('enquiries')}>
                  <span>03 / CONVERSATIONS</span>
                  <h2>Follow up enquiries</h2>
                  <p>{leads.length} recent requests visible to your account.</p>
                  <b>Review enquiries ↗</b>
                </button>
              </div>
              <div className="editor-card">
                <h2>A simple publishing rhythm</h2>
                <ol className="publishing-steps">
                  <li>
                    <strong>Edit</strong>
                    <p>Change your content using the fields in this workspace.</p>
                  </li>
                  <li>
                    <strong>Save & preview</strong>
                    <p>Save the draft, then open its private preview.</p>
                  </li>
                  <li>
                    <strong>Publish</strong>
                    <p>Make the reviewed draft visible on the website.</p>
                  </li>
                </ol>
                <p className="editor-help">
                  Preview shows the last saved draft. The public website shows only published
                  content. New page types and new API integrations need technical work.
                </p>
              </div>
              <div className="editor-card">
                <h2>What is connected?</h2>
                <div className="connection-list">
                  <span>
                    Content editing <b>{local ? 'Local persistence' : 'Firebase configured'}</b>
                  </span>
                  <span>
                    Enquiry database <b>{local ? 'Local persistence' : 'Firebase configured'}</b>
                  </span>
                  <span>
                    Email delivery <b>Needs configuration</b>
                  </span>
                  <span>
                    Data mode{' '}
                    <b>
                      {local
                        ? 'Local · Firebase not connected'
                        : 'Firebase · verify project services'}
                    </b>
                  </span>
                </div>
              </div>
            </>
          )}
          {tab === 'hero' && (
            <div className="editor-two-column">
              <div className="editor-card">
                <h2>Your hero content</h2>
                <Field
                  label="Small heading"
                  value={site.hero.eyebrow}
                  onChange={(v) =>
                    change((s) => {
                      s.hero.eyebrow = v;
                    })
                  }
                />
                <Field
                  label="Main headline"
                  value={site.hero.title}
                  area
                  help="A new line creates a deliberate line break."
                  onChange={(v) =>
                    change((s) => {
                      s.hero.title = v;
                    })
                  }
                />
                <Field
                  label="Description"
                  value={site.hero.description}
                  area
                  onChange={(v) =>
                    change((s) => {
                      s.hero.description = v;
                    })
                  }
                />
                <div className="editor-fields-row">
                  <Field
                    label="Button label"
                    value={site.hero.ctaLabel}
                    onChange={(v) =>
                      change((s) => {
                        s.hero.ctaLabel = v;
                      })
                    }
                  />
                  <Field
                    label="Button destination"
                    value={site.hero.ctaHref}
                    onChange={(v) =>
                      change((s) => {
                        s.hero.ctaHref = v;
                      })
                    }
                  />
                </div>
                <label className="editor-check">
                  <input
                    type="checkbox"
                    checked={site.hero.animation}
                    onChange={(e) =>
                      change((s) => {
                        s.hero.animation = e.target.checked;
                      })
                    }
                  />
                  Enable gentle hero motion (visitors can pause it)
                </label>
              </div>
              <div className="editor-card">
                <h2>Hero artwork</h2>
                {site.hero.image && (
                  <img
                    className="editor-image-preview"
                    src={site.hero.image}
                    alt={site.hero.imageAlt}
                  />
                )}
                <label className="editor-check">
                  <input
                    type="checkbox"
                    checked={site.hero.imageDecorative}
                    onChange={(e) =>
                      change((s) => {
                        s.hero.imageDecorative = e.target.checked;
                        if (e.target.checked) s.hero.imageAlt = '';
                      })
                    }
                  />
                  This image is decorative
                </label>
                <label className="upload-button">
                  Upload replacement image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload(f);
                    }}
                  />
                </label>
                <p className="editor-help">
                  PNG, JPEG or WebP. Up to 8 MB. Images used on the website are public assets.
                </p>
                <Field
                  label="Image URL"
                  value={site.hero.image}
                  onChange={(v) =>
                    change((s) => {
                      s.hero.image = v;
                    })
                  }
                />
                <Field
                  label="Image description"
                  value={site.hero.imageAlt}
                  area
                  onChange={(v) =>
                    change((s) => {
                      s.hero.imageAlt = v;
                    })
                  }
                />
              </div>
            </div>
          )}
          {tab === 'sections' && (
            <>
              <div className="editor-section-actions">
                <span>{site.sections.length} sections · arrange with the arrow buttons</span>
                <button className="editor-button filled" onClick={addSection}>
                  Add section +
                </button>
              </div>
              {site.sections.map((section, index) => (
                <details className="editor-card section-editor" key={section.id}>
                  <summary>
                    <span className="section-order">{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <strong>{section.title.replace(/\n/g, ' ')}</strong>
                      <small>
                        {section.type} · {section.enabled ? 'Visible' : 'Hidden'}
                      </small>
                    </span>
                    <span aria-hidden="true">⌄</span>
                  </summary>
                  <div className="section-editor-body">
                    <div className="editor-action-row">
                      <label className="editor-check">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={(e) =>
                            change((s) => {
                              s.sections[index].enabled = e.target.checked;
                            })
                          }
                        />
                        Show this section
                      </label>
                      <button
                        className="editor-button"
                        disabled={index === 0}
                        onClick={() =>
                          change((s) => {
                            [s.sections[index - 1], s.sections[index]] = [
                              s.sections[index],
                              s.sections[index - 1],
                            ];
                          })
                        }
                      >
                        Move up ↑
                      </button>
                      <button
                        className="editor-button"
                        disabled={index === site.sections.length - 1}
                        onClick={() =>
                          change((s) => {
                            [s.sections[index + 1], s.sections[index]] = [
                              s.sections[index],
                              s.sections[index + 1],
                            ];
                          })
                        }
                      >
                        Move down ↓
                      </button>
                    </div>
                    <label className="editor-field">
                      <span>Section template</span>
                      <select
                        value={section.type}
                        onChange={(e) =>
                          change((s) => {
                            s.sections[index].type = e.target.value as Section['type'];
                          })
                        }
                      >
                        {['services', 'method', 'spotlight', 'text', 'faq', 'cta'].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    {(['eyebrow', 'title', 'body', 'linkLabel', 'linkHref'] as const).map((key) => (
                      <Field
                        key={key}
                        label={
                          {
                            eyebrow: 'Small heading',
                            title: 'Section heading',
                            body: 'Description',
                            linkLabel: 'Link label',
                            linkHref: 'Link destination',
                          }[key]
                        }
                        value={section[key]}
                        area={key === 'body' || key === 'title'}
                        onChange={(v) =>
                          change((s) => {
                            s.sections[index][key] = v;
                          })
                        }
                      />
                    ))}
                    {section.items.map((item, i) => (
                      <div className="editor-item" key={i}>
                        <Field
                          label={`Item ${i + 1} title`}
                          value={item.title}
                          onChange={(v) =>
                            change((s) => {
                              s.sections[index].items[i].title = v;
                            })
                          }
                        />
                        <Field
                          label="Item description"
                          area
                          value={item.body}
                          onChange={(v) =>
                            change((s) => {
                              s.sections[index].items[i].body = v;
                            })
                          }
                        />
                        <button
                          className="editor-text-button danger"
                          onClick={() =>
                            change((s) => {
                              s.sections[index].items.splice(i, 1);
                            })
                          }
                        >
                          Remove item
                        </button>
                      </div>
                    ))}
                    <button
                      className="editor-button"
                      onClick={() =>
                        change((s) => {
                          s.sections[index].items.push({
                            title: 'New item',
                            body: 'Add your description.',
                          });
                        })
                      }
                    >
                      Add item +
                    </button>
                    <button
                      className="editor-text-button danger"
                      onClick={() =>
                        change((s) => {
                          s.sections.splice(index, 1);
                        })
                      }
                    >
                      Remove this section from draft
                    </button>
                  </div>
                </details>
              ))}
            </>
          )}
          {tab === 'pages' && (
            <div className="pages-workspace">
              <aside className="page-list">
                <button className="editor-button filled" onClick={newPage}>
                  Create page +
                </button>
                {site.pages.map((p) => (
                  <button
                    key={p.id}
                    className={p.id === pageId ? 'selected' : ''}
                    onClick={() => setPageId(p.id)}
                  >
                    <strong>{p.title.replace(/\n/g, ' ')}</strong>
                    <small>
                      {p.type} · {p.published ? 'Published in draft' : 'Unpublished'}
                    </small>
                  </button>
                ))}
              </aside>
              {currentPage && (
                <div className="editor-card">
                  <h2>Edit page</h2>
                  <p className="editor-help">
                    Path: {pagePath(currentPage)}. Changing the slug creates a redirect when
                    published.
                  </p>
                  <div className="editor-fields-row">
                    <label className="editor-field">
                      <span>Page template</span>
                      <select
                        value={currentPage.type}
                        onChange={(e) =>
                          updatePage((p) => {
                            p.type = e.target.value as ContentPage['type'];
                          })
                        }
                      >
                        {['service', 'industry', 'article', 'page'].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="URL slug"
                      value={currentPage.slug}
                      onChange={(v) =>
                        updatePage((p) => {
                          p.slug = v;
                        })
                      }
                    />
                  </div>
                  <Field
                    label="Page title"
                    area
                    value={currentPage.title}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.title = v;
                      })
                    }
                  />
                  <Field
                    label="Summary"
                    area
                    value={currentPage.summary}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.summary = v;
                      })
                    }
                  />
                  <Field
                    label="Main content"
                    area
                    help="Separate paragraphs with a blank line. Text is rendered safely without HTML."
                    value={currentPage.body}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.body = v;
                      })
                    }
                  />
                  <Field
                    label="Deliverables or topics"
                    area
                    help="One item per line."
                    value={currentPage.deliverables.join('\n')}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.deliverables = v.split('\n');
                      })
                    }
                  />
                  <Field
                    label="Search title"
                    value={currentPage.seoTitle}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.seoTitle = v;
                      })
                    }
                  />
                  <Field
                    label="Search description"
                    area
                    value={currentPage.seoDescription}
                    onChange={(v) =>
                      updatePage((p) => {
                        p.seoDescription = v;
                      })
                    }
                  />
                  <label className="editor-check">
                    <input
                      type="checkbox"
                      checked={currentPage.published}
                      onChange={(e) =>
                        updatePage((p) => {
                          p.published = e.target.checked;
                        })
                      }
                    />
                    Include this page when you publish the draft
                  </label>
                  <Link
                    className="editor-button"
                    href={'/preview?page=' + currentPage.id}
                    target="_blank"
                  >
                    Preview saved page ↗
                  </Link>
                  <p className="editor-help">
                    A page is publicly visible only after “Publish changes”. Link it from Site
                    settings → Navigation so visitors can find it.
                  </p>
                  <button
                    className="editor-text-button danger"
                    onClick={() =>
                      change((s) => {
                        s.pages = s.pages.filter((p) => p.id !== pageId);
                        setPageId(s.pages[0]?.id || '');
                      })
                    }
                  >
                    Remove page from draft
                  </button>
                </div>
              )}
            </div>
          )}
          {tab === 'settings' && (
            <>
              <div className="editor-card">
                <h2>Identity & contact</h2>
                <Field
                  label="Tagline"
                  value={site.tagline}
                  onChange={(v) =>
                    change((s) => {
                      s.tagline = v;
                    })
                  }
                />
                <Field
                  label="Public contact email"
                  value={site.contactEmail}
                  help="Leave empty until your approved business address is ready."
                  onChange={(v) =>
                    change((s) => {
                      s.contactEmail = v;
                    })
                  }
                />
                <Field
                  label="Contact guidance"
                  area
                  value={site.contactNote}
                  onChange={(v) =>
                    change((s) => {
                      s.contactNote = v;
                    })
                  }
                />
                <label className="editor-field">
                  <span>Visual preset</span>
                  <select
                    value={site.theme}
                    onChange={(e) =>
                      change((s) => {
                        s.theme = e.target.value as SiteContent['theme'];
                      })
                    }
                  >
                    <option value="ocean">Ocean · blue and cyan</option>
                    <option value="midnight">Midnight · indigo and silver</option>
                  </select>
                </label>
              </div>
              <div className="editor-card">
                <h2>Navigation</h2>
                {site.menu.map((item, i) => (
                  <div className="editor-menu-row" key={i}>
                    <Field
                      label="Label"
                      value={item.label}
                      onChange={(v) =>
                        change((s) => {
                          s.menu[i].label = v;
                        })
                      }
                    />
                    <Field
                      label="Destination"
                      value={item.href}
                      onChange={(v) =>
                        change((s) => {
                          s.menu[i].href = v;
                        })
                      }
                    />
                    <button
                      className="editor-text-button danger"
                      onClick={() =>
                        change((s) => {
                          s.menu.splice(i, 1);
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="editor-button"
                  disabled={site.menu.length >= 8}
                  onClick={() =>
                    change((s) => {
                      s.menu.push({ label: 'New link', href: '/contact' });
                    })
                  }
                >
                  Add menu link +
                </button>
              </div>
              <div className="editor-card">
                <h2>Homepage search information</h2>
                <Field
                  label="Search title"
                  value={site.seo.title}
                  onChange={(v) =>
                    change((s) => {
                      s.seo.title = v;
                    })
                  }
                />
                <Field
                  label="Search description"
                  area
                  value={site.seo.description}
                  onChange={(v) =>
                    change((s) => {
                      s.seo.description = v;
                    })
                  }
                />
                <p className="editor-help">
                  This local edition is excluded from search indexing. Public indexing, privacy
                  policy and business facts need a release review.
                </p>
              </div>
            </>
          )}
          {tab === 'enquiries' && (
            <>
              <div className="editor-action-row">
                <label className="editor-field compact">
                  <span>Filter by status</span>
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {[
                      'All',
                      'New',
                      'Reviewed',
                      'Contacted',
                      'Qualified',
                      'Unqualified',
                      'Closed',
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <button className="editor-button" onClick={csv}>
                  Export displayed enquiries ↓
                </button>
                <button
                  className="editor-button"
                  disabled={busy}
                  onClick={() => leadAction('dispatch')}
                >
                  Retry notifications ↗
                </button>
              </div>
              {leads.length === 0 ? (
                <div className="editor-card empty-state">
                  <h2>The next conversation starts here.</h2>
                  <p>
                    Submit a test enquiry through your contact page. It will appear here after it is
                    saved.
                  </p>
                  <Link href="/contact" className="text-link" target="_blank">
                    Open contact form ↗
                  </Link>
                </div>
              ) : (
                leads
                  .filter((l) => filter === 'All' || l.status === filter)
                  .map((l) => (
                    <article className="editor-card lead-card" key={String(l.id)}>
                      <div className="lead-header">
                        <div>
                          <small>
                            {String(l.reference)} ·{' '}
                            {new Date(String(l.created_at)).toLocaleString()}
                          </small>
                          <h2>{l.body.name}</h2>
                          <p>
                            {l.body.company} · <a href={'mailto:' + l.body.email}>{l.body.email}</a>
                          </p>
                        </div>
                        <label className="editor-field compact">
                          <span>Status</span>
                          <select
                            value={String(l.status)}
                            disabled={busy}
                            onChange={(e) => leadAction('status', String(l.id), e.target.value)}
                          >
                            {[
                              String(l.status),
                              ...((
                                {
                                  New: ['Reviewed'],
                                  Reviewed: ['Contacted', 'Unqualified'],
                                  Contacted: ['Qualified', 'Unqualified'],
                                  Qualified: ['Closed'],
                                  Unqualified: ['Closed'],
                                  Closed: [],
                                } as Record<string, string[]>
                              )[String(l.status)] || []),
                            ].map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <p className="lead-message">{l.body.message}</p>
                      {l.notification === 'failed' && (
                        <button
                          className="editor-button"
                          disabled={busy}
                          onClick={() => leadAction('retry', String(l.id))}
                        >
                          Requeue failed notification
                        </button>
                      )}
                      <p className="editor-help">
                        Industry: {l.body.industryLabel || 'Not specified'} · Process:{' '}
                        {l.body.processArea || 'Not specified'} · Interest:{' '}
                        {l.body.serviceLabel || l.body.service || 'Not specified'} · Country:{' '}
                        {l.body.country || 'Not specified'} · Notification:{' '}
                        {String(l.notification || 'pending')}
                        {l.notification === 'pending' ? ' (email may not be configured)' : ''}
                      </p>
                      {deleting === String(l.id) ? (
                        <div className="delete-confirm">
                          <p>
                            This permanently deletes this enquiry and its delivery records from the
                            local database.
                          </p>
                          <button
                            className="editor-button danger"
                            disabled={busy}
                            onClick={() => leadAction('delete', String(l.id))}
                          >
                            Delete permanently
                          </button>
                          <button className="editor-button" onClick={() => setDeleting('')}>
                            Keep enquiry
                          </button>
                        </div>
                      ) : (
                        allowed('leads.delete') && (
                          <button
                            className="editor-text-button danger"
                            onClick={() => setDeleting(String(l.id))}
                          >
                            Delete enquiry…
                          </button>
                        )
                      )}
                    </article>
                  ))
              )}
            </>
          )}
          {tab === 'members' && <Members local={local} />}
          {tab === 'history' && (
            <>
              <div className="editor-card">
                <h2>Export your content</h2>
                <p>
                  Download the current draft as a portable JSON file. Enquiries are kept separate.
                  The initial content payload limit is 280 KB; larger catalogues require a
                  content-storage extension.
                </p>
                <button
                  className="editor-button"
                  onClick={() =>
                    download('egaile-content-draft.json', JSON.stringify(site, null, 2))
                  }
                >
                  Export draft ↓
                </button>
                <label className="upload-button">
                  Import content draft
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      try {
                        const f = e.target.files?.[0];
                        if (!f || f.size > 300000)
                          throw new Error('Choose a content export smaller than 300 KB.');
                        const imported = JSON.parse(await f.text());
                        const { siteSchema } = await import('@/lib/content');
                        setSite(siteSchema.parse(imported));
                        setDirty(true);
                        setNotice(
                          'Content imported into the editor. Save and preview before publishing.',
                        );
                      } catch {
                        setError('The import is not a valid EGAILE content export.');
                      }
                    }}
                  />
                </label>
              </div>
              <div className="editor-card">
                <h2>Earlier published content</h2>
                <p className="editor-help">
                  Each publication preserves the previously published version. Restoring loads it
                  into a draft; it does not change the live website until you publish.
                </p>
                {history.length === 0 ? (
                  <p>No publications yet. Your first publication will create a recovery point.</p>
                ) : (
                  history.map((r) => (
                    <div className="history-row" key={String(r.id)}>
                      <div>
                        <strong>{String(r.label)}</strong>
                        <small>{new Date(String(r.created_at)).toLocaleString()}</small>
                      </div>
                      <button
                        className="editor-button"
                        disabled={busy}
                        onClick={() => contentAction('restore', String(r.id))}
                      >
                        Restore to draft ↶
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
        <footer className="workspace-footer">
          {local
            ? 'Local development · content and test enquiries persist on this computer. Firebase is not connected.'
            : 'Firebase workspace · content and enquiry access follows your staff permissions.'}
        </footer>
      </div>
    </div>
  );
}
