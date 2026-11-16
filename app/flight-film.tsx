'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {Play} from 'lucide-react';
import {type ContentItem,type Lang} from './site-data';
import VideoPlayer from './video-player';

export default function FlightFilm({lang,video,onVideo,paused=false}:{lang:Lang;video?:ContentItem;onVideo:(item:ContentItem)=>void;paused?:boolean}) {
  const host=useRef<HTMLElement>(null),player=useRef<HTMLVideoElement>(null);
  const [playing,setPlaying]=useState(false);
  const cursor=useRef<HTMLSpanElement>(null);
  const cursorTransition=useRef<number>(0);
  const positionCursor=(event:PointerEvent<HTMLButtonElement>,jump=false)=>{
    if(event.pointerType!=='mouse'||!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    const target=cursor.current,button=event.currentTarget;if(!target)return;
    const bounds=button.getBoundingClientRect();
    const halfWidth=target.offsetWidth/2+12,halfHeight=target.offsetHeight/2+12;
    const x=Math.max(halfWidth,Math.min(button.clientWidth-halfWidth,(event.clientX-bounds.left)*button.clientWidth/bounds.width));
    const y=Math.max(halfHeight,Math.min(button.clientHeight-halfHeight,(event.clientY-bounds.top)*button.clientHeight/bounds.height));
    target.style.left='0';target.style.top='0';
    if(jump){cancelAnimationFrame(cursorTransition.current);target.style.transition='none';}
    target.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(jump)cursorTransition.current=requestAnimationFrame(()=>{target.style.transition='';});
  };
  useEffect(()=>()=>cancelAnimationFrame(cursorTransition.current),[]);
  useEffect(()=>{
    const section=host.current;if(!section)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,last=0,scale=window.innerWidth<=768?.92:.5;
    const update=(now:number)=>{
      frame=0;
      const small=window.innerWidth<=768;
      const start=small?.92:.5;
      const distance=window.innerHeight*(small?.2:.5);
      const progress=Math.max(0,Math.min(1,(window.innerHeight-section.getBoundingClientRect().top)/distance));
      const target=reduced.matches?1:start+(1-start)*(1-Math.pow(1-progress,3));
      const dt=Math.min((now-last)/1000,.064);last=now;
      scale=reduced.matches?target:scale+(target-scale)*(1-Math.exp(-dt*5));
      if(Math.abs(target-scale)<.0001)scale=target;
      section.style.setProperty('--film-scale',String(scale));
      section.dataset.reveal=String(progress.toFixed(3));
      section.dataset.scale=String(scale.toFixed(4));
      if(Math.abs(target-scale)>.0001&&!document.hidden)frame=requestAnimationFrame(update);
    };
    const schedule=()=>{if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(update);}};
    const resize=new ResizeObserver(schedule);resize.observe(section);
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
    reduced.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);schedule();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);document.removeEventListener('visibilitychange',schedule);};
  },[]);
  useEffect(()=>{
    const element=player.current;if(!element)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
    const playback=()=>setPlaying(visible&&!document.hidden&&!reduced.matches&&!paused);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();},{threshold:.1});
    observer.observe(element);reduced.addEventListener('change',playback);document.addEventListener('visibilitychange',playback);
    return()=>{observer.disconnect();element.pause();reduced.removeEventListener('change',playback);document.removeEventListener('visibilitychange',playback);};
  },[video?.mediaUrl,paused]);
  const fr=lang==='fr';
  return <section ref={host} className="ag-film-scroll" aria-label={fr?'La mécanique en mouvement':'Engineering in motion'}><div className="ag-film">{video?<><VideoPlayer ref={player} startTime={video.startTime} playing={playing} src={video.mediaUrl||undefined} poster={video.image} muted loop playsInline preload="metadata" aria-hidden="true"/><button type="button" className="ag-film-trigger" onPointerEnter={event=>positionCursor(event,true)} onPointerMove={event=>positionCursor(event)} onFocus={event=>{if(event.currentTarget.matches(':focus-visible')&&cursor.current){cursor.current.style.left='50%';cursor.current.style.top='50%';cursor.current.style.transform='none';}}} onClick={()=>onVideo(video)} aria-label={fr?'Lire l’intro':'Play intro'}><span ref={cursor} className="ag-film-cursor" aria-hidden="true"><span className="ag-film-cursor-pill"><Play size={17} fill="currentColor"/>{fr?'Lire l’intro':'Play intro'}</span></span></button><span className="ag-film-caption">{fr?'La mécanique en mouvement.':'Engineering in motion.'}</span></>:<img src="/assets/process-operation.webp" alt={fr?'Assemblage mécanique dans un équipement':'Mechanical assembly in equipment'} width="1400" height="788"/>}</div></section>;
}
