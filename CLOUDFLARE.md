# Cloudflare deployment

The production Worker is `rdmeca`, with the `DB` binding connected to the `rdmeca-production` D1 database. `wrangler.cloudflare.jsonc` contains the account and binding configuration; secrets are stored separately in Cloudflare.

Production URL: https://rdmeca.rdmeca-consultancy.workers.dev

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

`PUBLIC_SITE_URL` sets canonical links, social metadata and the sitemap. When connecting `rdmeca.com`, update that variable to `https://rdmeca.com` and deploy the configuration. The public site does not require visitors to sign in.
