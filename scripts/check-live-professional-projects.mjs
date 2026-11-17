import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {publishedProfessionalProjects} from '../app/project-sources.mjs';
import {services} from '../content.mjs';

const origin = 'https://rdmeca.com';
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const careerReferences = /Badreddine|Barki|SLB(?: Group)?|chez Sigma|at Sigma|Parcours professionnel|Professional experience|professionalContext|Clermont-Ferrand/i;
const pending = publishedProfessionalProjects.flatMap(project => ['fr', 'en'].map(lang => ({project, lang})));
let cursor = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < pending.length) {
    const {project, lang} = pending[cursor++];
    const url = origin + (lang === 'en' ? '/en' : '') + '/portfolio/' + project.slug + '/';
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    const visible = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
    assert.ok(!html.includes('project-attribution'), 'Career attribution block must be removed: ' + url);
    assert.doesNotMatch(html, careerReferences, 'Personal/employment references must be absent: ' + url);
    assert.ok(!/barkibadreddine\.com|personal portfolio|portfolio personnel|Le portfolio|The portfolio/i.test(html), 'Personal portfolio reference must not be published: ' + url);
    assert.ok(visible.includes('project-cover'), 'Technical image presentation missing: ' + url);
    assert.ok(visible.includes('src="' + project.image + '"'), 'Selected project image missing: ' + url);
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.equal(canonical?.[1], url);
    for (const id of project.services) {
      const service = services.find(service => service.id === id);
      const href = (lang === 'fr' ? '/expertises/' : '/en/expertise/') + service[lang].slug + '/';
      assert.ok(visible.includes('href="' + href + '"'), 'Related service missing: ' + url);
    }
    const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const graph = blocks.flatMap(block => block['@graph'] || []);
    const work = graph.find(node => node['@type'] === 'CreativeWork');
    assert.equal(work?.author, undefined);
    assert.equal(work?.creditText, undefined);
    assert.equal(work?.publisher?.['@id'], graph.find(node => node['@type'] === 'Organization')?.['@id']);
    assert.equal(work?.isBasedOn, undefined);
    assert.equal(work?.url, url);
    assert.equal(work?.image, origin + project.image);
    assert.ok(!graph.some(node => node['@type'] === 'Review' || node['@type'] === 'AggregateRating'));
  }
}));
for (const project of publishedProfessionalProjects) {
  const response = await fetch(origin + project.image);
  assert.equal(response.status, 200, project.id);
  const deployed = Buffer.from(await response.arrayBuffer());
  const saved = readFileSync(new URL('../public' + project.image, import.meta.url));
  assert.equal(createHash('sha256').update(deployed).digest('hex'), createHash('sha256').update(saved).digest('hex'), 'Deployed project image differs from saved image: ' + project.id);
}
for (const lang of ['fr', 'en']) {
  const home = await (await fetch(origin + (lang === 'fr' ? '/' : '/en/'))).text();
  assert.doesNotMatch(home, careerReferences);
  assert.ok(!home.includes('project-evidence'), 'Homepage portfolio suggestions must be absent');
  for (const project of publishedProfessionalProjects) assert.ok(!home.includes('/portfolio/' + project.slug + '/'), 'Homepage still suggests a portfolio project');
  const listing = await (await fetch(origin + (lang === 'fr' ? '/portfolio/' : '/en/portfolio/'))).text();
  assert.doesNotMatch(listing, careerReferences);
  const content = await (await fetch(origin + '/api/content?lang=' + lang + '&check=' + Date.now())).json();
  const projects = content.items.filter(item => item.type === 'portfolio');
  assert.equal(projects.length, 7, 'Exactly seven portfolio entries should be published');
  assert.deepEqual(projects.map(item => item.slug).sort(), publishedProfessionalProjects.map(project => project.slug).sort());
  assert.ok(!listing.includes('application-design') && !listing.includes('composite-cable-reliability-failure-analysis'), 'Removed entries still appear in portfolio');
  for (const slug of ['composite-cable-reliability-failure-analysis', ...services.map(service => 'application-' + service.id)]) {
    const url = origin + (lang === 'en' ? '/en' : '') + '/portfolio/' + slug + '/';
    assert.equal((await fetch(url)).status, 404, 'Removed project must be unavailable: ' + url);
  }
  for (const service of services) {
    const url = origin + (lang === 'fr' ? '/expertises/' : '/en/expertise/') + service[lang].slug + '/';
    const html = await (await fetch(url)).text();
    assert.doesNotMatch(html, careerReferences);
    const related = publishedProfessionalProjects.filter(project => project.services.includes(service.id));
    if (related.length) assert.ok(related.some(project => html.includes('/portfolio/' + project.slug + '/')), 'Service page has no relevant professional project link: ' + url);
    assert.ok(!html.includes('/portfolio/composite-cable-reliability-failure-analysis/'), 'Removed project still linked from service page');
  }
}
console.log('Passed: seven selected projects in both languages, no personal/career references in pages or metadata, unchanged selected images, removed project URLs, no homepage portfolio suggestions and service links.');
