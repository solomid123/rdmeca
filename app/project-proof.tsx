import Link from './site-link';
import {ArrowRight} from 'lucide-react';
import {getProjectSource, projectAuthor} from './project-sources.mjs';
import {services, linkTo, type Lang} from './site-data';

export function ProjectAttribution({lang, slug}: {lang: Lang; slug: string}) {
  const project = getProjectSource(slug);
  if (!project) return null;
  const fr = lang === 'fr';
  return <div className="project-attribution">
    <p>{fr ? 'Parcours professionnel de ' : 'Professional experience of '}{projectAuthor.name}{' · '}{project.context}{' · France · '}{project.duration[lang]}</p>
    <p>{project.id === 'sigma' ? (fr ? 'Projet réalisé pendant un stage d’ingénierie R&D chez Sigma.' : 'Project completed during an R&D engineering internship at Sigma.') : (fr ? 'Travaux réalisés dans le cadre d’un poste d’ingénierie mécanique R&D chez SLB Group.' : 'Work completed in a mechanical R&D engineering role at SLB Group.')}</p>
  </div>;
}

export function ProjectServiceLinks({lang, slug}: {lang: Lang; slug: string}) {
  const project = getProjectSource(slug);
  if (!project) return null;
  return <section className="project-service-links">
    <h2>{lang === 'fr' ? 'Des méthodes pour votre projet au Maroc.' : 'Methods for your project in Morocco.'}</h2>
    <p>{lang === 'fr' ? 'Découvrez les services associés et définissons ensemble le périmètre adapté à vos équipements.' : 'Explore the related services and discuss the scope suited to your equipment.'}</p>
    {services.filter(service => project.services.includes(service.id)).map(service => <Link className="text-link" key={service.id} href={linkTo(lang, 'services', service[lang].slug)}>{service[lang].title}<ArrowRight size={16}/></Link>)}
  </section>;
}
