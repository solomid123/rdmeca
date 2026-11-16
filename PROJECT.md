# R&D MECA public application

React/Vinext public company website with Cloudflare D1 persistence. French and English pages cover the company, six engineering/maintenance services, five industries, method, portfolio, journal, videos, press, contact and privacy. Database content provides five journal articles, six clearly labelled application examples, two announcements and two illustrative industrial videos in each language. The complete sitemap contains 74 public page URLs once content is populated.

No private dashboard or customer workspace is part of the site. Public content reads are separate from private enquiries. The contact form saves validated enquiries to D1 and returns a unique reference; repeated submissions with the same submission key are idempotent. It does not send automatic email notifications. Email, phone and WhatsApp links use the owner's supplied contact details.

## Development and checks

Use the Sites dependency/build helpers, preserving `sites()` and the Cloudflare Worker entry point. `npm run dev -- --port 4173 --hostname 127.0.0.1` serves the local application. `npm run db:generate` generates schema migrations. Apply each pending migration once locally with Wrangler and `.wrangler/state` as documented in the starter.

`node scripts/seed-content.mjs http://127.0.0.1:4173` populates local editorial content after migrations. `node scripts/check-application.mjs` checks representative routes, public records, protected endpoints, video/download assets and metadata routes. `node scripts/check-enquiry.mjs` checks persistence and retries using only the local database. `node node_modules/typescript/bin/tsc --noEmit` checks TypeScript.

## Runtime configuration

`CMS_WRITE_TOKEN` is a secret used only by protected content-update and enquiry-reading endpoints. Store it in Sites runtime settings; local `.dev.vars` is ignored. Never put the value in source or client code. `/api/cms/seed` accepts validated content updates; `/api/cms/enquiries` allows authorized server-side retrieval. Both fail closed without the secret. There is no public list of enquiries.

Editorial seed content is in `editorial-seed.mjs`, separate from schema migrations. Production migrations run during Sites deployment; editorial content is populated afterward through the protected content endpoint. The host-seeding script reads its credential from stdin. Contact data is not part of seeds or deployment archives.

## Brand and media

The current design uses the owner's November 2026 indigo/navy logo and silver variant. The colour logo appears in the header and downloads; the silver logo appears on the dark footer. `app/home-intro.tsx` defines the new homepage composition and `app/brand.css` defines the shared brand surfaces, responsive layouts and larger typography. Ordinary body text is 18–21px and supporting text is at least 16px. Glass effects are restrained to navigation and selected panels. The brand kit includes both new transparent logo variants.

Logo: supplied R&D MECA PNG with transparent margins cropped. Photos: aluminum Zheng ji and Jelifer Maniago / Unsplash. Videos: Daniel Smyth / Pexels. Media is illustrative and is never presented as R&D MECA facilities or completed client projects. Confirmed real client projects can replace the labelled application cases through the content API. A downloadable bilingual brand kit is included.

## Domain and business information

The intended brand domain is rdmeca.com. Update canonical origins in `content.mjs`, `app/layout.tsx`, `app/robots.ts` and `app/sitemap.ts` when connecting the final domain, then rebuild and publish. Add the confirmed registered legal entity, address and any applicable local business disclosures before the final domain launch. Current public contacts are contact@rdmeca.com and +33 7 45 76 80 10.
