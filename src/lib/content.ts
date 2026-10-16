import seed from './seed.json';
import { z } from 'zod';
const destination = z
  .string()
  .max(500)
  .refine(
    (v) =>
      /^\/(?!\/)[^\\\s]*$/.test(v) ||
      /^https:\/\/[^\s]+$/.test(v) ||
      /^mailto:[^\s@]+@[^\s@]+$/.test(v),
    'Use a site path, HTTPS URL or email link.',
  );
const image = z
  .string()
  .max(1000)
  .refine(
    (v) => v === '' || /^\/(?!\/)[^\\\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v),
    'Use an uploaded image or HTTPS image URL.',
  );
export const pageSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(90),
  type: z.enum(['service', 'industry', 'article', 'page']),
  published: z.boolean(),
  title: z.string().min(3).max(110),
  summary: z.string().min(10).max(400),
  body: z.string().max(16000),
  deliverables: z
    .array(z.string().trim().max(220))
    .max(12)
    .transform((items) => items.filter(Boolean)),
  seoTitle: z.string().max(120),
  seoDescription: z.string().max(320),
});
export const sectionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['services', 'method', 'spotlight', 'text', 'faq', 'cta']),
  enabled: z.boolean(),
  eyebrow: z.string().max(80),
  title: z.string().min(3).max(150),
  body: z.string().max(2500),
  linkLabel: z.string().max(60),
  linkHref: destination,
  items: z
    .array(z.object({ title: z.string().min(1).max(160), body: z.string().max(900) }))
    .max(12),
});
export const siteSchema = z
  .object({
    name: z.literal('EGAILE'),
    tagline: z.string().min(3).max(100),
    contactEmail: z.union([z.email(), z.literal('')]),
    contactNote: z.string().max(500),
    hero: z.object({
      eyebrow: z.string().min(3).max(100),
      title: z.string().min(5).max(120),
      description: z.string().min(15).max(450),
      image: image,
      imageAlt: z.string().max(240),
      imageDecorative: z.boolean().default(false),
      ctaLabel: z.string().min(2).max(60),
      ctaHref: destination,
      animation: z.boolean(),
    }),
    menu: z
      .array(z.object({ label: z.string().min(1).max(35), href: destination }))
      .min(1)
      .max(8),
    sections: z.array(sectionSchema).max(18),
    pages: z.array(pageSchema).max(150),
    seo: z.object({ title: z.string().min(5).max(120), description: z.string().min(15).max(320) }),
    theme: z.enum(['ocean', 'midnight']),
    privacyVersion: z.literal('website-preview-v1'),
  })
  .superRefine((site, ctx) => {
    if (site.hero.image && !site.hero.imageDecorative && !site.hero.imageAlt.trim())
      ctx.addIssue({
        code: 'custom',
        path: ['hero', 'imageAlt'],
        message: 'Describe the image or explicitly mark it decorative.',
      });
    const paths = new Set<string>();
    const reserved = new Set([
      'admin',
      'api',
      'contact',
      'privacy',
      'cookies',
      'services',
      'solutions',
      'industries',
      'insights',
      'preview',
      'media',
      'health',
    ]);
    site.pages.forEach((p, i) => {
      const path = pagePath(p);
      if (paths.has(path) || reserved.has(p.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['pages', i, 'slug'],
          message: 'Duplicate or reserved page path.',
        });
      }
      paths.add(path);
    });
    for (const collection of [site.pages.map((x) => x.id), site.sections.map((x) => x.id)])
      if (new Set(collection).size !== collection.length)
        ctx.addIssue({ code: 'custom', message: 'Duplicate item identifiers.' });
    const publishedPaths = new Set([
      '/',
      '/services',
      '/solutions',
      '/industries',
      '/insights',
      '/contact',
      '/privacy',
      '/cookies',
      ...site.pages.filter((p) => p.published).map(pagePath),
    ]);
    const links = [
      ...site.menu.map((x) => x.href),
      site.hero.ctaHref,
      ...site.sections.filter((s) => s.enabled && s.linkLabel).map((s) => s.linkHref),
    ];
    for (const link of links)
      if (link.startsWith('/') && !publishedPaths.has(link.split(/[?#]/)[0]))
        ctx.addIssue({
          code: 'custom',
          message: `The link ${link} does not point to a published page. Update the link before saving.`,
        });
  });
export type SiteContent = z.infer<typeof siteSchema>;
export type ContentPage = z.infer<typeof pageSchema>;
export type Section = z.infer<typeof sectionSchema>;
export function pagePath(p: Pick<ContentPage, 'type' | 'slug'>) {
  return (
    (p.type === 'service'
      ? '/services/'
      : p.type === 'industry'
        ? '/industries/'
        : p.type === 'article'
          ? '/insights/'
          : '/') + p.slug
  );
}
export const defaultSite: SiteContent = siteSchema.parse(seed);
