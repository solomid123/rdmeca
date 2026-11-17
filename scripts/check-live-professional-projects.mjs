import assert from 'node:assert/strict';
import {professionalProjectSources, projectAuthor} from '../app/project-sources.mjs';
import {services} from '../content.mjs';

const origin = 'https://rdmeca.com';
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const pending = professionalProjectSources.flatMap(project => ['fr', 'en'].map(lang => ({project, lang})));
let cursor = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < pending.length) {
    const {project, lang} = pending[cursor++];
    const url = origin + (lang === 'en' ? '/en' : '') + '/portfolio/' + project.slug + '/';
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    const visible = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
    assert.ok(visible.includes('project-attribution'), 'Professional attribution missing: ' + url);
    assert.ok(visible.includes(projectAuthor.name), url);
    assert.ok(visible.includes(project.context), url);
    assert.ok(visible.includes('France'), 'Original project location missing: ' + url);
    assert.ok(!/barkibadreddine\.com|personal portfolio|portfolio personnel|Le portfolio|The portfolio/i.test(html), 'Personal portfolio reference must not be published: ' + url);
    assert.ok(visible.includes('project-cover'), 'Technical image presentation missing: ' + url);
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
    assert.equal(work?.author?.name, projectAuthor.name);
    assert.equal(work?.author?.url, undefined);
    assert.equal(work?.isBasedOn, undefined);
    assert.equal(work?.url, url);
    assert.ok(!graph.some(node => node['@type'] === 'Review' || node['@type'] === 'AggregateRating'));
  }
}));
for (const project of professionalProjectSources) {
  const response = await fetch(origin + '/assets/project-' + project.id + '.webp', {method: 'HEAD'});
  assert.equal(response.status, 200, project.id);
}
for (const lang of ['fr', 'en']) {
  const home = await (await fetch(origin + (lang === 'fr' ? '/' : '/en/'))).text();
  for (const id of ['cad', 'fea', 'sigma']) {
    const project = professionalProjectSources.find(project => project.id === id);
    assert.ok(home.includes('/portfolio/' + project.slug + '/'), 'Homepage project link missing');
  }
  const listing = await (await fetch(origin + (lang === 'fr' ? '/portfolio/' : '/en/portfolio/'))).text();
  assert.ok(listing.includes(lang === 'fr' ? 'Exemple d’application' : 'Application example'), 'Existing illustrative cases must remain labelled');
  for (const service of services) {
    const url = origin + (lang === 'fr' ? '/expertises/' : '/en/expertise/') + service[lang].slug + '/';
    const html = await (await fetch(url)).text();
    assert.ok(professionalProjectSources.filter(project => project.services.includes(service.id)).some(project => html.includes('/portfolio/' + project.slug + '/')), 'Service page has no professional project link: ' + url);
  }
}
console.log('Passed: 16 bilingual professional project pages, author/employment context, no personal-portfolio references, technical images, case-study data, homepage and six service-page links in each language.');
