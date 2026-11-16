import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {and,eq,gte,sql} from 'drizzle-orm';
import {getDb} from '../../../db';
import {enquiries} from '../../../db/schema';
const schema=z.object({submissionKey:z.string().uuid(),name:z.string().trim().min(2).max(120),company:z.string().trim().max(150).optional(),email:z.string().trim().email().max(180),phone:z.string().trim().max(40).optional(),service:z.enum(['design','analysis','industrialisation','preventive','predictive','corrective','other']),message:z.string().trim().min(20).max(5000),locale:z.enum(['fr','en']),consent:z.literal(true),website:z.string().max(200).optional()});
const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){try{
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'Request origin rejected.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return response({error:'JSON required.'},415);
  const raw=await request.text();if(raw.length>12000)return response({error:'Request too large.'},413);
  let decoded:unknown;try{decoded=JSON.parse(raw)}catch{return response({error:'Invalid request body.'},400)}
  const parsed=schema.safeParse(decoded);if(!parsed.success)return response({error:'Please check the required fields.',fields:parsed.error.flatten().fieldErrors},400);
  const data=parsed.data;if(data.website)return response({error:'Unable to accept this request.'},400);
  const db=getDb();const existing=await db.select({reference:enquiries.reference}).from(enquiries).where(eq(enquiries.submissionKey,data.submissionKey)).limit(1);if(existing[0])return response({ok:true,reference:existing[0].reference});
  const ip=request.headers.get('cf-connecting-ip')||'local';const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+((env as unknown as Record<string,string>).CMS_WRITE_TOKEN||'rdmeca-contact')));const ipHash=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  const since=new Date(Date.now()-3600000).toISOString();const counts=await db.select({count:sql<number>`count(*)`}).from(enquiries).where(and(eq(enquiries.ipHash,ipHash),gte(enquiries.createdAt,since)));if(Number(counts[0]?.count)>=5)return response({error:data.locale==='fr'?'Trop de demandes. Contactez-nous par e-mail ou réessayez plus tard.':'Too many enquiries. Contact us by email or try again later.'},429);
  const reference='RDM-'+new Date().getUTCFullYear()+'-'+crypto.randomUUID().slice(0,8).toUpperCase();await db.insert(enquiries).values({id:crypto.randomUUID(),submissionKey:data.submissionKey,reference,name:data.name,company:data.company||null,email:data.email,phone:data.phone||null,service:data.service,message:data.message,locale:data.locale,consent:true,ipHash,createdAt:new Date().toISOString()}).onConflictDoNothing({target:enquiries.submissionKey});const saved=await db.select({reference:enquiries.reference}).from(enquiries).where(eq(enquiries.submissionKey,data.submissionKey)).limit(1);return response({ok:true,reference:saved[0].reference},201);
}catch(err){console.error('Contact submission failed',err instanceof Error?err.name:'unknown');return response({error:'Unable to save your enquiry. Please try again or email contact@rdmeca.com.'},503);}}
