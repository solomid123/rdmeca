import {notFound} from 'next/navigation';
import {getPublicContent, getContentEntry} from '../../lib/public-content';
import {getSiteOrigin} from '../../lib/site-origin';
import {searchSchema} from '../../lib/search-schema';
import {routes, services, sectorData, linkTo, type Lang, type PageKey} from '../site-data';
import {pageSearchCopy, serviceSearchCopy, sectorSearchCopy} from '../search-copy';
import {getProjectSource} from '../project-sources.mjs';
import Site from '../site';

export const dynamic = 'force-dynamic';
type Props = {params: Promise<{path?: string[]}>};
type ResolvedPath = {lang: Lang; key: PageKey; slug?: string};
const contentTypes: Partial<Record<PageKey, string>> = {blog: 'article', press: 'press', portfolio: 'portfolio', videos: 'video'};

function resolvePath(path: string[] = []): ResolvedPath | null {
  const lang: Lang = path[0] === 'en' ? 'en' : 'fr';
  const parts = lang === 'en' ? path.slice(1) : path;
  let key: PageKey = 'home';
  if (parts[0]) {
    const found = Object.entries(routes[lang]).find(([, value]) => value === parts[0]);
    if (!found) return null;
    key = found[0] as PageKey;
  }
  if (parts.length > 2) return null;
  return {lang, key, slug: parts[1]};
}

function searchCopy(info: ResolvedPath, entry: {title: string; summary: string} | null) {
  if (entry) return {title: entry.title, description: entry.summary};
  if (info.slug && info.key === 'services') {
    const service = services.find(item => item[info.lang].slug === info.slug);
    if (service) return serviceSearchCopy[info.lang][service.id] || pageSearchCopy[info.lang][info.key];
  }
  if (info.slug && info.key === 'sectors') {
    return sectorSearchCopy[info.lang][info.slug] || pageSearchCopy[info.lang][info.key];
  }
  return pageSearchCopy[info.lang][info.key];
}

export async function generateMetadata({params}: Props) {
  const info = resolvePath((await params).path);
  if (!info) return {};
  const service = info.slug && info.key === 'services' ? services.find(item => item[info.lang].slug === info.slug) : null;
  const type = contentTypes[info.key];
  const entry = info.slug && type ? await getContentEntry(info.lang, type, info.slug) : null;
  const {title, description} = searchCopy(info, entry);
  return {
    title, description,
    openGraph: {title, description, images: [entry?.image || '/assets/hero.webp']},
    alternates: {
      canonical: linkTo(info.lang, info.key, info.slug),
      languages: {
        fr: linkTo('fr', info.key, service ? service.fr.slug : info.slug),
        en: linkTo('en', info.key, service ? service.en.slug : info.slug),
      },
    },
  };
}

export default async function Page({params}: Props) {
  const info = resolvePath((await params).path);
  if (!info) notFound();
  const service = info.slug && info.key === 'services' ? services.find(item => item[info.lang].slug === info.slug) : null;
  if (info.slug && info.key === 'services' && !service) notFound();
  if (info.slug && info.key === 'sectors' && !sectorData.some(item => item.id === info.slug)) notFound();
  const type = contentTypes[info.key];
  if (info.slug && !['services', 'sectors', 'blog', 'press', 'portfolio', 'videos'].includes(info.key)) notFound();
  const items = await getPublicContent(info.lang);
  const entry = info.slug && type ? await getContentEntry(info.lang, type, info.slug) : null;
  if (info.slug && type && !entry) notFound();
  const origin = getSiteOrigin();
  const project = entry?.type === 'portfolio' ? getProjectSource(entry.slug) : null;
  const schema = searchSchema({
    origin, url: origin + linkTo(info.lang, info.key, info.slug), lang: info.lang,
    ...searchCopy(info, entry), ...(service ? {serviceName: service[info.lang].title} : {}),
    ...(project && entry ? {project: {
      image: entry.image, publishedAt: entry.publishedAt,
    }} : {}),
  });
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}} />
    <Site lang={info.lang} page={info.key} slug={info.slug} items={items} entry={entry} />
  </>;
}
