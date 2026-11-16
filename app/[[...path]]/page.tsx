import {notFound} from 'next/navigation';
import {getPublicContent,getContentEntry} from '../../lib/public-content';
import {routes,services,sectorData,linkTo,type Lang,type PageKey} from '../site-data';
import Site from '../site';
export const dynamic='force-dynamic';
type Props={params:Promise<{path?:string[]}>};
function resolvePath(path:string[]=[]){const lang:Lang=path[0]==='en'?'en':'fr';const parts=lang==='en'?path.slice(1):path;let key:PageKey='home';if(parts[0]){const found=Object.entries(routes[lang]).find(([,value])=>value===parts[0]);if(!found)return null;key=found[0] as PageKey;}if(parts.length>2)return null;return {lang,key,slug:parts[1]};}
export async function generateMetadata({params}:Props){
 const info=resolvePath((await params).path);if(!info)return {};
 const labels=info.lang==='fr'?{services:'Expertises',about:'À propos',method:'Méthodologie',sectors:'Secteurs',portfolio:'Portfolio',blog:'Journal',videos:'Médiathèque',press:'Presse',contact:'Contact',privacy:'Confidentialité',home:'Ingénierie mécanique & maintenance industrielle'}:{services:'Expertise',about:'About',method:'Method',sectors:'Industries',portfolio:'Portfolio',blog:'Journal',videos:'Media library',press:'Press',contact:'Contact',privacy:'Privacy',home:'Mechanical engineering & industrial maintenance'};
 let title=labels[info.key],description=info.lang==='fr'?'Découvrez les expertises et les contenus R&D MECA : conception mécanique, calcul, industrialisation et maintenance industrielle.':'Explore R&D MECA expertise and insights: mechanical design, analysis, industrialisation and industrial maintenance.';
 const service=info.slug&&info.key==='services'?services.find(s=>s[info.lang].slug===info.slug):null;
 if(service){title=service[info.lang].title;description=service[info.lang].intro;}
 const types:Partial<Record<PageKey,string>>={blog:'article',press:'press',portfolio:'portfolio',videos:'video'};
 const entry=info.slug&&types[info.key]?await getContentEntry(info.lang,types[info.key]!,info.slug):null;
 if(entry){title=entry.title;description=entry.summary;}
 return {title,description,openGraph:{title,description,images:[entry?.image||'/assets/hero.webp']},alternates:{canonical:linkTo(info.lang,info.key,info.slug),languages:{fr:linkTo('fr',info.key,service?service.fr.slug:info.slug),en:linkTo('en',info.key,service?service.en.slug:info.slug)}}};
}
export default async function Page({params}:Props){const info=resolvePath((await params).path);if(!info)notFound();if(info.slug&&info.key==='services'&&!services.some(s=>s[info.lang].slug===info.slug))notFound();if(info.slug&&info.key==='sectors'&&!sectorData.some(s=>s.id===info.slug))notFound();const types:Partial<Record<PageKey,string>>={blog:'article',press:'press',portfolio:'portfolio',videos:'video'};if(info.slug&&!['services','sectors','blog','press','portfolio','videos'].includes(info.key))notFound();const items=await getPublicContent(info.lang);const entry=info.slug&&types[info.key]?await getContentEntry(info.lang,types[info.key]!,info.slug):null;if(info.slug&&types[info.key]&&!entry)notFound();return <Site lang={info.lang} page={info.key} slug={info.slug} items={items} entry={entry}/>;}
