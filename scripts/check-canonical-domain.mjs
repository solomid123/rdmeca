import assert from 'node:assert/strict';
import {redirectToCanonicalDomain} from '../worker/canonical-domain.ts';

for (const host of ['www.rdmeca.com', 'rdmeca.rdmeca-consultancy.workers.dev', 'rdmeca-consultancy.okimanlolq.chatgpt.site']) {
  for (const path of ['/', '/en/expertise/mechanical-design/', '/contact/?service=design&ref=a%2Fb', '//external.example/path?x=1']) {
    const response = redirectToCanonicalDomain(new Request('https://' + host + path));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), 'https://rdmeca.com' + path);
  }
}
assert.equal(redirectToCanonicalDomain(new Request('http://rdmeca.com/en/')).headers.get('location'), 'https://rdmeca.com/en/');
for (const url of ['https://rdmeca.com/', 'https://rdmeca.com/en/', 'http://127.0.0.1:4173/', 'https://preview.example/']) {
  assert.equal(redirectToCanonicalDomain(new Request(url)), null, url);
}
console.log('Passed: permanent redirects preserve paths and queries; canonical, local and unrelated hosts do not redirect.');
