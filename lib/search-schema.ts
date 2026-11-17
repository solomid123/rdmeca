import {business} from '../content.mjs';
import type {Lang} from '../app/site-data';

type SearchSchemaInput = {
  origin: string;
  url: string;
  title: string;
  description: string;
  lang: Lang;
  serviceName?: string;
  project?: {
    author: {name: string};
    context: string;
    image: string;
    publishedAt: string;
  };
};

export function searchSchema({origin, url, title, description, lang, serviceName, project}: SearchSchemaInput) {
  const organizationId = new URL('/#organization', origin).href;
  const websiteId = new URL('/#website', origin).href;
  const serviceId = url + '#service';
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization', '@id': organizationId,
      name: business.name, url: new URL('/', origin).href,
      logo: new URL('/assets/rdmeca-symbol-color.png', origin).href,
      email: business.email, telephone: business.phone,
      areaServed: {'@type': 'Country', name: 'Morocco'},
    },
    {
      '@type': 'WebSite', '@id': websiteId, url: new URL('/', origin).href,
      name: business.name, inLanguage: ['fr', 'en'], publisher: {'@id': organizationId},
    },
    {
      '@type': 'WebPage', '@id': url + '#webpage', url,
      name: title, description, inLanguage: lang,
      isPartOf: {'@id': websiteId}, about: {'@id': organizationId},
      ...(serviceName ? {mainEntity: {'@id': serviceId}} : {}),
      ...(project ? {mainEntity: {'@id': url + '#case-study'}} : {}),
    },
  ];
  if (serviceName) graph.push({
    '@type': 'Service', '@id': serviceId, name: serviceName, serviceType: serviceName,
    url, description, provider: {'@id': organizationId},
    areaServed: {'@type': 'Country', name: 'Morocco'},
  });
  if (project) graph.push({
    '@type': 'CreativeWork', '@id': url + '#case-study',
    name: title, description, url, inLanguage: lang,
    image: new URL(project.image, origin).href, datePublished: project.publishedAt,
    author: {'@type': 'Person', name: project.author.name},
    publisher: {'@id': organizationId},
    creditText: project.author.name + ' · ' + project.context,
  });
  return {'@context': 'https://schema.org', '@graph': graph};
}
