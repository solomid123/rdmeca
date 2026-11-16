import type {MetadataRoute} from 'next';
import {getSiteOrigin} from '../lib/site-origin';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:getSiteOrigin()+'/sitemap.xml'}}
