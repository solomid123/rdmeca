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
      timer=setInterval(()=>{length+=1;setVisible(text.slice(0,length));if(length>=text.length)clearInterval(timer);},55);
    },{threshold:.2});
    if(host.current)observer.observe(host.current);
    return()=>{observer.disconnect();clearInterval(timer);};
  },[text]);
  return <span ref={host} className="ag-typed"><span className="sr-only">{text}</span><span className="ag-typed-measure" aria-hidden="true">{text}</span><span className="ag-typed-visible" aria-hidden="true">{visible}</span></span>;
}

type Shape='brackets'|'rings';
type Point={u:number;v:number;depth:number;phase:number;sx:number;sy:number;x:number;y:number;ready:boolean};
const TAU=Math.PI*2;
const fraction=(n:number)=>n-Math.floor(n);
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;

// Sample the silhouettes directly; canvas particles remain independent of the text.
function silhouette(shape:Shape,index:number):[number,number] {
  const u=fraction(index*.61803398875),v=fraction(index*.754877666);
  if(shape==='rings'){
    const ring=index%6,angle=-Math.PI/2+ring*TAU/6;
    const radius=.059+v*.063;
    return [Math.cos(angle)*.346+Math.cos(u*TAU)*radius,Math.sin(angle)*.346+Math.sin(u*TAU)*radius];
  }
  const side=index%2===0?-1:1;
  const nodes=[[.22,-.41],[.30,-.41],[.35,-.36],[.35,-.18],[.37,-.10],[.43,-.035],[.44,0],[.43,.035],[.37,.10],[.35,.18],[.35,.36],[.30,.41],[.22,.41]];
  const segment=u*(nodes.length-1),i=Math.floor(segment),t=segment-i;
  const a=nodes[Math.max(0,i-1)],b=nodes[i],c=nodes[Math.min(i+1,nodes.length-1)],d=nodes[Math.min(i+2,nodes.length-1)];
  const cubic=(n:number)=>.5*(2*b[n]+(-a[n]+c[n])*t+(2*a[n]-5*b[n]+4*c[n]-d[n])*t*t+(-a[n]+3*b[n]-3*c[n]+d[n])*t*t*t);
  return [side*(cubic(0)+(v-.5)*.036),cubic(1)];
}

export default function FlightField({dark=false,shape,formed=false}:{dark?:boolean;shape?:Shape;formed?:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null),interaction=useRef(false),wake=useRef<()=>void>(()=>{});
  useEffect(()=>{interaction.current=formed;wake.current();},[formed]);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let width=1,height=1,frame=0,visible=false,last=0,time=0,morph=0,pulseAge=3,lastFormed=false,points:Point[]=[];
    const cursor={x:-1000,y:-1000};
    const colours=dark?['#7c70ff','#b4abff','#524cf3','#9387f0']:['#4544df','#5c51c9','#7764c2','#3430b8'];
    const draw=(dt:number)=>{
      const moving=!media.matches;
      const target=interaction.current?1:0;
      if(lastFormed!==interaction.current){lastFormed=interaction.current;pulseAge=0;}
      if(moving){time+=dt;pulseAge+=dt;morph=mix(morph,target,1-Math.exp(-dt*9));}else morph=target;
      const beatPhase=(time%3.4)/3.4;
      const beat=Math.exp(-Math.pow((beatPhase-.12)/.045,2))+.55*Math.exp(-Math.pow((beatPhase-.24)/.065,2));
      const breath=Math.sin(time)*.065+Math.cos(time*3)*.042+beat*.024;
      const span=Math.min(width*.98,height*.94);
      const columns=Math.ceil(Math.sqrt(points.length*width/height)),rows=Math.ceil(points.length/columns);
      ctx.clearRect(0,0,width,height);
      for(let i=0;i<points.length;i++){
        const p=points[i];let x:number,y:number,angle:number;
        if(shape){
          x=((i%columns)+.5)/columns*width+(Math.sin(time*.8+p.v*6)+Math.sin(p.phase)*.4)*7*p.depth;
          y=(Math.floor(i/columns)+.5)/rows*height+Math.cos(time*.9+p.u*7)*9*p.depth;
          angle=time*.12+p.phase;
          if(i%10<6){
            const swell=1+breath*.35;
            const tx=width*.5+p.sx*span*swell+Math.sin(time*1.8+p.phase)*1.7;
            const ty=height*.5+p.sy*span*swell+Math.cos(time*1.6+p.phase)*1.7;
            x=mix(x,tx,morph);y=mix(y,ty,morph);
          }
          if(moving&&pulseAge<2.1){
            const dx=x-width*.5,dy=y-height*.5,distance=Math.hypot(dx,dy);
            const radius=pulseAge*.6*span;
            const ripple=Math.exp(-Math.pow((distance-radius)/(span*.08),2))*(1-pulseAge/2.1)*18*(1-morph*.75);
            if(distance){x+=dx/distance*ripple;y+=dy/distance*ripple;}
          }
        }else{
          // A breathing, rotating field: neighbouring particles share the same waves.
          const theta=p.u*TAU+time*(.075+p.depth*.015);
          const base=.15+Math.sqrt(p.v)*.92;
          const radius=base*(1+breath)+Math.sin(theta*3+time*.55)*.026;
          const centreX=width*.5+Math.sin(time*.33)*height*.15+Math.sin(time*.17+1)*height*.07;
          const centreY=height*.5+Math.sin(time*.28)*height*.06;
          x=centreX+Math.cos(theta)*radius*width*.66;
          y=centreY+Math.sin(theta)*radius*height*.74;
          angle=theta+Math.PI/2;
        }
        const dx=x-cursor.x,dy=y-cursor.y,distance=Math.hypot(dx,dy);
        if(moving&&distance>0&&distance<125){const push=(1-distance/125)*18*(shape?1-morph:.7);x+=dx/distance*push;y+=dy/distance*push;}
        if(!p.ready||!moving){p.x=x;p.y=y;p.ready=true;}else{const follow=1-Math.exp(-dt*14);p.x=mix(p.x,x,follow);p.y=mix(p.y,y,follow);}
        if(p.x< -8||p.x>width+8||p.y< -8||p.y>height+8)continue;
        const shaped=shape&&i%10<6?morph:0;
        const size=shape?mix(.7+p.depth*.55,1.35+p.depth*.7,shaped):.75+p.depth*.85;
        ctx.globalAlpha=shape?mix(.25+p.depth*.35,.7+p.depth*.25,shaped):(dark?.3:.22)+p.depth*.56;
        ctx.fillStyle=shape?(shaped>.08?'#4544df':i%9===0?'#7564cf':'#34343e'):colours[Math.floor(p.u*4)%4];
        if(shape){ctx.beginPath();ctx.arc(p.x,p.y,size*.6,0,TAU);ctx.fill();}else{
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
          ctx.fillRect(-size*.45,-size, size*.9,size*(1.8+p.depth));ctx.restore();
        }
      }
      ctx.globalAlpha=1;
      canvas.dataset.motion=media.matches?'reduced':visible&&!document.hidden?'running':'paused';
      canvas.dataset.morph=morph.toFixed(3);
    };
    const animate=(now:number)=>{
      frame=0;if(!visible||document.hidden)return;
      const dt=Math.min((now-last)/1000,.05);last=now;draw(dt);
      if(!media.matches)frame=requestAnimationFrame(animate);
    };
    const resume=()=>{if(!visible||document.hidden)return;if(media.matches)draw(0);else if(!frame){last=performance.now();frame=requestAnimationFrame(animate);}};
    wake.current=resume;
    const resize=new ResizeObserver(()=>{
      const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
      const scale=Math.min(window.devicePixelRatio||1,1.75);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);ctx.setTransform(scale,0,0,scale,0,0);
      const count=Math.min(shape?1800:1500,Math.max(400,Math.round(width*height/(shape?390:950))));
      points=Array.from({length:count},(_,i)=>{const [sx,sy]=shape?silhouette(shape,i):[0,0];return {u:fraction(i*.61803398875),v:fraction(i*.41421356237),depth:.15+fraction(i*.732)*.85,phase:i*.73,sx,sy,x:0,y:0,ready:false};});
      draw(0);resume();
    });resize.observe(canvas);
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else{cancelAnimationFrame(frame);frame=0;canvas.dataset.motion='paused';}},{rootMargin:'80px'});visibility.observe(canvas);
    const move=(event:PointerEvent)=>{if(!visible)return;const r=canvas.getBoundingClientRect();cursor.x=event.clientX-r.left;cursor.y=event.clientY-r.top;};
    const resetCursor=()=>{cursor.x=-1000;cursor.y=-1000;};
    const policy=()=>{cancelAnimationFrame(frame);frame=0;resume();};
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',resetCursor);document.addEventListener('visibilitychange',policy);media.addEventListener('change',policy);
    return()=>{wake.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('blur',resetCursor);document.removeEventListener('visibilitychange',policy);media.removeEventListener('change',policy);};
  },[dark,shape]);
  return <canvas ref={ref} className="ag-particles" data-shape={shape||'flow'} aria-hidden="true"/>;
}
