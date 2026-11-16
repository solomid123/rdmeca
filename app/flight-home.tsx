'use client';
import {useRef} from 'react';
import Link from 'next/link';
import {ArrowRight,ArrowLeft} from 'lucide-react';
import {services,copy,linkTo,type Lang,type ContentItem} from './site-data';
import FlightField,{TypedText} from './flight-field';
import FlightFilm from './flight-film';
import FlightSolution from './flight-solution';
import FlightIconWave from './flight-icon-wave';
import RobotLab from './robot-lab';

export function FlightClosing({lang}:{lang:Lang}) {
  const fr=lang==='fr';
  return <section className="ag-closing"><FlightField dark/><div><img src="/assets/rdmeca-symbol-silver.png" alt="" width="773" height="500" loading="lazy"/><h2>{fr?'Faisons avancer votre projet.':'Let’s move your project forward.'}</h2><Link className="ag-button ag-button-white" href={linkTo(lang,'contact')}>{fr?'Parlons de votre besoin':'Let’s discuss your needs'}<ArrowRight size={18}/></Link></div></section>;
}

export default function FlightHome({lang,video,items,onVideo}:{lang:Lang;video?:ContentItem;items:ContentItem[];onVideo:(item:ContentItem)=>void}) {
  const fr=lang==='fr';
  const journal=useRef<HTMLDivElement>(null);
  const featureImages=['engineering-shuttle.webp','engineering-cable.webp','service-industrialisation.webp','service-preventive.webp'];
  const featureServices=[services[0],services[1],services[2],services[3]];
  const articles=items.filter(item=>item.type==='article');
  const scrollJournal=(direction:number)=>{journal.current?.scrollBy({left:direction*(journal.current.clientWidth*.8),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  return <>
    <section className="ag-hero"><FlightField/><div className="ag-hero-content"><div className="ag-hero-brand"><img src="/assets/rdmeca-symbol-color.png" alt="" width="773" height="500"/><span>R&amp;D MECA</span></div><h1><TypedText text={fr?'L’ingénierie mécanique.\nDe l’étude au terrain.':'Mechanical engineering.\nFrom design to operation.'}/></h1><Link className="ag-button" href={linkTo(lang,'contact')}>{fr?'Parlons projet':'Let’s talk'}</Link></div></section>
    <FlightFilm lang={lang} video={video} onVideo={onVideo}/>
    <section className="ag-introduction"><FlightIconWave/><div className="ag-container"><h2><TypedText text={fr?'R&D MECA relie la conception mécanique, le calcul et la maintenance pour accompagner votre industrie.':'R&D MECA connects mechanical design, analysis and maintenance to support your industry.'}/></h2></div></section>
    <section className="ag-feature-explorer ag-container" aria-label={fr?'Nos expertises':'Our expertise'}>{featureServices.map((service,index)=><article className="ag-feature-row" key={service.id}><div className="ag-feature-copy"><Link href={linkTo(lang,'services',service[lang].slug)}><h2>{service[lang].title}</h2></Link><p>{service[lang].intro}</p><Link className="ag-arrow-link" href={linkTo(lang,'services',service[lang].slug)}>{fr?'Explorer l’expertise':'Explore expertise'}<ArrowRight size={19}/></Link>{index===3&&<div className="ag-maintenance-links">{services.slice(4).map(item=><Link key={item.id} href={linkTo(lang,'services',item[lang].slug)}>{item[lang].title}<ArrowRight size={16}/></Link>)}</div>}</div><Link className={'ag-feature-image ag-feature-image-'+index} href={linkTo(lang,'services',service[lang].slug)}><img src={'/assets/'+featureImages[index]} alt={service[lang].title} width="1400" height="1050" loading="lazy"/></Link></article>)}</section>
    <RobotLab lang={lang}/>
    <section className="ag-solutions">{[0,1].map(group=><FlightSolution key={group} lang={lang} group={group}/>)}</section>
    <section className="ag-journal ag-container"><div className="ag-journal-heading"><h2>{fr?'Le journal':'The journal'}</h2><Link className="ag-arrow-link" href={linkTo(lang,'blog')}>{fr?'Voir le journal':'View journal'}<ArrowRight size={19}/></Link></div><div className="ag-journal-track" ref={journal}>{articles.map(item=><Link className="ag-journal-card" key={item.id} href={linkTo(lang,'blog',item.slug)}><img src={item.image} alt="" width="640" height="640" loading="lazy"/><h3>{item.title}</h3><div><time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString(fr?'fr-FR':'en-GB',{day:'numeric',month:'short',year:'numeric'})}</time><span>{item.category}</span></div><span className="ag-arrow-link">{fr?'Lire l’article':'Read article'}<ArrowRight size={18}/></span></Link>)}</div><div className="ag-slider-controls"><button type="button" onClick={()=>scrollJournal(-1)} aria-label={fr?'Articles précédents':'Previous articles'}><ArrowLeft size={21}/></button><button type="button" onClick={()=>scrollJournal(1)} aria-label={fr?'Articles suivants':'Next articles'}><ArrowRight size={21}/></button></div></section>
    <section className="ag-company-strip ag-container"><div><h2>{fr?'Une question technique ?':'A technical question?'}</h2><p>{copy[lang].finalText}</p></div><Link className="ag-button" href={linkTo(lang,'contact')}>{fr?'Contactez R&D MECA':'Contact R&D MECA'}<ArrowRight size={18}/></Link></section>
    <FlightClosing lang={lang}/>
  </>;
}
