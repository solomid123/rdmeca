import type {MetadataRoute} from 'next';
import {getPublicContent} from '../lib/public-content';
import {routes,services,sectorData,linkTo,type Lang,type PageKey} from './site-data';
import {getSiteOrigin} from '../lib/site-origin';
import {publicPagesUpdatedAt} from './search-copy';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin=getSiteOrigin();const result:MetadataRoute.Sitemap=[];for(const lang of ['fr','en'] as Lang[]){for(const page of Object.keys(routes[lang]) as PageKey[])result.push({url:origin+linkTo(lang,page),lastModified:publicPagesUpdatedAt});for(const s of services)result.push({url:origin+linkTo(lang,'services',s[lang].slug),lastModified:publicPagesUpdatedAt});for(const s of sectorData)result.push({url:origin+linkTo(lang,'sectors',s.id),lastModified:publicPagesUpdatedAt});for(const item of await getPublicContent(lang)){const map:Record<string,PageKey>={article:'blog',press:'press',portfolio:'portfolio',video:'videos'};result.push({url:origin+linkTo(lang,map[item.type],item.slug),lastModified:new Date(item.publishedAt)});}}return result;}
