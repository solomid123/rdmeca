export const projectAuthor = {name: 'Badreddine Barki'};
export const professionalProjectSources = [
  {id:'fea', slug:'composite-cable-finite-element-analysis', context:'SLB Group', duration:{fr:'1 an',en:'1 year'}, services:['analysis','design','industrialisation'], image:'fea-stress-analysis.png'},
  {id:'cad', slug:'composite-cable-cad-technical-drawings', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['design','industrialisation'], image:'cable-cad.png'},
  {id:'shm', slug:'fiber-optic-structural-health-monitoring', context:'SLB Group', duration:{fr:'5 mois',en:'5 months'}, services:['predictive','analysis'], image:'shm-prototype.png'},
  {id:'torque', slug:'torque-sensor-design-calibration', context:'SLB Group', duration:{fr:'5 mois',en:'5 months'}, services:['design','industrialisation','analysis'], image:'torque-results-test-setup.png'},
  {id:'resin', slug:'resin-formulation-composite-cable-sockets', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['industrialisation','analysis'], image:'resin-application.png'},
  {id:'ml', slug:'machine-learning-fatigue-test-optimisation', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['analysis','industrialisation','predictive'], image:'fatigue-ml.jpg'},
  {id:'reliability', slug:'composite-cable-reliability-failure-analysis', context:'SLB Group', duration:{fr:'3 mois',en:'3 months'}, services:['preventive','corrective','predictive'], image:'reliability-study.png'},
  {id:'sigma', slug:'vibration-analysis-predictive-maintenance', context:'Sigma', duration:{fr:'6 mois',en:'6 months'}, services:['predictive','preventive','analysis'], image:'vibration-shm.jpg'},
];
export function getProjectSource(slug) { return professionalProjectSources.find(project => project.slug === slug); }
