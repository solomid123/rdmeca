import {getDb} from '../db';
import {contentItems} from '../db/schema';
import {and,eq,desc} from 'drizzle-orm';
export async function getPublicContent(locale:string){return getDb().select({id:contentItems.id,type:contentItems.type,slug:contentItems.slug,locale:contentItems.locale,title:contentItems.title,summary:contentItems.summary,category:contentItems.category,image:contentItems.image,mediaUrl:contentItems.mediaUrl,duration:contentItems.duration,illustrative:contentItems.illustrative,publishedAt:contentItems.publishedAt}).from(contentItems).where(and(eq(contentItems.locale,locale),eq(contentItems.published,true))).orderBy(desc(contentItems.publishedAt));}
export async function getContentEntry(locale:string,type:string,slug:string){const rows=await getDb().select().from(contentItems).where(and(eq(contentItems.locale,locale),eq(contentItems.type,type),eq(contentItems.slug,slug),eq(contentItems.published,true))).limit(1);return rows[0]||null;}
