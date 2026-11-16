'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,ChevronDown,Globe,Menu,X} from 'lucide-react';
import {services,sectorData,linkTo,type Lang,type PageKey} from './site-data';

type MenuKey='expertise'|'industries'|'resources';
export default function FlightHeader({lang,page,slug,alternateSlug}:{lang:Lang;page:PageKey;slug?:string;alternateSlug?:string}) {
  const fr=lang==='fr';
  const [open,setOpen]=useState<MenuKey|null>(null),[mobile,setMobile]=useState(false),[announcement,setAnnouncement]=useState(true),[hidden,setHidden]=useState(false);
  const [displayed,setDisplayed]=useState<MenuKey|null>(null),[origin,setOrigin]=useState<'hover'|'keyboard'|'click'|null>(null);
  const header=useRef<HTMLElement>(null);
  const active=useRef<MenuKey|null>(null),leaveTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),keyboard=useRef(false);
  const cancelLeave=()=>clearTimeout(leaveTimer.current);
  const closeDropdown=()=>{cancelLeave();active.current=null;setOpen(null);};
  const showDropdown=(key:MenuKey,source:'hover'|'keyboard'|'click')=>{cancelLeave();if(active.current===key)return;active.current=key;setDisplayed(key);setOrigin(source);setOpen(key);};
  const leaveHeader=()=>{if(mobile)return;cancelLeave();leaveTimer.current=setTimeout(()=>{if(keyboard.current&&header.current?.contains(document.activeElement))return;closeDropdown();},140);};
  const resourceLinks:[PageKey,string][]=[['blog',fr?'Journal':'Journal'],['videos',fr?'Médiathèque':'Media library'],['press',fr?'Presse':'Press'],['method',fr?'Notre méthode':'Our method']];
  useEffect(()=>{clearTimeout(leaveTimer.current);active.current=null;setOpen(null);setDisplayed(null);setMobile(false);},[lang,page,slug]);
  useEffect(()=>{if(open||!displayed)return;const timer=setTimeout(()=>setDisplayed(null),220);return()=>clearTimeout(timer);},[open,displayed]);
  useEffect(()=>()=>clearTimeout(leaveTimer.current),[]);
  useEffect(()=>{
    const narrow=window.matchMedia('(max-width: 1024px)');
    const change=()=>{clearTimeout(leaveTimer.current);active.current=null;setOpen(null);setDisplayed(null);setMobile(false);};
    narrow.addEventListener('change',change);return()=>narrow.removeEventListener('change',change);
  },[]);
  useEffect(()=>{
    let previous=window.scrollY;
    const scroll=()=>{const next=window.scrollY;if(Math.abs(next-previous)<5)return;setHidden(next>previous&&next>100);previous=next;};
    window.addEventListener('scroll',scroll,{passive:true});
    return()=>window.removeEventListener('scroll',scroll);
  },[]);
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))keyboard.current=true;if(e.key==='Escape'){header.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus();clearTimeout(leaveTimer.current);active.current=null;setOpen(null);setMobile(false);}};
    const outside=(e:PointerEvent)=>{keyboard.current=false;if(header.current&&!header.current.contains(e.target as Node)){clearTimeout(leaveTimer.current);active.current=null;setOpen(null);}};
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
  },[]);
  useEffect(()=>{document.body.classList.toggle('ag-menu-open',mobile);return()=>document.body.classList.remove('ag-menu-open');},[mobile]);
  const toggle=(key:MenuKey)=>setOpen(current=>current===key?null:key);
  const menus:{key:MenuKey;label:string;heading:string;overview:PageKey;links:{href:string;title:string;description?:string}[]}[]=[
    {key:'expertise',label:fr?'Expertises':'Expertise',heading:fr?'De la conception à l’exploitation.':'From design to operation.',overview:'services',links:services.map(service=>({href:linkTo(lang,'services',service[lang].slug),title:service[lang].title,description:service[lang].short}))},
    {key:'industries',label:fr?'Secteurs':'Industries',heading:fr?'L’ingénierie dans votre industrie.':'Engineering for your industry.',overview:'sectors',links:sectorData.map(sector=>({href:linkTo(lang,'sectors',sector.id),title:sector[lang].title,description:sector[lang].intro}))},
    {key:'resources',label:fr?'Ressources':'Resources',heading:fr?'Explorer la mécanique et notre activité.':'Explore engineering and our work.',overview:'blog',links:[...resourceLinks.map(([key,title])=>({href:linkTo(lang,key),title})),{href:linkTo(lang,'method')+'#robot-lab-heading',title:fr?'Exploration 3D':'3D exploration'}]}
  ];
  const selected=menus.find(menu=>menu.key===(open||displayed));
  const close=()=>{closeDropdown();setMobile(false);};
  const trigger=(menu:typeof menus[number],touch=false)=><button type="button" aria-expanded={open===menu.key} aria-controls={'ag-menu-'+menu.key} onPointerEnter={touch?undefined:event=>{if(event.pointerType==='mouse'&&window.matchMedia('(hover: hover)').matches){keyboard.current=false;showDropdown(menu.key,'hover');}}} onFocus={touch?undefined:()=>showDropdown(menu.key,'keyboard')} onClick={()=>touch?toggle(menu.key):showDropdown(menu.key,'click')} onKeyDown={touch?undefined:event=>{if(event.key==='ArrowDown'){event.preventDefault();keyboard.current=true;showDropdown(menu.key,'keyboard');requestAnimationFrame(()=>header.current?.querySelector<HTMLAnchorElement>('#ag-menu-'+menu.key+' a')?.focus());}}}>{menu.label}<ChevronDown size={15}/></button>;
  return <><header className={'ag-header'+(open||displayed?' ag-header-dropdown':'')+(hidden&&!open&&!displayed&&!mobile?' ag-header-hidden':'')} data-menu-origin={origin} ref={header} onPointerEnter={cancelLeave} onPointerLeave={leaveHeader} onBlurCapture={event=>{if(!mobile&&keyboard.current&&!event.currentTarget.contains(event.relatedTarget))closeDropdown();}}>
    <div className="ag-header-bar">
      <Link href={linkTo(lang,'home')} className="ag-brand" aria-label={'R&D MECA / '+(fr?'Accueil':'Home')} onClick={close}><img src="/assets/rdmeca-symbol-color.png" alt="" width="773" height="500"/><span>R&amp;D MECA</span></Link>
      <nav className="ag-desktop-nav" aria-label={fr?'Navigation principale':'Main navigation'}>{trigger(menus[0])}{trigger(menus[1])}<Link href={linkTo(lang,'portfolio')} onPointerEnter={closeDropdown} onFocus={closeDropdown} aria-current={page==='portfolio'?'page':undefined}>Portfolio</Link><Link href={linkTo(lang,'about')} onPointerEnter={closeDropdown} onFocus={closeDropdown} aria-current={page==='about'?'page':undefined}>{fr?'Entreprise':'Company'}</Link>{trigger(menus[2])}</nav>
      <div className="ag-header-actions"><Link className="ag-header-contact" href={linkTo(lang,'contact')}>{fr?'Parlons projet':'Let’s talk'}<ArrowRight size={16}/></Link><div className="ag-language"><Globe size={14}/><Link href={linkTo('fr',page,lang==='fr'?slug:alternateSlug)} lang="fr" aria-current={fr?'page':undefined}>FR</Link><span>/</span><Link href={linkTo('en',page,lang==='en'?slug:alternateSlug)} lang="en" aria-current={!fr?'page':undefined}>EN</Link></div><button type="button" className="ag-menu-toggle" aria-controls="ag-mobile-menu" aria-expanded={mobile} aria-label={mobile?(fr?'Fermer le menu':'Close menu'):(fr?'Ouvrir le menu':'Open menu')} onClick={()=>{closeDropdown();setDisplayed(null);setMobile(value=>!value);}}>{mobile?<X/>:<Menu/>}</button></div>
    </div>
    {selected&&!mobile&&<div key={selected.key} className={'ag-mega-menu'+(!open?' is-closing':'')} id={'ag-menu-'+selected.key} aria-hidden={!open} inert={!open}><div className="ag-mega-inner"><div className="ag-mega-intro"><p>{selected.heading}</p><Link href={linkTo(lang,selected.overview)} onClick={close}>{fr?'Voir l’ensemble':'See overview'}<ArrowRight size={18}/></Link></div><div className="ag-mega-links">{selected.links.map((link,index)=><Link key={link.href} href={link.href} style={{'--menu-delay':(120+index*200/Math.max(1,selected.links.length-1))+'ms'} as React.CSSProperties} onClick={close}><span>{link.title}</span>{link.description&&<small>{link.description}</small>}</Link>)}</div></div></div>}
    {mobile&&<nav className="ag-mobile-menu" id="ag-mobile-menu" aria-label={fr?'Navigation mobile':'Mobile navigation'}>{menus.map(menu=><div className="ag-mobile-group" key={menu.key}>{trigger(menu,true)}{open===menu.key&&<div id={'ag-menu-'+menu.key}><Link href={linkTo(lang,menu.overview)} onClick={close}>{fr?'Vue d’ensemble':'Overview'}</Link>{menu.links.map(link=><Link key={link.href} href={link.href} onClick={close}>{link.title}</Link>)}</div>}</div>)}<Link href={linkTo(lang,'portfolio')} onClick={close}>Portfolio</Link><Link href={linkTo(lang,'about')} onClick={close}>{fr?'Entreprise':'Company'}</Link><Link href={linkTo(lang,'contact')} onClick={close}>Contact</Link></nav>}
    {page==='home'&&announcement&&!mobile&&<div className="ag-announcement"><Link href={linkTo(lang,'press','mecmaroc-devient-rdmeca')}><span className="ag-news-label">{fr?'NOUVEAU':'NEW'}</span><span>{fr?'MecMaroc devient R&D MECA.':'MecMaroc becomes R&D MECA.'}</span><span className="ag-news-more">{fr?'Découvrir':'Read more'}<ArrowRight size={14}/></span></Link><button type="button" onClick={()=>setAnnouncement(false)} aria-label={fr?'Fermer l’annonce':'Dismiss announcement'}><X size={15}/></button></div>}
  </header>{selected&&!mobile&&<div className={'ag-menu-backdrop'+(!open?' is-closing':'')} aria-hidden="true" onPointerDown={closeDropdown}/>}</>;
}
