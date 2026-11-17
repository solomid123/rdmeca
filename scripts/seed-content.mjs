import {readFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
import {seedItems} from '../editorial-seed.mjs';
import {professionalCaseStudies} from '../professional-case-studies.mjs';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const requestedTypes=process.argv[3]?.split(',');
if(requestedTypes?.some(type=>!['article','portfolio','press','video'].includes(type)))throw new Error('Unknown content type.');
const allItems=[...seedItems,...professionalCaseStudies];
const items=requestedTypes?allItems.filter(item=>requestedTypes.includes(item.type)):allItems;
let credential;
if(origin.startsWith('http://127.0.0.1:')){
 const vars=readFileSync('.dev.vars','utf8');credential=vars.split('\n').find(line=>line.startsWith('CMS_WRITE_TOKEN='))?.slice('CMS_WRITE_TOKEN='.length).trim();
}else{
 const reader=createInterface({input:process.stdin,output:undefined,terminal:false});
 const input=await new Promise((resolve,reject)=>{reader.once('line',resolve);reader.once('close',()=>reject(new Error('Content update credential was not provided.')));});
 reader.close();credential=JSON.parse(input).token;
}
if(!credential)throw new Error('Content update credential is missing.');
const response=await fetch(origin+'/api/cms/seed',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+credential},body:JSON.stringify(items)});
const payload=await response.json();if(!response.ok||!payload.ok)throw new Error('Database content update failed: '+response.status);
console.log(JSON.stringify({ok:true,count:payload.count}));
