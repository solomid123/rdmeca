# R&D MECA public application

React/Vinext public company website with Cloudflare D1 persistence. French and English pages cover the company, six engineering/maintenance services, five industries, method, portfolio, journal, videos, press, contact and privacy. Database content provides five journal articles, eight attributed professional project studies, six clearly labelled application examples, two announcements and two illustrative industrial videos in each language. The complete sitemap contains 90 public page URLs once both content sets are populated.

No private dashboard or customer workspace is part of the site. Public content reads are separate from private enquiries. The contact form saves validated enquiries to D1 and returns a unique reference; repeated submissions with the same submission key are idempotent. It does not send automatic email notifications. Email, phone and WhatsApp links use the owner's supplied contact details.

## Development and checks

Use the Sites dependency/build helpers, preserving `sites()` and the Cloudflare Worker entry point. `npm run dev -- --port 4173 --hostname 127.0.0.1` serves the local application. `npm run db:generate` generates schema migrations. Apply each pending migration once locally with Wrangler and `.wrangler/state` as documented in the starter.

`node scripts/seed-content.mjs http://127.0.0.1:4173` populates local editorial content after migrations. `node scripts/check-application.mjs` checks representative routes, public records, protected endpoints, video/download assets and metadata routes. `node scripts/check-enquiry.mjs` checks persistence and retries using only the local database. `node node_modules/typescript/bin/tsc --noEmit` checks TypeScript.

## Runtime configuration

`CMS_WRITE_TOKEN` is a secret used only by protected content-update and enquiry-reading endpoints. Store it in Sites runtime settings; local `.dev.vars` is ignored. Never put the value in source or client code. `/api/cms/seed` accepts validated content updates; `/api/cms/enquiries` allows authorized server-side retrieval. Both fail closed without the secret. There is no public list of enquiries.

Editorial seed content is in `editorial-seed.mjs` and `professional-case-studies.mjs`, separate from schema migrations. The full local seed includes both content sets. Production migrations run during deployment; editorial content is populated afterward through the protected content endpoint. The host-seeding script reads its credential from stdin. Contact data is not part of seeds or deployment archives. Use the targeted project publisher when adding only the professional studies to an existing live site.

## Search content

`app/search-copy.ts` defines French and English search titles and descriptions for the main pages, six services and five sectors. Service pages explain project inputs and deliverables through `app/service-guide.tsx`, with nationwide Morocco coverage and related-service links defined in `app/service-guides.ts`. `lib/search-schema.ts` describes the real company, bilingual website, current page and service without inventing offices, ratings or completed client projects. Static-page sitemap dates use the explicit content update date in `search-copy.ts`; update it when those pages materially change. `node --experimental-strip-types scripts/check-live-search-pages.mjs` checks published search metadata, structured data and visible guidance; `scripts/check-live-indexing.mjs` checks all sitemap URLs and language links.

## Professional project studies

The owner supplied eight projects from Badreddine Barki’s professional experience at SLB Group and an R&D internship at Sigma, both in France. `professional-case-studies.mjs` contains the bilingual adaptations; `app/project-sources.mjs` maps context, duration and related services. The company publishes these adaptations and clearly credits the original author and employment context. These employers are not represented as R&D MECA clients. Results are reported as stated in the supplied material and are not extrapolated into company promises or testimonials. The owner requested that no personal-portfolio references or links be published; source provenance is retained only in the private workspace research notes.

Supplied study illustrations are resized WebP files in `public/assets/project-*.webp`; technical figures are displayed without cropping. Three priority studies are linked from the homepage, and all six services link to relevant studies. Project pages link to the related service pages. CreativeWork data identifies the original author, professional context and company publisher. Existing application examples remain published and visibly labelled.

After deploying the page code and images, `node scripts/publish-professional-projects.mjs --publish` updates only the 16 professional-study records using the ignored local content-update credential. It does not reseed other content or modify enquiries. `node scripts/check-live-professional-projects.mjs` checks the live study pages, source credits, images and links. The existing successful sitemap automatically includes the added URLs; this does not confirm that Google has indexed them.

## Brand and media

The current design uses the owner's November 2026 indigo/navy logo and silver variant. The colour logo appears in the header and downloads; the silver logo appears on the dark footer. `app/home-intro.tsx` defines the new homepage composition and `app/brand.css` defines the shared brand surfaces and responsive typography. Ordinary body text is 16–17px, supporting text is generally 13–15px, and headline sizes are restrained. Glass effects are limited to navigation and selected panels. The brand kit includes both new transparent logo variants.

Neue Einstellung is self-hosted using the unmodified WOFF2 files supplied by the owner in `neue-einstellung.zip`. `app/fonts.css` maps Regular, Medium, SemiBold, Bold and ExtraBold to weights 400, 500, 600, 700 and 800 under one font family. Both language versions use this family for headings, body text, navigation, forms and supporting text. The Regular and ExtraBold faces are preloaded, and the existing text-size scale is preserved. The files include the French accented characters used by the site.

Logo: supplied R&D MECA PNG with transparent margins cropped. Photos: aluminum Zheng ji and Jelifer Maniago / Unsplash. Videos: Daniel Smyth / Pexels. General brand media is illustrative and is never presented as R&D MECA facilities or completed client projects. Professional-study illustrations come from the credited project sources. Confirmed real company client projects can be published through the content API. A downloadable bilingual brand kit is included.

## Domain and business information

The production brand domain is https://rdmeca.com. `PUBLIC_SITE_URL` and the `content.mjs` fallback both use that origin; `getSiteOrigin()` supplies canonical URLs, language links, social metadata, robots and the sitemap. Public page routes use trailing slashes consistently. The Worker hostname and www domain redirect to the corresponding primary-domain pages. Google Search Console ownership verification and sitemap submission are separate account steps. Add the confirmed registered legal entity, address and any applicable local business disclosures. Current public contacts are contact@rdmeca.com and +33 7 45 76 80 10.
