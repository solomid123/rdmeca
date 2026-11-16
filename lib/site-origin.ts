import {env} from 'cloudflare:workers';
import {business} from '../content.mjs';

export function getSiteOrigin():string {
  return (env.PUBLIC_SITE_URL||business.origin).replace(/\/$/,'');
}
