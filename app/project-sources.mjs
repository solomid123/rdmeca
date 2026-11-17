export const projectAuthor = {name: 'Badreddine Barki'};
export const professionalProjectSources = [
  {id:'fea', slug:'composite-cable-finite-element-analysis', context:'SLB Group', duration:{fr:'1 an',en:'1 year'}, services:['analysis','design','industrialisation'], image:'/assets/project-fea-collage.webp'},
  {id:'cad', slug:'composite-cable-cad-technical-drawings', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['design','industrialisation'], image:'/assets/project-cad-collage.webp'},
  {id:'shm', slug:'fiber-optic-structural-health-monitoring', context:'SLB Group', duration:{fr:'5 mois',en:'5 months'}, services:['predictive','analysis'], image:'/assets/project-shm-collage.webp'},
  {id:'torque', slug:'torque-sensor-design-calibration', context:'SLB Group', duration:{fr:'5 mois',en:'5 months'}, services:['design','industrialisation','analysis'], image:'/assets/project-torque-collage.webp'},
  {id:'resin', slug:'resin-formulation-composite-cable-sockets', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['industrialisation','analysis'], image:'/assets/project-resin-collage.webp'},
  {id:'ml', slug:'machine-learning-fatigue-test-optimisation', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['analysis','industrialisation','predictive'], image:'/assets/project-ml-collage.webp'},
  {id:'reliability', slug:'composite-cable-reliability-failure-analysis', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['preventive','corrective','predictive'], image:'/assets/project-reliability.webp'},
  {id:'sigma', slug:'vibration-analysis-predictive-maintenance', context:'Sigma', duration:{fr:'6 mois',en:'6 months'}, services:['predictive','preventive','analysis'], image:'/assets/project-sigma.webp'},
];
export const publishedProjectIds = ['cad','fea','shm','torque','resin','ml','sigma'];
export const publishedProfessionalProjects = professionalProjectSources.filter(project => publishedProjectIds.includes(project.id));
export function getProjectSource(slug) { return professionalProjectSources.find(project => project.slug === slug); }
