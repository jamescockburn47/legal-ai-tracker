import {db,json,isOwner,isUpdater,sameOrigin,errorResponse} from '@/lib/server';
import {stageOverview} from '@/lib/editorial';
export const dynamic='force-dynamic';
export async function GET(){try{const r=await db().prepare("SELECT payload,updated FROM overview_panels WHERE id='practice'").first<any>();return json(r?{...JSON.parse(r.payload),updated:r.updated}:{profiles:[],watch:[]});}catch(e){return errorResponse(e);}}
export async function POST(req:Request){try{if(!isOwner(req)&&!await isUpdater(req))return json({error:'Not authorised'},403);if(isOwner(req))sameOrigin(req);const raw=await req.text();if(raw.length>150000)return json({error:'Too large'},413);return json(await stageOverview(JSON.parse(raw)));}catch(e){return errorResponse(e);}}
