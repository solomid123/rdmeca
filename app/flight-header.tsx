'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,ChevronDown,Globe,Menu,X} from 'lucide-react';
import {services,sectorData,linkTo,type Lang,type PageKey} from './site-data';

type MenuKey='expertise'|'industries'|'resources';
export default function FlightHeader({lang,page,slug,alternateSlug}:{lang:Lang;page:PageKey;slug?:string;alternateSlug?:string}) {
  const fr=lang==='fr';
  const [open,setOpen]=useState<MenuKey|null>(null),[mobile,setMobile]=useState(false),[announcement,setAnnouncement]=useState(true),[hidden,setHidden]=useState(false);
  const header=useRef<HTMLElement>(null);
  const resourceLinks:[PageKey,string][]=[['blog',fr?'Journal':'Journal'],['videos',fr?'Médiathèque':'Media library'],['press',fr?'Presse':'Press'],['method',fr?'Notre méthode':'Our method']];
  useEffect(()=>{setOpen(null);setMobile(false);},[lang,page,slug]);
  useEffect(()=>{
    let previous=window.scrollY;
    const scroll=()=>{const next=window.scrollY;if(Math.abs(next-previous)<5)return;setHidden(next>previous&&next>100);previous=next;};
    window.addEventListener('scroll',scroll,{passive:true});
    return()=>window.removeEventListener('scroll',scroll);
  },[]);
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){header.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus();setOpen(null);setMobile(false);}};
    const outside=(e:PointerEvent)=>{if(header.current&&!header.current.contains(e.target as Node))setOpen(null);};
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
  },[]);
  useEffect(()=>{document.body.classList.toggle('ag-menu-open',mobile);return()=>document.body.classList.remove('ag-menu-open');},[mobile]);
  const toggle=(key:MenuKey)=>setOpen(current=>current===key?null:key);
  const menus:{key:MenuKey;label:string;heading:string;overview:PageKey;links:{href:string;title:string;description?:string}[]}[]=[
    {key:'expertise',label:fr?'Expertises':'Expertise',heading:fr?'De la conception à l’exploitation.':'From design to operation.',overview:'services',links:services.map(service=>({href:linkTo(lang,'services',service[lang].slug),title:service[lang].title,description:service[lang].short}))},
    {key:'industries',label:fr?'Secteurs':'Industries',heading:fr?'L’ingénierie dans votre industrie.':'Engineering for your industry.',overview:'sectors',links:sectorData.map(sector=>({href:linkTo(lang,'sectors',sector.id),title:sector[lang].title,description:sector[lang].intro}))},
    {key:'resources',label:fr?'Ressources':'Resources',heading:fr?'Explorer la mécanique et notre activité.':'Explore engineering and our work.',overview:'blog',links:resourceLinks.map(([key,title])=>({href:linkTo(lang,key),title}))}
  ];
  const selected=menus.find(menu=>menu.key===open);
  const close=()=>{setOpen(null);setMobile(false);};
  const trigger=(menu:typeof menus[number])=><button type="button" aria-expanded={open===menu.key} aria-controls={'ag-menu-'+menu.key} onClick={()=>toggle(menu.key)}>{menu.label}<ChevronDown size={15}/></button>;
  return <header className={'ag-header'+(hidden&&!open&&!mobile?' ag-header-hidden':'')} ref={header}>
    <div className="ag-header-bar">
      <Link href={linkTo(lang,'home')} className="ag-brand" aria-label={'R&D MECA / '+(fr?'Accueil':'Home')} onClick={close}><img src="/assets/rdmeca-symbol-color.png" alt="" width="773" height="500"/><span>R&amp;D MECA</span></Link>
      <nav className="ag-desktop-nav" aria-label={fr?'Navigation principale':'Main navigation'}>{trigger(menus[0])}{trigger(menus[1])}<Link href={linkTo(lang,'portfolio')} aria-current={page==='portfolio'?'page':undefined}>Portfolio</Link><Link href={linkTo(lang,'about')} aria-current={page==='about'?'page':undefined}>{fr?'Entreprise':'Company'}</Link>{trigger(menus[2])}</nav>
      <div className="ag-header-actions"><Link className="ag-header-contact" href={linkTo(lang,'contact')}>{fr?'Parlons projet':'Let’s talk'}<ArrowRight size={16}/></Link><div className="ag-language"><Globe size={14}/><Link href={linkTo('fr',page,lang==='fr'?slug:alternateSlug)} lang="fr" aria-current={fr?'page':undefined}>FR</Link><span>/</span><Link href={linkTo('en',page,lang==='en'?slug:alternateSlug)} lang="en" aria-current={!fr?'page':undefined}>EN</Link></div><button type="button" className="ag-menu-toggle" aria-controls="ag-mobile-menu" aria-expanded={mobile} aria-label={mobile?(fr?'Fermer le menu':'Close menu'):(fr?'Ouvrir le menu':'Open menu')} onClick={()=>{setMobile(value=>!value);setOpen(null);}}>{mobile?<X/>:<Menu/>}</button></div>
    </div>
    {selected&&!mobile&&<div className="ag-mega-menu" id={'ag-menu-'+selected.key}><div className="ag-mega-intro"><p>{selected.heading}</p><Link href={linkTo(lang,selected.overview)} onClick={close}>{fr?'Voir l’ensemble':'See overview'}<ArrowRight size={18}/></Link></div><div className="ag-mega-links">{selected.links.map(link=><Link key={link.href} href={link.href} onClick={close}><span>{link.title}</span>{link.description&&<small>{link.description}</small>}</Link>)}</div></div>}
    {mobile&&<nav className="ag-mobile-menu" id="ag-mobile-menu" aria-label={fr?'Navigation mobile':'Mobile navigation'}>{menus.map(menu=><div className="ag-mobile-group" key={menu.key}>{trigger(menu)}{open===menu.key&&<div id={'ag-menu-'+menu.key}><Link href={linkTo(lang,menu.overview)} onClick={close}>{fr?'Vue d’ensemble':'Overview'}</Link>{menu.links.map(link=><Link key={link.href} href={link.href} onClick={close}>{link.title}</Link>)}</div>}</div>)}<Link href={linkTo(lang,'portfolio')} onClick={close}>Portfolio</Link><Link href={linkTo(lang,'about')} onClick={close}>{fr?'Entreprise':'Company'}</Link><Link href={linkTo(lang,'contact')} onClick={close}>Contact</Link></nav>}
    {page==='home'&&announcement&&!mobile&&<div className="ag-announcement"><Link href={linkTo(lang,'press','mecmaroc-devient-rdmeca')}><span className="ag-news-label">{fr?'NOUVEAU':'NEW'}</span><span>{fr?'MecMaroc devient R&D MECA.':'MecMaroc becomes R&D MECA.'}</span><span className="ag-news-more">{fr?'Découvrir':'Read more'}<ArrowRight size={14}/></span></Link><button type="button" onClick={()=>setAnnouncement(false)} aria-label={fr?'Fermer l’annonce':'Dismiss announcement'}><X size={15}/></button></div>}
  </header>;
}
