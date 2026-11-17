import assert from 'node:assert/strict';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const routes=['/','/en/','/expertises/','/en/expertise/','/a-propos/','/methodologie/','/secteurs/','/secteurs/automobile/','/portfolio/','/blog/','/mediatheque/','/presse/','/contact/','/confidentialite/','/expertises/conception-mecanique/','/blog/maintenance-preventive-du-calendrier-a-la-criticite/','/portfolio/application-design/','/presse/mecmaroc-devient-rdmeca/','/mediatheque/usinage-de-precision/'];
for(const path of routes){const response=await fetch(origin+path);assert.equal(response.status,200,path);const html=await response.text();assert.ok(html.includes('R&amp;D MECA')||html.includes('R&D MECA'),path+' branding');assert.ok(!html.includes('Your site is taking shape'),path+' starter removed');assert.match(html,new RegExp('<html[^>]*lang="'+(path.startsWith('/en/')?'en':'fr')+'"'),path+' document language');}
const content=await(await fetch(origin+'/api/content?lang=fr&check='+Date.now())).json();assert.equal(content.items.length,23);assert.equal(content.items.filter(i=>i.type==='article').length,5);assert.ok(content.items.every(i=>!('email'in i)&&!('message'in i)));
assert.equal((await fetch(origin+'/api/cms/enquiries')).status,401,'Private enquiry records must not be public');
assert.equal((await fetch(origin+'/api/cms/seed',{method:'POST',headers:{'Content-Type':'application/json'},body:'[]'})).status,401,'Content changes require authorization');
const bad=await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'A',email:'invalid',message:'too short'})});assert.equal(bad.status,400);
const foreign=await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://different.example'},body:'{}'});assert.equal(foreign.status,403);
for(const asset of ['/assets/cnc-precision.mp4','/assets/cnc-milling.mp4','/assets/rdmeca-press-kit.zip'])assert.equal((await fetch(origin+asset,{method:'HEAD'})).status,200,asset);
assert.equal((await fetch(origin+'/sitemap.xml')).status,200);assert.equal((await fetch(origin+'/robots.txt')).status,200);
assert.equal((await fetch(origin+'/page-that-does-not-exist/')).status,404);
console.log('Passed: 19 representative pages, 23 published French records, protected content/enquiry endpoints, validation, origin checks, video assets, press kit, sitemap and 404.');
