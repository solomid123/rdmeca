import type {ContentItem,Lang} from './site-data';

export function createHomeIntro(lang:Lang):ContentItem {
  return {
    id:'rdmeca-intro',type:'video',slug:'',locale:lang,title:'R&D MECA',
    summary:lang==='fr'?'L’ingénierie mécanique, de l’étude au terrain.':'Mechanical engineering, from design to operation.',
    category:lang==='fr'?'Film de présentation':'Introduction',
    image:'/assets/rdmeca-intro-poster.webp',mediaUrl:'/assets/rdmeca-intro.mp4#t=5',
    duration:'0:29',illustrative:false,publishedAt:'',
  };
}
