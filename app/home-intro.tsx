'use client';

import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Cog,Gauge,Play} from 'lucide-react';
import {copy,services,linkTo,type Lang,type ContentItem} from './site-data';

export default function HomeIntro({lang,video,onVideo}:{lang:Lang;video?:ContentItem;onVideo:(item:ContentItem)=>void}) {
  const fr=lang==='fr';
  return <>
    <section className="hero-shell container">
      <div className="hero-layout">
        <div className="hero-message">
          <p className="hero-kicker"><span className="location-dot"/>{fr?'INGÉNIERIE & MAINTENANCE':'ENGINEERING & MAINTENANCE'}<span className="hero-country">{fr?'MAROC':'MOROCCO'}</span></p>
          <h1>{fr?'L’ingénierie de précision.':'Precision engineering.'}<br/><span>{fr?'La performance industrielle.':'Industrial performance.'}</span></h1>
          <p className="hero-description">{copy[lang].lead}</p>
          <div className="hero-cta-row"><Link className="button button-light" href={linkTo(lang,'contact')}>{fr?'Parlons de votre projet':'Let’s discuss your project'}<ArrowUpRight/></Link><Link className="hero-explore" href={linkTo(lang,'services')}>{fr?'Nos expertises':'Our expertise'}<ArrowRight/></Link></div>
          <div className="hero-disciplines">{(fr?['Conception','Simulation','Maintenance']:['Design','Simulation','Maintenance']).map(label=><span key={label}>{label}</span>)}</div>
        </div>
        <figure className="hero-scene">
          <img src="/assets/hero.webp" alt={fr?'Usinage de précision d’une pièce mécanique':'Precision machining of a mechanical component'} width="1280" height="788" fetchPriority="high"/>
          <figcaption className="scene-caption">{fr?'De l’étude au terrain.':'From design to operation.'}<ArrowUpRight/></figcaption>
          {video&&<button className="scene-play" onClick={()=>onVideo(video)} aria-label={fr?'Lire la vidéo industrielle':'Play the industrial video'}><span><Play fill="currentColor"/></span>{fr?'Voir en mouvement':'See it in motion'}</button>}
          <div className="scene-note"><span className="scene-icon"><Cog/></span><div><strong>{fr?'Une vision technique.':'Engineering insight.'}</strong><p>{fr?'Ancrée dans votre réalité.':'Grounded in your reality.'}</p></div></div>
        </figure>
      </div>
    </section>
    <nav className="capability-links container" aria-label={fr?'Explorer nos domaines':'Explore our disciplines'}>{[services[0],services[1],services[3]].map((service,i)=><Link key={service.id} href={linkTo(lang,'services',service[lang].slug)}><span>0{i+1}</span><strong>{service[lang].title}</strong><ArrowUpRight/></Link>)}</nav>
    <section className="section home-expertise"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">{fr?'NOS EXPERTISES':'OUR EXPERTISE'}</p><h2>{fr?'Penser la mécanique.':'Think engineering.'}<br/><span>{fr?'Faire avancer l’industrie.':'Move industry forward.'}</span></h2></div><p className="section-intro">{copy[lang].serviceLead}</p></div>
      <div className="expertise-tracks">{[0,1].map(group=><article className="expertise-track" key={group}><div className="track-heading"><span className="track-icon">{group===0?<Cog/>:<Gauge/>}</span><div><p className="eyebrow">{group===0?'01 / ENGINEERING':'02 / MAINTENANCE'}</p><h3>{group===0?(fr?'Ingénierie mécanique':'Mechanical engineering'):(fr?'Maintenance industrielle':'Industrial maintenance')}</h3></div></div><div className="track-services">{services.slice(group*3,group*3+3).map(service=><Link key={service.id} href={linkTo(lang,'services',service[lang].slug)}><div><h4>{service[lang].title}</h4><p>{service[lang].short}</p></div><ArrowUpRight/></Link>)}</div></article>)}</div>
    </div></section>
  </>;
}
