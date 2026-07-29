/**
 * Reads the posts Magnet publishes into `content/feed/`.
 *
 * Magnet's GitHub publisher writes one file per feed item at
 * `content/feed/{uuid}-{slug}.md` and sends the body ONLY — no YAML
 * front-matter. So there is no `title:` key to read: we derive the title from
 * the first heading in the document, and the URL slug from the filename with
 * the leading UUID stripped.
 *
 * Keeping the derivation here (rather than asking Magnet to emit front-matter)
 * is deliberate: it lets the publisher stay exactly as it shipped, so what gets
 * tested is the real code path rather than a version adjusted to suit the site.
 */
const modules = import.meta.glob("../../content/feed/*.md", { eager: true });

const UUID_PREFIX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;

export const posts = Object.entries(modules)
  .map(([path, mod]) => {
    const filename = path.split("/").pop().replace(/\.md$/, "");
    const slug = filename.replace(UUID_PREFIX, "") || filename;

    const headings = typeof mod.getHeadings === "function" ? mod.getHeadings() : [];
    // Prefer the h1 (the real post title); the generated body opens with
    // scaffolding h2s like "SEO Details", which make poor titles.
    const h1 = headings.find((h) => h.depth === 1);
    const title =
      mod.frontmatter?.title ??
      h1?.text ??
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      slug,
      title,
      Content: mod.Content,
      frontmatter: mod.frontmatter ?? {},
      // Astro assigns an id to every heading it renders, so these double as the
      // anchor targets for the on-this-page nav. h1 is excluded: it is the post
      // title, not a section you navigate to.
      headings: headings.filter((h) => h.depth === 2),
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
