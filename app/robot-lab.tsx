'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Box, Grid3X3, RotateCcw, Play, Pause, Maximize2, Minimize2, Plus, Minus, Move, MousePointer2, LoaderCircle} from 'lucide-react';
import {linkTo, type Lang} from './site-data';
import type {RobotEngine, RobotStage, RobotView} from './robot-engine';

export default function RobotLab({lang}: {lang: Lang}) {
  const fr = lang === 'fr';
  const section = useRef<HTMLElement>(null), viewer = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const engine = useRef<RobotEngine | null>(null), stageRef = useRef<RobotStage>(0);
  const nativeFullScreen = useRef(false);
  const [stage, setStage] = useState<RobotStage>(0), [retry, setRetry] = useState(0);
  const [state, setState] = useState<'idle' | 'component' | 'assembly' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0), [rotating, setRotating] = useState(true), [mesh, setMesh] = useState(true);
  const [fullScreen, setFullScreen] = useState(false), [view, setView] = useState<RobotView>('isometric');
  const stages = fr ? [
    {label: 'Conception', code: 'CAO', title: 'La géométrie, sous tous les angles.', description: 'Isolez le bras structurel du robot. Explorez ses volumes, ses interfaces et ses deux articulations.'},
    {label: 'Maillage', code: 'SURFACE', title: 'Lire la structure de la pièce.', description: 'La triangulation se superpose à la géométrie. Rapprochez-vous des articulations pour examiner le maillage de surface.'},
    {label: 'Contraintes', code: 'σ REL.', title: 'Une autre lecture de la même géométrie.', description: 'Un champ qualitatif de flexion habille la géométrie du bleu au rouge. Faites tourner la pièce pour observer sa répartition sur les faces.'},
    {label: 'Intégration', code: 'ROBOT', title: 'Retrouver la pièce dans son ensemble.', description: 'Le bras rejoint le robot complet, avec ses couleurs d’origine. Explorez ses interfaces et sa place dans l’assemblage.'},
  ] : [
    {label: 'Design', code: 'CAD', title: 'Geometry, from every angle.', description: 'Isolate the robot’s structural arm. Explore its volumes, interfaces and two joints.'},
    {label: 'Meshing', code: 'SURFACE', title: 'Read the component’s structure.', description: 'Triangulation is layered over the geometry. Zoom into the joints to inspect the surface mesh.'},
    {label: 'Stress', code: 'REL. σ', title: 'Another perspective on the same geometry.', description: 'A qualitative bending field colours the geometry from blue to red. Rotate the component to explore how it varies across the surfaces.'},
    {label: 'Integration', code: 'ROBOT', title: 'See the component in context.', description: 'The arm returns to the complete robot in its original colours. Explore its interfaces and its position within the assembly.'},
  ];

  useEffect(() => {
    const element = section.current, surface = host.current;
    if (!element || !surface) return;
    const abort = new AbortController(); let disposed = false, started = false, active = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)'); setRotating(!reduced.matches);
    const start = async () => {
      if (started) return; started = true; setState('component'); setProgress(0);
      try {
        const {createRobotEngine} = await import('./robot-engine');
        if (disposed) return;
        engine.current = createRobotEngine(surface, {
          onLoad(next, value) {if (!disposed) {setState(next); if (value !== undefined) setProgress(value);}},
          onInteraction() {if (!disposed) setRotating(false);},
        }, abort.signal);
        engine.current.setStage(stageRef.current); engine.current.setActive(active && !document.hidden);
      } catch {if (!disposed) setState('error');}
    };
    const preload = new IntersectionObserver(entries => {if (entries[0].isIntersecting) {void start(); preload.disconnect();}}, {rootMargin: '550px'});
    const visible = new IntersectionObserver(entries => {active = entries[0].isIntersecting; engine.current?.setActive(active && !document.hidden);}, {rootMargin: '40px'});
    const visibility = () => engine.current?.setActive(active && !document.hidden);
    preload.observe(element); visible.observe(surface); document.addEventListener('visibilitychange', visibility);
    return () => {disposed = true; abort.abort(); preload.disconnect(); visible.disconnect(); document.removeEventListener('visibilitychange', visibility); engine.current?.dispose(); engine.current = null;};
  }, [retry]);

  useEffect(() => {
    const change = () => {if (document.fullscreenElement === viewer.current) {nativeFullScreen.current = true; setFullScreen(true);} else if (nativeFullScreen.current) {nativeFullScreen.current = false; setFullScreen(false);}};
    document.addEventListener('fullscreenchange', change); return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    if (!fullScreen) return;
    const before = document.body.style.overflow; document.body.style.overflow = 'hidden';
    viewer.current?.querySelector<HTMLButtonElement>('[data-robot-fullscreen]')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {setFullScreen(false); if (document.fullscreenElement === viewer.current) void document.exitFullscreen().catch(() => {});}
      if (event.key !== 'Tab') return;
      const controls = Array.from(viewer.current?.querySelectorAll<HTMLElement>('button:not([disabled]),canvas[tabindex]') || []).filter(element => element.tabIndex >= 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
    };
    window.addEventListener('keydown', keyboard); return () => {document.body.style.overflow = before; window.removeEventListener('keydown', keyboard);};
  }, [fullScreen]);

  function changeStage(value: number) {
    const next = ((value + 4) % 4) as RobotStage; stageRef.current = next; setStage(next); setMesh(true); engine.current?.setStage(next);
  }
  function chooseView(value: RobotView) {setView(value); engine.current?.setView(value);}
  async function toggleFullscreen() {
    if (fullScreen) {setFullScreen(false); if (document.fullscreenElement === viewer.current) await document.exitFullscreen().catch(() => {});}
    else {setFullScreen(true); if (document.fullscreenEnabled) await viewer.current?.requestFullscreen().catch(() => {/* Retain the expanded viewport when native fullscreen is unavailable. */});}
  }
  const ready = state === 'ready' || state === 'assembly';
  const loading = state === 'idle' || state === 'component' || state === 'assembly';
  const canvasLabel = fr ? 'Vue 3D du bras du robot. Flèches pour tourner, Q et E pour le roulis, Majuscule et flèches pour déplacer, plus et moins pour zoomer, touche Début pour recentrer.' : '3D robot arm. Arrow keys rotate, Q and E roll, Shift and arrows pan, plus and minus zoom, Home resets the view.';

  return <section className="ag-process robot-lab" ref={section} aria-labelledby="robot-lab-heading">
    <div className="ag-container">
      <div className="ag-process-heading"><h2 id="robot-lab-heading">{fr ? 'Une pièce.\nQuatre regards d’ingénieur.' : 'One component.\nFour engineering perspectives.'}</h2><p>{fr ? 'De la géométrie à l’assemblage, prenez les commandes du modèle.' : 'From geometry to assembly, take control of the model.'}</p></div>
      <div className="robot-lab-viewer" ref={viewer} data-stage={stage} data-expanded={fullScreen} role={fullScreen ? 'dialog' : undefined} aria-modal={fullScreen ? true : undefined} aria-label={fullScreen ? fr ? 'Modèle 3D du robot' : '3D robot model' : undefined}>
        <div className="robot-lab-head"><div><span className="robot-lab-live"/><span>{fr ? 'BRAS STRUCTUREL' : 'STRUCTURAL ARM'}</span><span className="robot-lab-head-divider">/</span><span>{fr ? 'ROBOT INDUSTRIEL' : 'INDUSTRIAL ROBOT'}</span></div><span className="robot-lab-code">{stages[stage].code}</span></div>
        <div className="robot-lab-canvas" ref={host} id="robot-lab-panel" role="tabpanel" aria-labelledby={'robot-stage-' + stage} data-canvas-label={canvasLabel} data-status="idle" onKeyDown={event => {
          if (!(event.target instanceof HTMLCanvasElement)) return;
          if (event.shiftKey && event.key === 'ArrowLeft') engine.current?.pan(-1, 0);
          else if (event.shiftKey && event.key === 'ArrowRight') engine.current?.pan(1, 0);
          else if (event.shiftKey && event.key === 'ArrowUp') engine.current?.pan(0, 1);
          else if (event.shiftKey && event.key === 'ArrowDown') engine.current?.pan(0, -1);
          else if (event.key === 'ArrowLeft') engine.current?.rotate(-.13, 0);
          else if (event.key === 'ArrowRight') engine.current?.rotate(.13, 0);
          else if (event.key === 'ArrowUp') engine.current?.rotate(0, -.1);
          else if (event.key === 'ArrowDown') engine.current?.rotate(0, .1);
          else if (event.key.toLowerCase() === 'q') engine.current?.roll(-.13);
          else if (event.key.toLowerCase() === 'e') engine.current?.roll(.13);
          else if (event.key === '+' || event.key === '=') engine.current?.zoom(1);
          else if (event.key === '-') engine.current?.zoom(-1);
          else if (event.key === 'Home') {setView('isometric'); engine.current?.reset();}
          else return; event.preventDefault();
        }}/>
        {loading && <div className={'robot-lab-loading' + (state === 'assembly' ? ' robot-lab-loading-small' : '')} role="status"><LoaderCircle size={24}/><span>{state === 'assembly' ? fr ? 'Assemblage du robot…' : 'Assembling the robot…' : fr ? 'Ouverture du modèle…' : 'Opening the model…'}</span><div className="robot-lab-progress"><span style={{transform: `scaleX(${Math.max(.03, progress)})`}}/></div></div>}
        {state === 'error' && <div className="robot-lab-error" role="status"><Box size={32}/><p>{fr ? 'Le modèle 3D n’a pas pu s’ouvrir.' : 'The 3D model could not be opened.'}</p><button type="button" onClick={() => {setState('idle'); setRetry(value => value + 1);}}>{fr ? 'Réessayer' : 'Try again'}<RotateCcw size={16}/></button></div>}
        {stage === 2 && ready && <div className="robot-lab-legend"><span>{fr ? 'Contraintes relatives' : 'Relative stress'}</span><div/><p><span>{fr ? 'Faibles' : 'Low'}</span><span>{fr ? 'Élevées' : 'High'}</span></p></div>}
        <div className="robot-lab-toolbar">
          <div className="robot-lab-tools">
            <button type="button" disabled={!ready} aria-label={fr ? 'Zoom avant' : 'Zoom in'} title={fr ? 'Zoom avant' : 'Zoom in'} onClick={() => engine.current?.zoom(1)}><Plus size={19}/></button>
            <button type="button" disabled={!ready} aria-label={fr ? 'Zoom arrière' : 'Zoom out'} title={fr ? 'Zoom arrière' : 'Zoom out'} onClick={() => engine.current?.zoom(-1)}><Minus size={19}/></button>
            <span/>
            <button type="button" disabled={!ready} aria-label={fr ? 'Recentrer la vue' : 'Reset view'} title={fr ? 'Recentrer la vue' : 'Reset view'} onClick={() => {setView('isometric'); engine.current?.reset();}}><RotateCcw size={17}/></button>
            <button type="button" disabled={!ready} aria-label={rotating ? fr ? 'Arrêter la rotation' : 'Pause rotation' : fr ? 'Lancer la rotation' : 'Start rotation'} title={rotating ? fr ? 'Arrêter la rotation' : 'Pause rotation' : fr ? 'Lancer la rotation' : 'Start rotation'} aria-pressed={rotating} onClick={() => {setRotating(!rotating); engine.current?.setAutoRotate(!rotating);}}>{rotating ? <Pause size={17}/> : <Play size={17}/>}</button>
            {(stage === 1 || stage === 2) && <button type="button" disabled={!ready} aria-label={fr ? 'Afficher le maillage' : 'Show surface mesh'} title={fr ? 'Afficher le maillage' : 'Show surface mesh'} aria-pressed={mesh} onClick={() => {setMesh(!mesh); engine.current?.setMeshVisible(!mesh);}}><Grid3X3 size={17}/></button>}
            <span/>
            <button type="button" data-robot-fullscreen aria-label={fullScreen ? fr ? 'Quitter le plein écran' : 'Exit fullscreen' : fr ? 'Plein écran' : 'Fullscreen'} title={fr ? 'Plein écran' : 'Fullscreen'} onClick={toggleFullscreen}>{fullScreen ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}</button>
          </div>
          <div className="robot-lab-views" aria-label={fr ? 'Orientation du modèle' : 'Model orientation'}>{(['isometric', 'front', 'side'] as RobotView[]).map(value => <button type="button" key={value} disabled={!ready} aria-pressed={view === value} onClick={() => chooseView(value)}>{value === 'isometric' ? '3D' : value === 'front' ? fr ? 'Face' : 'Front' : fr ? 'Profil' : 'Side'}</button>)}</div>
        </div>
        <div className="robot-lab-tabs" role="tablist" aria-label={fr ? 'Regards d’ingénieur' : 'Engineering perspectives'}>{stages.map((item, index) => <button type="button" key={item.label} id={'robot-stage-' + index} role="tab" aria-selected={stage === index} aria-controls="robot-lab-panel" tabIndex={stage === index ? 0 : -1} onClick={() => changeStage(index)} onKeyDown={event => {
          let next = index; if (event.key === 'ArrowRight') next = (index + 1) % 4; else if (event.key === 'ArrowLeft') next = (index + 3) % 4; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = 3; else return;
          event.preventDefault(); changeStage(next); document.getElementById('robot-stage-' + next)?.focus();
        }}><span>0{index + 1}</span>{item.label}</button>)}</div>
      </div>
      <div className="robot-lab-help"><span><MousePointer2 size={15}/>{fr ? 'Glisser pour tourner' : 'Drag to rotate'}</span><span><Move size={15}/>{fr ? 'Clic droit pour déplacer' : 'Right drag to pan'}</span><span><Plus size={15}/>{fr ? 'Molette pour zoomer' : 'Scroll to zoom'}</span><span className="robot-lab-touch-help">{fr ? 'Un doigt pour tourner · Deux doigts pour déplacer et zoomer' : 'One finger to rotate · Two fingers to pan and zoom'}</span></div>
      <div className="ag-process-copy robot-lab-copy"><div key={stage}><h3>{stages[stage].title}</h3><p>{stages[stage].description}</p><Link className="ag-arrow-link" href={linkTo(lang, 'portfolio')}>{fr ? 'Explorer le portfolio' : 'Explore the portfolio'}<ArrowRight size={19}/></Link></div><div className="ag-slider-controls"><button type="button" onClick={() => changeStage(stage - 1)} aria-label={fr ? 'Étape précédente' : 'Previous stage'}><ArrowLeft size={21}/></button><span>0{stage + 1} / 04</span><button type="button" onClick={() => changeStage(stage + 1)} aria-label={fr ? 'Étape suivante' : 'Next stage'}><ArrowRight size={21}/></button></div></div>
    </div>
  </section>;
}
