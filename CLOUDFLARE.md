# Cloudflare deployment

The production Worker is `rdmeca`, with the `DB` binding connected to the `rdmeca-production` D1 database. `wrangler.cloudflare.jsonc` contains the account and binding configuration; secrets are stored separately in Cloudflare.

Production URL: https://rdmeca.com

The Worker hostname and `www.rdmeca.com` permanently redirect public page requests to the matching `rdmeca.com` URL, preserving paths and query strings. Connect `www.rdmeca.com` to this Worker as a custom domain so HTTPS requests reach that redirect.

Public page URLs use trailing slashes consistently in routing, canonical links, language links and the sitemap. Metadata files and asset URLs retain their file extensions.

## Update the site

Run these commands from the repository root after authenticating with `wrangler login`:

```sh
npm ci
npm run db:migrate:cloudflare
npm run build
npm run deploy:cloudflare
```

On Cloudflare Workers Builds, use `npm run build` as the build command and `npm run deploy:cloudflare` as the deploy command. The GitHub repository is `solomid123/rdmeca`, branch `main`.

The Worker needs the `CMS_WRITE_TOKEN` secret for protected editorial updates and enquiry retrieval. It is excluded from Git. Editorial content is defined in `editorial-seed.mjs`; populate a new database with `node scripts/seed-content.mjs <production-url>`, supplying the credential through stdin. Existing databases do not need reseeding on each deployment.

`PUBLIC_SITE_URL` is `https://rdmeca.com` and sets canonical links, language links, social metadata and the sitemap. The source content uses the same origin as its fallback. The public site does not require visitors to sign in.
