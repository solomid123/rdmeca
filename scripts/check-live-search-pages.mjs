import assert from 'node:assert/strict';
import {services} from '../content.mjs';
import {pageSearchCopy, serviceSearchCopy, sectorSearchCopy, publicPagesUpdatedAt} from '../app/search-copy.ts';
import {serviceQuestions, relatedServiceIds} from '../app/service-guides.ts';

const origin = 'https://rdmeca.com';
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#39;', "'");
const entries = [];
for (const lang of ['fr', 'en']) {
  const prefix = lang === 'fr' ? '/' : '/en/';
  const serviceRoot = prefix + (lang === 'fr' ? 'expertises/' : 'expertise/');
  const sectorRoot = prefix + (lang === 'fr' ? 'secteurs/' : 'industries/');
  entries.push({url: origin + prefix, lang, expected: pageSearchCopy[lang].home});
  entries.push({url: origin + serviceRoot, lang, expected: pageSearchCopy[lang].services});
  for (const service of services) entries.push({url: origin + serviceRoot + service[lang].slug + '/', lang, service, serviceRoot, expected: serviceSearchCopy[lang][service.id]});
  for (const [sector, expected] of Object.entries(sectorSearchCopy[lang])) entries.push({url: origin + sectorRoot + sector + '/', lang, expected});
}

let cursor = 0;
const titles = new Set();
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < entries.length) {
    const item = entries[cursor++];
    const response = await fetch(item.url);
    assert.equal(response.status, 200, item.url);
    const html = await response.text();
    const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)[1]);
    assert.ok(title.startsWith(item.expected.title), 'Incorrect search title: ' + item.url);
    assert.ok(!titles.has(title), 'Duplicate search title: ' + title);
    titles.add(title);
    const description = decode(html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]+)"/)[1]);
    assert.equal(description, item.expected.description, item.url);
    const schemaText = html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(schemaText, 'Missing structured data: ' + item.url);
    const schema = JSON.parse(schemaText);
    const graph = schema['@graph'];
    const organization = graph.find(node => node['@type'] === 'Organization');
    assert.equal(organization.url, origin + '/');
    assert.equal(organization.areaServed.name, 'Morocco');
    const page = graph.find(node => node['@type'] === 'WebPage');
    assert.equal(page.url, item.url);
    assert.equal(page.inLanguage, item.lang);
    if (item.service) {
      const service = graph.find(node => node['@type'] === 'Service');
      assert.equal(service.url, item.url);
      assert.equal(service.provider['@id'], organization['@id']);
      assert.equal(page.mainEntity['@id'], service['@id']);
      const visibleHtml = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
      for (const [question, answer] of serviceQuestions[item.lang][item.service.id]) {
        assert.ok(visibleHtml.includes(question), 'Missing rendered project question: ' + item.url);
        assert.ok(visibleHtml.includes(answer), 'Missing rendered project guidance: ' + item.url);
      }
      for (const id of relatedServiceIds[item.service.id]) {
        const related = services.find(candidate => candidate.id === id);
        assert.ok(visibleHtml.includes('href="' + item.serviceRoot + related[item.lang].slug + '/"'), 'Missing related service link: ' + item.url);
      }
    }
  }
}));
const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
assert.ok(sitemap.includes('<lastmod>' + publicPagesUpdatedAt), 'Static page update date missing');
console.log('Passed: 26 priority French/English pages with distinct search titles, descriptions, valid company/service data, visible project guidance and related-service links.');
