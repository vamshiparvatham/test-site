import { defineConfig } from "astro/config";

// Static output: Render serves the built `dist/` as a plain static site.
// Everything in `public/` (the original hand-written index.html, pages/,
// robots.txt, sitemap.xml, llms*.txt) is copied through untouched, so the
// pre-existing site keeps working exactly as before.
export default defineConfig({
  site: "https://test-site-zf5g.onrender.com",
  output: "static",
});
