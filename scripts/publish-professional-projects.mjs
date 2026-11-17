import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {professionalCaseStudies} from '../professional-case-studies.mjs';

const origin = 'https://rdmeca.com';
const items = professionalCaseStudies;
assert.equal(items.length, 16);
assert.equal(new Set(items.map(item => item.locale + '/' + item.slug)).size, 16);
assert.ok(items.every(item => item.type === 'portfolio' && !item.illustrative));
assert.equal(items.filter(item => item.published).length, 14);
assert.ok(items.every(item => item.title.length <= 180 && item.summary.length <= 900 && item.body.length <= 30000));

if (!process.argv.includes('--publish')) {
  console.log('Prepared seven published professional studies in French and English, with the reliability study archived. Use --publish to update these 16 records.');
} else {
  for (const asset of new Set(items.filter(item => item.published).map(item => item.image))) {
    const response = await fetch(origin + asset, {method: 'HEAD'});
    assert.equal(response.status, 200, 'Publish project images before content: ' + asset);
    assert.ok(response.headers.get('content-type')?.startsWith('image/'), asset);
  }
  const vars = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
  const line = vars.split(/\r?\n/).find(line => line.startsWith('CMS_WRITE_TOKEN='));
  let credential = line?.slice('CMS_WRITE_TOKEN='.length).trim();
  if (credential?.startsWith('"') && credential.endsWith('"')) credential = credential.slice(1, -1);
  if (credential?.startsWith("'") && credential.endsWith("'")) credential = credential.slice(1, -1);
  if (!credential) throw new Error('The local content-update credential is missing.');
  const response = await fetch(origin + '/api/cms/seed', {
    method: 'POST', headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + credential},
    body: JSON.stringify(items),
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true || result.count !== items.length) throw new Error('Project publication failed: HTTP ' + response.status);
  console.log('Published seven professional studies in French and English (14 pages), with the reliability study archived.');
}
