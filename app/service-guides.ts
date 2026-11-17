import type {Lang} from './site-data';

export const relatedServiceIds: Record<string, string[]> = {
  design: ['analysis', 'industrialisation', 'preventive'],
  analysis: ['design', 'industrialisation', 'corrective'],
  industrialisation: ['design', 'analysis', 'preventive'],
  preventive: ['predictive', 'corrective', 'industrialisation'],
  predictive: ['preventive', 'corrective', 'analysis'],
  corrective: ['preventive', 'predictive', 'design'],
};

export const serviceCoverage: Record<Lang, string> = {
  fr: 'Nous accompagnons les industriels au Maroc. Les études, échanges à distance et déplacements éventuels sur site sont définis selon vos équipements, les données disponibles et le périmètre de la mission.',
  en: 'We support industrial businesses in Morocco. Engineering studies, remote discussions and any on-site visits are agreed around your equipment, available information and the assignment scope.',
};

export const serviceQuestions: Record<Lang, Record<string, [string, string][]>> = {
  fr: {
    design: [
      ['Que préparer pour une étude de conception mécanique ou de CAO ?', 'Décrivez la fonction attendue, les interfaces, les dimensions disponibles et les contraintes de fabrication. Un croquis, des photos ou un modèle CAO existant permettent de cadrer le besoin. Les charges, les matériaux et les conditions d’utilisation précisent ensuite les choix techniques.'],
      ['Quels livrables peut contenir le dossier CAO ?', 'Selon le périmètre convenu, le dossier comprend la modélisation 3D des pièces et assemblages, les plans de fabrication, le tolérancement et la nomenclature. Les interfaces, les chaînes de cotes et les choix de conception sont documentés pour préparer les échanges avec la fabrication ou vos fournisseurs.'],
      ['Comment relier la conception au calcul et à la fabrication ?', 'Les zones sensibles et les sollicitations sont identifiées pendant la conception. Une étude de dimensionnement ou de calcul par éléments finis peut compléter la CAO. Les revues de fabricabilité, d’assemblage et de maintenance préparent ensuite le prototypage et l’industrialisation.'],
    ],
    analysis: [
      ['Quelles données faut-il pour un calcul par éléments finis ?', 'Le modèle repose sur la géométrie, les propriétés des matériaux, les chargements et les conditions aux limites. Nous précisons les cas de charge, les critères à vérifier et les simplifications du modèle avec votre équipe avant de lancer la simulation mécanique.'],
      ['Que contient la note de calcul mécanique ?', 'La note présente les hypothèses, la méthode, les résultats utiles et leur interprétation. Selon l’étude, elle traite les contraintes, les déformations, la résistance, les vibrations ou la fatigue. Les limites du modèle et les validations complémentaires à prévoir sont explicites.'],
      ['La simulation permet-elle d’optimiser une pièce ?', 'La comparaison de variantes aide à examiner une géométrie, un matériau ou un renforcement. L’optimisation tient compte des critères de résistance et de déformation, mais aussi de la fabrication, de l’assemblage et de la maintenance. Les essais nécessaires sont définis selon le contexte.'],
    ],
    industrialisation: [
      ['Comment préparer le passage du prototype à la production ?', 'Nous examinons la définition du produit, les procédés disponibles, les interfaces d’assemblage et les exigences de qualité. Les points à résoudre sont traduits en modifications techniques, documentation de fabrication ou actions d’essai adaptées à vos moyens de production.'],
      ['Que couvre l’industrialisation d’un procédé ou d’un équipement ?', 'L’étude peut porter sur l’équipement, l’assemblage, l’accessibilité, les gammes et les retours d’exploitation. L’objectif est de relier le bureau d’études, les méthodes et les équipes de production pour définir des améliorations techniquement documentées.'],
      ['Quels documents partager pour commencer ?', 'Les plans, la nomenclature, les informations sur le prototype et les moyens de fabrication permettent de préparer l’échange. Pour un équipement existant, ajoutez les difficultés observées, les contraintes d’exploitation et les historiques de défaillance disponibles.'],
    ],
    preventive: [
      ['Comment construire un plan de maintenance préventive ?', 'Le plan part de l’inventaire des équipements, de leur criticité, des recommandations des constructeurs et des historiques disponibles. Les opérations, périodicités, ressources et points de contrôle sont définis selon les conditions réelles d’exploitation.'],
      ['Peut-on adapter un plan existant et la GMAO ?', 'La mission peut comprendre la revue des gammes, des périodicités et des tâches déjà enregistrées. Nous préparons des informations structurées pour vos pratiques et votre GMAO : opérations, ressources, pièces critiques et critères de contrôle. L’intégration est cadrée avec vos équipes.'],
      ['Que préparer pour une mission de maintenance préventive ?', 'Un inventaire des machines, les notices constructeurs et les historiques d’intervention constituent le point de départ. Les contraintes de disponibilité, les arrêts planifiés et les ressources sur site aident à rendre le plan utilisable par les équipes de maintenance.'],
    ],
    predictive: [
      ['Par quels équipements commencer la maintenance prédictive ?', 'Nous examinons les actifs critiques, les modes de défaillance et les conséquences d’un arrêt. Les équipements à surveiller sont sélectionnés en fonction du risque, des données disponibles et de la possibilité de mesurer des signaux réellement utiles à la décision.'],
      ['Quelles mesures peuvent servir au suivi d’état ?', 'Selon l’équipement et les défaillances étudiées, le suivi peut exploiter les vibrations, la température, l’historique de maintenance ou d’autres indicateurs disponibles. La mission définit les tendances à observer, les critères d’alerte et les actions à envisager avec les équipes d’exploitation.'],
      ['Quand étudier un suivi connecté ou un jumeau numérique ?', 'Une étude de faisabilité précise le besoin, les données accessibles et l’utilité d’un modèle pour vos décisions de maintenance. Le périmètre du modèle, les moyens de mesure et les validations nécessaires sont définis avant de proposer un dispositif de suivi.'],
    ],
    corrective: [
      ['Comment démarre un diagnostic de panne mécanique ?', 'Décrivez les symptômes, les circonstances de la panne et les interventions déjà réalisées. Les photos, plans, historiques et conditions d’exploitation permettent de préparer l’analyse. Les modalités d’examen de l’équipement et la disponibilité d’une intervention sont convenues lors du premier échange.'],
      ['Comment traiter une panne qui se répète ?', 'L’analyse distingue la remise en état des causes et facteurs contributifs. Les conclusions peuvent orienter une modification de conception, un contrôle, une action sur l’exploitation ou une évolution du plan de maintenance. Les actions sont hiérarchisées et documentées selon votre contexte.'],
      ['Quels livrables peut fournir une mission corrective ?', 'Le périmètre peut comprendre un diagnostic mécanique, une analyse de défaillance, un plan d’actions de remise en état et des recommandations de fiabilisation. Les enseignements de la panne servent également à mettre à jour les contrôles et les opérations préventives.'],
    ],
  },
  en: {
    design: [
      ['What should I prepare for a mechanical design or CAD project?', 'Describe the required function, interfaces, available dimensions and manufacturing constraints. Sketches, photographs or an existing CAD model help define the assignment. Loads, materials and operating conditions then inform the engineering decisions.'],
      ['What can the CAD deliverables include?', 'Depending on the agreed scope, deliverables include 3D part and assembly models, manufacturing drawings, tolerances and bills of materials. Interfaces, tolerance chains and design choices are documented to support discussions with manufacturing teams or suppliers.'],
      ['How does design connect with analysis and manufacturing?', 'Sensitive areas and operating loads are identified during design. Mechanical sizing or finite element analysis can complement the CAD work. Manufacturability, assembly and maintenance reviews then help prepare prototyping and industrialisation.'],
    ],
    analysis: [
      ['What information is needed for finite element analysis?', 'The model depends on geometry, material properties, loads and boundary conditions. We agree the load cases, assessment criteria and modelling simplifications with your team before running the mechanical simulation.'],
      ['What does the engineering calculation report contain?', 'The report presents assumptions, methods, relevant results and their interpretation. Depending on the study, it covers stress, deformation, strength, vibration or fatigue. Model limitations and any additional validation requirements are clearly stated.'],
      ['Can simulation help optimise a component?', 'Comparing alternatives helps assess geometry, material choices or reinforcement. Optimisation considers strength and deformation alongside manufacturing, assembly and maintenance constraints. Any required physical testing is defined around the application.'],
    ],
    industrialisation: [
      ['How do you prepare the transition from prototype to production?', 'We review the product definition, available manufacturing processes, assembly interfaces and quality requirements. Issues are translated into engineering changes, manufacturing documentation or trial actions suited to your production resources.'],
      ['What does process or equipment industrialisation cover?', 'The assessment can address equipment, assembly, accessibility, procedures and operating feedback. It connects engineering, manufacturing methods and production teams to define documented technical improvements.'],
      ['What documents should we share to begin?', 'Drawings, bills of materials, prototype information and available manufacturing resources help prepare the discussion. For existing equipment, include observed difficulties, operating constraints and available failure histories.'],
    ],
    preventive: [
      ['How is a preventive maintenance plan developed?', 'Planning starts with the asset inventory, equipment criticality, manufacturer recommendations and available maintenance histories. Tasks, intervals, resources and inspection points are defined around actual operating conditions.'],
      ['Can you review an existing plan and CMMS information?', 'An assignment can include reviewing existing procedures, intervals and recorded tasks. We prepare structured information for your maintenance practices and CMMS, including tasks, resources, critical spares and inspection criteria. Integration is agreed with your teams.'],
      ['What should we prepare for a preventive maintenance assignment?', 'A machine inventory, manufacturer documentation and maintenance histories provide the starting point. Availability constraints, planned shutdowns and on-site resources help make the plan practical for your maintenance teams.'],
    ],
    predictive: [
      ['Which assets should predictive maintenance start with?', 'We examine critical assets, failure modes and the consequences of downtime. Equipment is selected around risk, available data and the ability to measure signals that meaningfully inform maintenance decisions.'],
      ['Which measurements can support condition monitoring?', 'Depending on the equipment and failure modes, monitoring can use vibration, temperature, maintenance histories or other available indicators. The assignment defines trends, alert criteria and possible actions with the operating teams.'],
      ['When should connected monitoring or a digital twin be assessed?', 'A feasibility assessment defines the need, accessible data and the value of a model for maintenance decisions. Model scope, measurement methods and validation requirements are agreed before proposing a monitoring arrangement.'],
    ],
    corrective: [
      ['How does mechanical fault diagnosis begin?', 'Describe the symptoms, failure circumstances and any work already performed. Photographs, drawings, histories and operating conditions help prepare the investigation. Equipment examination arrangements and intervention availability are agreed during the initial discussion.'],
      ['How do you address a recurring equipment failure?', 'The investigation separates restoration from root causes and contributing factors. Findings can inform a design modification, an inspection, an operating change or an updated maintenance plan. Actions are prioritised and documented around your situation.'],
      ['What can a corrective maintenance assignment deliver?', 'The scope can include mechanical diagnosis, failure analysis, a restoration action plan and reliability recommendations. Lessons from the failure can also inform updated inspections and preventive maintenance tasks.'],
    ],
  },
};
