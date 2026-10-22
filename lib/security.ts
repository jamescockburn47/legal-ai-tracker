const blocked=new Map<string,number>();
/** Shared limits are independent of caller-supplied visit IDs and forwarding headers. */
export async function budget(db:D1Database,key:string,limit:number,seconds=60,now=Date.now()) {
  if((blocked.get(key)||0)>now)return false;
  const expires=Math.floor(now/(seconds*1000))*seconds+seconds;
  const row=await db.prepare(`INSERT INTO security_counters(key,count,expires) VALUES(?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=excluded.expires
    WHERE expires<=? OR count<? RETURNING count`).bind(key,expires,Math.floor(now/1000),Math.floor(now/1000),limit).first();
  if(!row){if(blocked.size>2000)blocked.clear();blocked.set(key,expires*1000);}
  return !!row;
}
export async function boundedRequest(request:Request,limit:number) {
  if(Number(request.headers.get('content-length'))>limit)throw new Error('Body too large');
  if(!request.body)return request;
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('Body too large');}chunks.push(value);}}finally{reader.releaseLock();}
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
  return new Request(request,{body});
}
export function secureResponse(response:Response){
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
  // Inline scripts/styles are required by the current framework. No unsafe-eval.
  if(!headers.has('Content-Security-Policy'))headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com");
  headers.set('Strict-Transport-Security','max-age=31536000');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
export const publicPaths=new Set(['/api/records','/api/topics','/api/overview']);
export function publicCacheKey(request:Request){const url=new URL(request.url);if(request.method!=='GET'||!publicPaths.has(url.pathname)||url.search.length>2000)return null;url.searchParams.sort();return new Request(url.toString(),{method:'GET'});}
