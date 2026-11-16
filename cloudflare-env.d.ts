declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PUBLIC_SITE_URL?: string;
    ASSETS?: Fetcher;
  }
}
