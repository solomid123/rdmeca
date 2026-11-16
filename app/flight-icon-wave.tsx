'use client';
import {useEffect,useRef,type CSSProperties} from 'react';
import {Box,Layers,Activity,Cog,Wrench,ScanLine,Ruler,Workflow,Settings2} from 'lucide-react';

const icons=[Box,Layers,Ruler,Workflow,ScanLine,Cog,Settings2,Activity,Wrench,Box,Layers,Activity,Workflow];

export default function FlightIconWave() {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const row=ref.current,section=row?.closest<HTMLElement>('.ag-introduction');if(!row||!section)return;
    const items=Array.from(row.querySelectorAll<HTMLElement>(':scope>span'));
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,last=0,time=0,active=false,started=false,dirty=true,width=window.innerWidth,centres:number[]=[];
    const moving=()=>active&&started&&!reduced.matches&&!document.hidden;
    const draw=()=>{
      if(dirty){
        const bounds=section.getBoundingClientRect();
        const progress=Math.max(0,Math.min(1,(window.innerHeight-bounds.top)/(window.innerHeight+bounds.height)));
        row.style.transform=`translate3d(${reduced.matches?0:-250*progress}px,0,0)`;dirty=false;
      }
      const phase=reduced.matches?0:(time%7)/7;
      items.forEach((item,index)=>{const y=Math.sin((centres[index]/width+phase)*Math.PI*2)*35;item.style.transform=`translate3d(0,${y}px,0)`;});
      row.dataset.motion=reduced.matches?'reduced':moving()?'running':'paused';
      row.dataset.phase=phase.toFixed(3);
    };
    const update=(now:number)=>{
      frame=0;const dt=Math.min((now-last)/1000,.06);last=now;
      if(moving())time+=dt;draw();if(moving())frame=requestAnimationFrame(update);
    };
    const resume=()=>{if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(update);}};
    const measure=()=>{
      width=Math.max(1,window.innerWidth);const bounds=row.getBoundingClientRect();
      centres=items.map(item=>{const box=item.getBoundingClientRect();return box.left-bounds.left+box.width/2;});
      dirty=true;draw();resume();
    };
    const resize=new ResizeObserver(measure);resize.observe(row);
    const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)resume();else{cancelAnimationFrame(frame);frame=0;row.dataset.motion=reduced.matches?'reduced':'paused';}},{rootMargin:'40px'});visibility.observe(row);
    const start=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){started=true;start.disconnect();resume();}},{rootMargin:'0px 0px -45% 0px'});start.observe(section);
    const scroll=()=>{dirty=true;resume();};
    const policy=()=>{cancelAnimationFrame(frame);frame=0;dirty=true;resume();};
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',measure,{passive:true});
    document.addEventListener('visibilitychange',policy);reduced.addEventListener('change',policy);measure();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();start.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',measure);document.removeEventListener('visibilitychange',policy);reduced.removeEventListener('change',policy);};
  },[]);
  return <div ref={ref} className="ag-icon-wave" aria-hidden="true">{icons.map((Icon,index)=><span key={index} style={{'--wave':Math.sin(index*.5)*-35+'px'} as CSSProperties}><Icon strokeWidth={1.3}/></span>)}</div>;
}
