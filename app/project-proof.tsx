import Link from './site-link';
import {ArrowRight} from 'lucide-react';
import {getProjectSource} from './project-sources.mjs';
import {services, linkTo, type Lang} from './site-data';

export function ProjectServiceLinks({lang, slug}: {lang: Lang; slug: string}) {
  const project = getProjectSource(slug);
  if (!project) return null;
  return <section className="project-service-links">
    <h2>{lang === 'fr' ? 'Des méthodes pour votre projet au Maroc.' : 'Methods for your project in Morocco.'}</h2>
    <p>{lang === 'fr' ? 'Découvrez les services associés et définissons ensemble le périmètre adapté à vos équipements.' : 'Explore the related services and discuss the scope suited to your equipment.'}</p>
    {services.filter(service => project.services.includes(service.id)).map(service => <Link className="text-link" key={service.id} href={linkTo(lang, 'services', service[lang].slug)}>{service[lang].title}<ArrowRight size={16}/></Link>)}
  </section>;
}
