import {serviceCoverage, serviceQuestions} from './service-guides';
import type {Lang} from './site-data';

export default function ServiceGuide({lang, serviceId}: {lang: Lang; serviceId: string}) {
  const questions = serviceQuestions[lang][serviceId];
  if (!questions) return null;
  const fr = lang === 'fr';
  return <section className="section values-section">
    <div className="container">
      <div className="section-heading">
        <div><p className="eyebrow">{fr ? 'PRÉPARER VOTRE MISSION' : 'PREPARE YOUR PROJECT'}</p><h2>{fr ? 'Des repères pour démarrer.' : 'A clear starting point.'}</h2></div>
        <p className="section-intro">{serviceCoverage[lang]}</p>
      </div>
      <div className="values-grid">{questions.map(([question, answer], index) => <article key={question}>
        <span>0{index + 1}</span><h3>{question}</h3><p>{answer}</p>
      </article>)}</div>
    </div>
  </section>;
}
