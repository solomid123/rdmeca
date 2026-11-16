import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {services,business} from './content.mjs';
const base=resolve('dist');
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const files=await walk(base),htmlFiles=files.filter(p=>extname(p)==='.html');
const contents=new Map(await Promise.all(htmlFiles.map(async p=>[p,await readFile(p,'utf8')])));
const errors=[];
let checked=0;
for(const [file,html] of contents){
  const label=file.slice(base.length).replaceAll(sep,'/');
  if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${label}: expected one main heading`);
  if(!/<html lang="(fr|en)"/.test(html))errors.push(`${label}: missing language`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push(`${label}: duplicate element IDs`);
  if(!file.endsWith('404.html')){
    if(!html.includes('name="description"'))errors.push(`${label}: missing description`);
    if(!html.includes('rel="canonical"'))errors.push(`${label}: missing canonical URL`);
    if(!html.includes('hreflang="fr"')||!html.includes('hreflang="en"'))errors.push(`${label}: missing bilingual alternate`);
    const schema=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    try{JSON.parse(schema?.[1]);}catch{errors.push(`${label}: invalid structured data`);}
  }
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const href=match[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:|tel:|data:)/.test(href))continue;
    const url=new URL(href,'https://local'+label.replace(/index\.html$/,''));
    let target=resolve(base,'.'+decodeURIComponent(url.pathname));
    try{
      if((await stat(target)).isDirectory())target=join(target,'index.html');
      await stat(target);
      if(url.hash){const targetHtml=contents.get(target)||await readFile(target,'utf8');if(!targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))errors.push(`${label}: anchor not found ${href}`);}
      checked++;
    }catch{errors.push(`${label}: missing reference ${href}`);}
  }
}
for(const lang of ['fr','en'])for(const service of services){
  const path=join(base,lang==='en'?'en':'','services',service[lang].slug,'index.html');
  if(!contents.has(path))errors.push(`Missing ${lang} service ${service.id}`);
}
for(const lang of ['fr','en']){
  const path=join(base,lang==='en'?'en':'','contact','index.html');
  const html=contents.get(path)||'';
  for(const required of ['mailto:'+business.email,'tel:'+business.tel,'https://wa.me/'+business.whatsapp,'id="enquiry-form"','type="email"','id="enquiry-result"'])if(!html.includes(required))errors.push(`Contact ${lang}: missing ${required}`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{
  const sizes=await Promise.all(files.map(async p=>(await stat(p)).size));
  console.log(`Passed: ${htmlFiles.length-1} bilingual pages, 404 page, ${checked} local references, metadata, structured data and contact links.`);
  console.log(`Deployment assets and pages: ${(sizes.reduce((a,b)=>a+b,0)/1024/1024).toFixed(2)} MB.`);
}
