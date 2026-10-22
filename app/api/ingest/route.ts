import {json,isUpdater,isOwner,sameOrigin,errorResponse} from '@/lib/server';
import {stageRecords} from '@/lib/editorial';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{if(!isOwner(req)&&!await isUpdater(req))return json({error:'Not authorised'},403);if(isOwner(req))sameOrigin(req);const raw=await req.text();if(raw.length>500000)return json({error:'Too large'},413);return json(await stageRecords(JSON.parse(raw)));}catch(e){return errorResponse(e);}}
