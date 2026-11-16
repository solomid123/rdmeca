import {env} from 'cloudflare:workers';
import {getDb} from '../../../../db';
import {enquiries} from '../../../../db/schema';
import {desc} from 'drizzle-orm';
export async function GET(request:Request){const secret=(env as unknown as Record<string,string>).CMS_WRITE_TOKEN;if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return Response.json({error:'Not authorized.'},{status:401});return Response.json({items:await getDb().select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(100)},{headers:{'Cache-Control':'no-store'}});}
