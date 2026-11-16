'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Pause,Play} from 'lucide-react';
import type {Lang} from './site-data';

const visuals:Record<string,{image:string;video?:string}>={
  design:{image:'expertise-design.webp'},
  analysis:{image:'expertise-analysis.webp'},
  industrialisation:{image:'expertise-industrialisation.webp',video:'expertise-industrialisation.mp4'},
  preventive:{image:'expertise-preventive.webp',video:'expertise-preventive.mp4'},
};
type Props={id:string;fallback:string;alt:string;lang:Lang;href?:string;eager?:boolean};

function AnimatedVisual({source,poster,alt,lang,href}:{source:string;poster:string;alt:string;lang:Lang;href?:string}) {
  const video=useRef<HTMLVideoElement>(null);
  const intent=useRef<boolean|null>(null);
  const toggle=useRef<()=>void>(()=>{});
  const [playing,setPlaying]=useState(false);

  useEffect(()=>{
    const player=video.current;
    if(!player)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=false;
    let disposed=false;
    const update=()=>{
      const allowed=intent.current??!motion.matches;
      if(!visible||document.hidden||!allowed){player.pause();return;}
      if(!player.hasAttribute('src'))player.src='/assets/'+source;
      void player.play().catch(()=>{});
    };
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      update();
    });
    observer.observe(player);
    document.addEventListener('visibilitychange',update);
    motion.addEventListener('change',update);
    toggle.current=()=>{
      intent.current=player.paused;
      update();
    };
    const onPlay=()=>{if(!disposed)setPlaying(true);};
    const onPause=()=>{if(!disposed)setPlaying(false);};
    player.addEventListener('play',onPlay);
    player.addEventListener('pause',onPause);
    return()=>{
      disposed=true;
      observer.disconnect();
      document.removeEventListener('visibilitychange',update);
      motion.removeEventListener('change',update);
      player.removeEventListener('play',onPlay);
      player.removeEventListener('pause',onPause);
      player.pause();
      player.removeAttribute('src');
      player.load();
      toggle.current=()=>{};
    };
  },[source]);

  const media=<video ref={video} poster={'/assets/'+poster} width="960" height="960" muted loop playsInline preload="none" aria-label={alt} data-playback={playing?'playing':'paused'}/>;
  const label=lang==='fr'?(playing?'Mettre l’animation en pause':'Lire l’animation'):(playing?'Pause animation':'Play animation');
  return <>{href?<Link className="expertise-visual-link" href={href}>{media}</Link>:media}<button type="button" className="expertise-motion-toggle" onClick={()=>toggle.current()} aria-label={label} title={label}>{playing?<Pause size={18} fill="currentColor"/>:<Play size={18} fill="currentColor"/>}</button></>;
}

export default function ExpertiseVisual({id,fallback,alt,lang,href,eager=false}:Props) {
  const asset=visuals[id];
  if(!asset)return <img src={'/assets/'+fallback} alt={alt} width="1280" height="788" loading={eager?'eager':'lazy'}/>;
  const image=<img src={'/assets/'+asset.image} alt={alt} width="1600" height="1600" loading={eager?'eager':'lazy'} decoding="async"/>;
  return <div className="expertise-visual" data-expertise={id}>{asset.video?<AnimatedVisual source={asset.video} poster={asset.image} alt={alt} lang={lang} href={href}/>:href?<Link className="expertise-visual-link" href={href}>{image}</Link>:image}</div>;
}
