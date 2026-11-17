import assert from 'node:assert/strict';

const origin = 'https://rdmeca.com';
const htmlUnescape = value => value.replaceAll('&amp;', '&');
const absolute = value => new URL(htmlUnescape(value), origin).href;
const robotResponse = await fetch(origin + '/robots.txt');
assert.equal(robotResponse.status, 200);
const robots = await robotResponse.text();
assert.ok(robots.includes('Sitemap: ' + origin + '/sitemap.xml'));
assert.ok(!robots.includes('workers.dev') && !robots.includes('chatgpt.site'));

const sitemapResponse = await fetch(origin + '/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => htmlUnescape(match[1]));
assert.ok(urls.length > 0);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
assert.ok(urls.every(url => new URL(url).origin === origin), 'All sitemap URLs must use the primary domain');

const pages = new Map();
let cursor = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    assert.equal(absolute(response.url), absolute(url), 'Unexpected redirect: ' + url);
    assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), url);
    const html = await response.text();
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
    const canonicalTag = links.find(tag => /\brel="canonical"/.test(tag));
    assert.ok(canonicalTag, 'Missing canonical: ' + url);
    const canonical = absolute(canonicalTag.match(/\bhref="([^"]+)"/)[1]);
    assert.equal(canonical, absolute(url), 'Incorrect canonical: ' + url);
    const alternates = Object.fromEntries(links.filter(tag => /\bhreflang="/.test(tag)).map(tag => [
      tag.match(/\bhreflang="([^"]+)"/)[1], absolute(tag.match(/\bhref="([^"]+)"/)[1]),
    ]));
    assert.ok(alternates.fr && alternates.en, 'Missing language alternatives: ' + url);
    const lang = new URL(url).pathname.startsWith('/en/') ? 'en' : 'fr';
    assert.equal(alternates[lang], canonical, 'Missing language self-reference: ' + url);
    assert.match(html, new RegExp('<html[^>]*lang="' + lang + '"'), url);
    assert.ok(!/<meta\b[^>]*name="(?:robots|googlebot)"[^>]*content="[^"]*noindex/i.test(html), url);
    pages.set(canonical, alternates);
  }
}));
for (const [url, alternates] of pages) {
  for (const target of Object.values(alternates)) {
    assert.ok(pages.has(target), 'Language link is absent from sitemap: ' + target);
    assert.deepEqual(pages.get(target), alternates, 'Language links are not reciprocal: ' + url);
  }
}
for (const source of [
  'https://rdmeca.rdmeca-consultancy.workers.dev/en/expertise/mechanical-design/?ref=seo%2Fcheck',
  'https://www.rdmeca.com/expertises/maintenance-preventive/?ref=seo',
  'http://rdmeca.com/en/',
]) {
  const response = await fetch(source, {redirect: 'manual'});
  assert.ok([301, 308].includes(response.status), 'Expected a permanent redirect: ' + source);
  const expected = new URL(source);
  expected.protocol = 'https:';
  expected.host = 'rdmeca.com';
  assert.equal(response.headers.get('location'), expected.href, source);
}
console.log('Passed: ' + urls.length + ' indexable sitemap pages; self-canonical URLs, reciprocal French/English links, document languages, robots and permanent path-preserving redirects.');
