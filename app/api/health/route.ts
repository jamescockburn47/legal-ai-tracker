import {db,json,errorResponse} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{return json({ok:true,...await db().prepare('SELECT COUNT(*) AS records FROM records WHERE published=1').first()});}catch(e){return errorResponse(e);}}
