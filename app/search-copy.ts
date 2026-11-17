import type {Lang, PageKey} from './site-data';

export type SearchCopy = {title: string; description: string};
export const publicPagesUpdatedAt = '2026-11-17';

export const pageSearchCopy: Record<Lang, Record<PageKey, SearchCopy>> = {
  fr: {
    home: {title: 'Bureau d’études mécanique & maintenance au Maroc', description: 'R&D MECA accompagne les industriels au Maroc : conception mécanique et CAO 3D, calcul par éléments finis, industrialisation et maintenance industrielle.'},
    services: {title: 'Conception, calcul & maintenance industrielle au Maroc', description: 'Découvrez nos services au Maroc : conception mécanique, CAO, simulation par éléments finis et maintenance préventive, prédictive et corrective.'},
    about: {title: 'Notre bureau d’études mécanique au Maroc', description: 'Découvrez R&D MECA, notre approche de la conception mécanique et de la maintenance industrielle, nos méthodes et les livrables proposés à vos équipes.'},
    method: {title: 'Méthode d’étude mécanique & maintenance industrielle', description: 'Du cahier des charges aux plans, notes de calcul et gammes de maintenance : découvrez les quatre étapes de notre accompagnement technique au Maroc.'},
    sectors: {title: 'Ingénierie & maintenance pour l’industrie au Maroc', description: 'Conception mécanique, calcul et maintenance pour les équipements de l’automobile, de l’aéronautique, de l’énergie, de la production et du médical au Maroc.'},
    portfolio: {title: 'Applications en conception mécanique & maintenance', description: 'Explorez des exemples d’application de nos méthodes : conception mécanique, simulation, industrialisation et maintenance des équipements industriels.'},
    blog: {title: 'Conception mécanique & maintenance : conseils et méthodes', description: 'Cahier des charges, simulation mécanique, plans de maintenance et industrialisation : des repères techniques pour préparer vos projets industriels.'},
    videos: {title: 'Vidéos d’usinage & procédés industriels', description: 'Explorez notre médiathèque de fabrication mécanique : séquences illustratives d’usinage, de fraisage et de procédés industriels.'},
    press: {title: 'Actualités de notre bureau d’études au Maroc', description: 'Actualités et communiqués de R&D MECA : notre activité d’ingénierie mécanique et de maintenance industrielle au Maroc et notre identité de marque.'},
    contact: {title: 'Devis en conception mécanique & maintenance au Maroc', description: 'Présentez votre besoin à R&D MECA : étude CAO, calcul mécanique, industrialisation ou maintenance. Précisez vos équipements, vos objectifs et votre échéance.'},
    privacy: {title: 'Confidentialité & informations du site', description: 'Informations sur le site R&D MECA, le traitement de vos demandes de projet et vos échanges avec notre activité d’ingénierie et de maintenance.'},
  },
  en: {
    home: {title: 'Mechanical Engineering & Industrial Maintenance in Morocco', description: 'R&D MECA supports industry in Morocco with mechanical design, 3D CAD, finite element analysis, industrialisation and industrial maintenance services.'},
    services: {title: 'CAD, Engineering & Industrial Maintenance Services in Morocco', description: 'Explore mechanical design, finite element analysis and industrialisation, plus preventive, predictive and corrective maintenance services in Morocco.'},
    about: {title: 'Our Mechanical Engineering Consultancy in Morocco', description: 'Meet R&D MECA and explore our approach to mechanical design and industrial maintenance, our engineering methods and the deliverables prepared for your teams.'},
    method: {title: 'Mechanical Engineering & Maintenance Project Method', description: 'From specifications to drawings, calculation reports and maintenance procedures: explore the four stages of our technical project support in Morocco.'},
    sectors: {title: 'Engineering & Maintenance for Industry in Morocco', description: 'Mechanical design, analysis and maintenance support for automotive, aerospace, energy, manufacturing and medical production equipment in Morocco.'},
    portfolio: {title: 'Mechanical Design & Maintenance Application Examples', description: 'Explore examples of engineering methods applied to mechanical design, simulation, industrialisation and industrial equipment maintenance.'},
    blog: {title: 'Mechanical Design & Maintenance: Engineering Insights', description: 'Practical insights into specifications, mechanical simulation, maintenance planning and industrialisation to help prepare your industrial projects.'},
    videos: {title: 'Machining & Industrial Manufacturing Videos', description: 'Explore our manufacturing media library with illustrative machining, milling and industrial process videos.'},
    press: {title: 'Mechanical Engineering Company News from Morocco', description: 'News and announcements from R&D MECA about our mechanical engineering and industrial maintenance activity in Morocco and our brand identity.'},
    contact: {title: 'Request a Mechanical Design or Maintenance Quote in Morocco', description: 'Discuss CAD design, engineering analysis, industrialisation or maintenance with R&D MECA. Tell us about your equipment, objectives and project timescale.'},
    privacy: {title: 'Privacy & Website Information', description: 'Information about the R&D MECA website, the handling of project enquiries and correspondence with our engineering and maintenance activity.'},
  },
};

export const serviceSearchCopy: Record<Lang, Record<string, SearchCopy>> = {
  fr: {
    design: {title: 'Conception mécanique & CAO 3D au Maroc', description: 'Bureau d’études mécanique au Maroc : modélisation CAO 3D, conception de pièces et assemblages, plans de fabrication, nomenclatures et support au prototypage.'},
    analysis: {title: 'Calcul mécanique & éléments finis au Maroc', description: 'Calcul mécanique, simulation par éléments finis et dimensionnement au Maroc. Analyse des contraintes et déformations, note de calcul et recommandations.'},
    industrialisation: {title: 'Industrialisation des produits & procédés au Maroc', description: 'Accompagnement à l’industrialisation au Maroc : fabricabilité, assemblage, équipements de production, documentation des méthodes et fiabilisation.'},
    preventive: {title: 'Maintenance préventive industrielle au Maroc', description: 'Structurez la maintenance de vos équipements au Maroc : criticité, plans de maintenance préventive, gammes, périodicités, pièces critiques et GMAO.'},
    predictive: {title: 'Maintenance prédictive industrielle au Maroc', description: 'Maintenance prédictive au Maroc : suivi d’état, analyse de tendances, signaux de dégradation et critères d’alerte pour vos équipements industriels.'},
    corrective: {title: 'Maintenance corrective & diagnostic industriel au Maroc', description: 'Diagnostic mécanique, analyse de panne et maintenance corrective au Maroc. Identifiez les causes récurrentes et préparez un plan de remise en état.'},
  },
  en: {
    design: {title: 'Mechanical Design & 3D CAD Services in Morocco', description: 'Mechanical engineering consultancy in Morocco: 3D CAD modelling, part and assembly design, manufacturing drawings, bills of materials and prototype support.'},
    analysis: {title: 'Finite Element Analysis & FEA Services in Morocco', description: 'Mechanical calculations and finite element analysis in Morocco. Assess stress, deformation and structural behaviour with documented assumptions and reports.'},
    industrialisation: {title: 'Product & Process Industrialisation Services in Morocco', description: 'Industrialisation support in Morocco: design for manufacturing and assembly, production equipment, engineering documentation and reliability improvements.'},
    preventive: {title: 'Preventive Industrial Maintenance Services in Morocco', description: 'Structure equipment maintenance in Morocco with asset criticality assessments, preventive plans, task procedures, spare-parts priorities and CMMS support.'},
    predictive: {title: 'Predictive Maintenance & Condition Monitoring in Morocco', description: 'Predictive maintenance support in Morocco: condition monitoring, degradation trend analysis and alert criteria for industrial equipment.'},
    corrective: {title: 'Corrective Maintenance & Industrial Diagnostics in Morocco', description: 'Mechanical fault diagnosis and corrective maintenance support in Morocco. Investigate recurring failures and prepare equipment restoration actions.'},
  },
};

export const sectorSearchCopy: Record<Lang, Record<string, SearchCopy>> = {
  fr: {
    automobile: {title: 'Ingénierie pour l’industrie automobile au Maroc', description: 'Études de pièces, assemblages et moyens de production pour l’industrie automobile au Maroc : conception mécanique, calcul et maintenance industrielle.'},
    aeronautique: {title: 'Ingénierie mécanique pour l’aéronautique au Maroc', description: 'Études mécaniques pour les équipements aéronautiques au Maroc : interfaces, assemblages, chargements, documentation, fabricabilité et maintenance.'},
    energie: {title: 'Calcul mécanique & maintenance pour l’énergie au Maroc', description: 'Dimensionnement, suivi d’état et fiabilisation des équipements du secteur de l’énergie au Maroc. Préparez vos études et vos opérations de maintenance.'},
    industrie: {title: 'Conception & maintenance des équipements industriels au Maroc', description: 'Machines spéciales et moyens de production au Maroc : conception mécanique, amélioration d’équipements, documentation et diagnostic des pannes récurrentes.'},
    medical: {title: 'Ingénierie des équipements médicaux & pharma au Maroc', description: 'Études et fiabilisation des équipements de production du médical et de la pharma au Maroc : documentation, contrôles, criticité et maintenance préventive.'},
  },
  en: {
    automobile: {title: 'Automotive Engineering & Equipment Maintenance in Morocco', description: 'Mechanical design, structural analysis and maintenance support for automotive parts, assemblies and production equipment in Morocco.'},
    aeronautique: {title: 'Mechanical Engineering for Aerospace Equipment in Morocco', description: 'Mechanical engineering support for aerospace equipment in Morocco: interfaces, assemblies, loading assumptions, documentation and maintainability.'},
    energie: {title: 'Mechanical Analysis & Maintenance for Energy in Morocco', description: 'Mechanical sizing, condition monitoring and reliability support for energy-sector equipment in Morocco. Prepare engineering studies and maintenance tasks.'},
    industrie: {title: 'Manufacturing Equipment Design & Maintenance in Morocco', description: 'Mechanical design and maintenance support for manufacturing equipment in Morocco: special-purpose machines, engineering documentation and fault diagnosis.'},
    medical: {title: 'Medical & Pharma Production Equipment Engineering in Morocco', description: 'Mechanical engineering support for medical and pharmaceutical production equipment in Morocco: technical documentation, criticality and preventive maintenance.'},
  },
};
