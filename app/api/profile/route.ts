import {json,isOwner,runtimeEnv} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');return json({signedIn:!!id&&!!email,email:email||null,admin:isOwner(req),aiConfigured:isOwner(req)?!!runtimeEnv().OPENAI_API_KEY:undefined,emailDelivery:false});}
