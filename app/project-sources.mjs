export const professionalProjectSources = [
  {id:'fea', slug:'composite-cable-finite-element-analysis', services:['analysis','design','industrialisation'], image:'/assets/project-fea-collage.webp'},
  {id:'cad', slug:'composite-cable-cad-technical-drawings', services:['design','industrialisation'], image:'/assets/project-cad-collage.webp'},
  {id:'shm', slug:'fiber-optic-structural-health-monitoring', services:['predictive','analysis'], image:'/assets/project-shm-collage.webp'},
  {id:'torque', slug:'torque-sensor-design-calibration', services:['design','industrialisation','analysis'], image:'/assets/project-torque-collage.webp'},
  {id:'resin', slug:'resin-formulation-composite-cable-sockets', services:['industrialisation','analysis'], image:'/assets/project-resin-collage.webp'},
  {id:'ml', slug:'machine-learning-fatigue-test-optimisation', services:['analysis','industrialisation','predictive'], image:'/assets/project-ml-collage.webp'},
  {id:'reliability', slug:'composite-cable-reliability-failure-analysis', services:['preventive','corrective','predictive'], image:'/assets/project-reliability.webp'},
  {id:'sigma', slug:'vibration-analysis-predictive-maintenance', services:['predictive','preventive','analysis'], image:'/assets/project-sigma.webp'},
];
export const publishedProjectIds = ['cad','fea','shm','torque','resin','ml','sigma'];
export const publishedProfessionalProjects = professionalProjectSources.filter(project => publishedProjectIds.includes(project.id));
export function getProjectSource(slug) { return professionalProjectSources.find(project => project.slug === slug); }
