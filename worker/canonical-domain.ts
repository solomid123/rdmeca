const productionOrigin = 'https://rdmeca.com';
const aliases = new Set([
  'www.rdmeca.com',
  'rdmeca.rdmeca-consultancy.workers.dev',
  'rdmeca-consultancy.okimanlolq.chatgpt.site',
]);

export function redirectToCanonicalDomain(request: Request, siteOrigin = productionOrigin): Response | null {
  const source = new URL(request.url);
  const canonical = new URL(siteOrigin);
  if (source.hostname !== canonical.hostname && !aliases.has(source.hostname)) return null;
  if (source.origin === canonical.origin) return null;

  // Change only the origin so paths, query strings and encoded characters survive.
  // Assigning the host also prevents a path starting with // from becoming a host.
  source.protocol = canonical.protocol;
  source.host = canonical.host;
  return Response.redirect(source.href, 308);
}
