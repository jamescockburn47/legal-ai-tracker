import {json,isUpdater} from '@/lib/server';
import {runMail} from '@/lib/mail';
export const dynamic='force-dynamic';
export async function POST(req:Request){if(!await isUpdater(req))return json({error:'Forbidden'},403);return json(await runMail());}
