'use client';
import {forwardRef,useEffect,useRef,useState,type ComponentPropsWithoutRef} from 'react';

type Props=Omit<ComponentPropsWithoutRef<'video'>,'autoPlay'>&{startTime?:number;playing?:boolean};

const VideoPlayer=forwardRef<HTMLVideoElement,Props>(function VideoPlayer({startTime=0,playing=false,loop=false,onLoadedMetadata,onSeeked,onEnded,...props},forwardedRef){
  const player=useRef<HTMLVideoElement|null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{setReady(false);},[props.src,startTime]);
  useEffect(()=>{
    const video=player.current;if(!video)return;
    if(playing&&ready)void video.play().catch(()=>{});else video.pause();
  },[playing,ready]);
  return <video {...props} ref={element=>{player.current=element;if(typeof forwardedRef==='function')forwardedRef(element);else if(forwardedRef)forwardedRef.current=element;}} loop={loop&&startTime===0} onLoadedMetadata={event=>{
    const video=event.currentTarget;
    if(startTime>0){video.currentTime=Math.min(startTime,Math.max(0,video.duration-.01));}else setReady(true);
    onLoadedMetadata?.(event);
  }} onSeeked={event=>{setReady(true);onSeeked?.(event);}} onEnded={event=>{
    if(loop&&startTime>0){event.currentTarget.currentTime=startTime;if(playing)void event.currentTarget.play().catch(()=>{});}
    onEnded?.(event);
  }}/>;
});
export default VideoPlayer;
