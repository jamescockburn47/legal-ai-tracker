import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

import {budget,boundedRequest,secureResponse,publicCacheKey} from '../lib/security';
import {dailyBackup} from '../lib/backup';
import {isOwner,isUpdater} from '../lib/server';
const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const url=new URL(request.url);
    const reply=(message:string,status:number,retry=false)=>secureResponse(Response.json({error:message},{status,headers:{'Cache-Control':'no-store',...(retry?{'Retry-After':'60'}:{})}}));
    if(url.pathname.startsWith('/api/')){
      if(url.search.length>2000)return reply('Query too large',414);
      if(!['GET','HEAD','POST'].includes(request.method))return reply('Method not allowed',405);
      if(request.method==='POST'){
        try{request=await boundedRequest(request,url.pathname==='/api/ingest'?500000:100000);}catch{return reply('Request too large',413);}
      }
      const cache=await caches.open('public-research-v1');
      const cacheKey=publicCacheKey(request);
      if(cacheKey){const hit=await cache.match(cacheKey);if(hit)return secureResponse(hit);}
      if(!env.DB)return reply('Temporarily unavailable',503,true);
      try{
        // Fixed route groups bound counter cardinality; random paths cannot create rows.
        const privileged=isOwner(request)||await isUpdater(request);
        const group=privileged?'operator':url.pathname==='/api/analytics'?'analytics':url.pathname.startsWith('/api/mail')?'mail':request.method==='POST'?'write':'read';
        const limit={operator:120,analytics:3000,mail:300,write:600,read:3000}[group];
        if(!await budget(env.DB,group,limit))return reply('Busy. Please try again shortly.',429,true);
        if(group==='write'&&request.headers.get('oai-authenticated-user-id')){
          const id=request.headers.get('oai-authenticated-user-id')!;
          const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)))).map(x=>x.toString(16).padStart(2,'0')).join('');
          if(!await budget(env.DB,'user:'+hash,60))return reply('Please wait before making more changes.',429,true);
        }
      }catch{console.error('security:limiter_unavailable');return reply('Temporarily unavailable',503,true);}
      const response=await runWithConnectorBinding(binding,()=>handler.fetch(request,env,ctx));
      if(cacheKey&&response.ok&&!response.headers.has('set-cookie')){
        const cached=new Response(response.clone().body,{status:response.status,headers:response.headers});
        cached.headers.set('Cache-Control','public, max-age=30');
        ctx.waitUntil(cache.put(cacheKey,cached));
      }
      if(env.BUCKET)ctx.waitUntil(dailyBackup(env.DB,env.BUCKET).catch(()=>{}));
      return secureResponse(response);
    }
    return secureResponse(await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx)));
  },
};

export default worker;
