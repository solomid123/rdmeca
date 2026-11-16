'use client';
import {useEffect,useRef,useState} from 'react';

export function TypedText({text}:{text:string}) {
  const [visible,setVisible]=useState(text);
  const host=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    setVisible(text);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let timer:ReturnType<typeof setInterval>|undefined;
    const observer=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      observer.disconnect();let length=0;setVisible('');
      timer=setInterval(()=>{length+=2;setVisible(text.slice(0,length));if(length>=text.length)clearInterval(timer);},24);
    },{threshold:.2});
    if(host.current)observer.observe(host.current);
    return()=>{observer.disconnect();clearInterval(timer);};
  },[text]);
  return <span ref={host} className="ag-typed"><span className="sr-only">{text}</span><span className="ag-typed-measure" aria-hidden="true">{text}</span><span className="ag-typed-visible" aria-hidden="true">{visible}</span></span>;
}

export default function FlightField({dark=false}:{dark?:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let width=1,height=1,frame=0,active=true,tick=0;
    const cursor={x:-1000,y:-1000};
    const colours=dark?['#6355ff','#8880ec','#3430b8','#b3adff']:['#3430b8','#655bdd','#8c82bf','#24218f'];
    const points=Array.from({length:360},(_,i)=>({x:((i*0.61803398875)%1),y:((i*0.41421356237)%1),depth:.18+(i%11)/13,phase:i*.73,colour:colours[i%colours.length]}));
    const draw=()=>{
      ctx.clearRect(0,0,width,height);
      for(const p of points){
        const drift=media.matches?0:tick;
        let x=p.x*width+Math.sin(p.phase+drift*.12)*18*p.depth;
        let y=((p.y*height-drift*7*p.depth+height*10)%height);
        const dx=x-cursor.x,dy=y-cursor.y,d=Math.hypot(dx,dy);
        if(d>0&&d<150){const push=(1-d/150)*24;x+=dx/d*push;y+=dy/d*push;}
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(y-height*.5,x-width*.5)+Math.PI*.5);
        ctx.globalAlpha=(dark ? .25 : .12)+p.depth*.55;ctx.fillStyle=p.colour;
        ctx.fillRect(-.65,-1.4,1.3+p.depth*.6,2.2+p.depth*2);ctx.restore();
      }
    };
    const animate=()=>{if(!active||media.matches){frame=0;return;}tick+=.016;draw();frame=requestAnimationFrame(animate);};
    const resume=()=>{draw();if(active&&!media.matches&&!frame)frame=requestAnimationFrame(animate);};
    const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const scale=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);ctx.setTransform(scale,0,0,scale,0,0);resume();});
    resize.observe(canvas);
    const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)resume();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'});
    visibility.observe(canvas);
    const move=(event:PointerEvent)=>{const r=canvas.getBoundingClientRect();cursor.x=event.clientX-r.left;cursor.y=event.clientY-r.top;};
    const reduced=()=>{cancelAnimationFrame(frame);frame=0;resume();};
    window.addEventListener('pointermove',move,{passive:true});media.addEventListener('change',reduced);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();window.removeEventListener('pointermove',move);media.removeEventListener('change',reduced);};
  },[dark]);
  return <canvas ref={ref} className="ag-particles" aria-hidden="true"/>;
}
