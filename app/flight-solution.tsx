'use client';
import {useRef,useState} from 'react';
import Link from './site-link';
import {linkTo,services,type Lang} from './site-data';
import FlightField from './flight-field';

export default function FlightSolution({lang,group}:{lang:Lang;group:number}) {
  const [formed,setFormed]=useState(false);
  const hovered=useRef(false),focused=useRef(false);
  const sync=()=>setFormed(hovered.current||focused.current);
  const fr=lang==='fr';
  return <div className="ag-solution" data-formed={formed} onPointerEnter={()=>{hovered.current=true;sync();}} onPointerLeave={()=>{hovered.current=false;sync();}} onFocusCapture={()=>{focused.current=true;sync();}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget)){focused.current=false;sync();}}} onPointerDown={event=>{if(event.pointerType==='touch'){hovered.current=true;sync();}}}>
    <FlightField shape={group===0?'brackets':'rings'} formed={formed}/>
    <div className="ag-solution-content"><span className="ag-solution-label">{group===0?(fr?'Ingénierie mécanique':'Mechanical engineering'):(fr?'Maintenance industrielle':'Industrial maintenance')}</span><p>{group===0?(fr?'De l’idée à la fabrication.':'From idea to manufacture.'):(fr?'Au plus près du terrain.':'Close to your operations.')}</p><h2>{group===0?(fr?'Concevoir la suite.':'Design what’s next.'):(fr?'Faire durer la performance.':'Keep performance moving.')}</h2><Link className="ag-button" href={linkTo(lang,'contact')+'?service='+services[group===0?0:3].id}>{fr?'Échanger sur votre projet':'Discuss your project'}</Link></div>
  </div>;
}
