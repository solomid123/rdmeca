'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="container error-page"><p className="eyebrow">R&amp;D MECA</p><h1>Un instant.<br/>Retrouvons la connexion.</h1><p>Le contenu est momentanément indisponible. Réessayez ou contactez contact@rdmeca.com.</p><button className="button" onClick={reset}>Réessayer</button></main>}

