import fs from 'node:fs';
export async function resolve(specifier,context,next){if(specifier==='cloudflare:workers')return {url:new URL('./mock-env.mjs',import.meta.url).href,shortCircuit:true};if(specifier.startsWith('@/'))return {url:new URL('../'+specifier.slice(2)+(specifier.endsWith('.json')?'':'.ts'),import.meta.url).href,shortCircuit:true};if(specifier.startsWith('.')&&context.parentURL?.endsWith('.ts')){const u=new URL(specifier+'.ts',context.parentURL);if(fs.existsSync(u))return {url:u.href,shortCircuit:true};}return next(specifier,context);}

export async function load(url,context,next){if(url.endsWith('.json'))return {format:'module',source:'export default '+fs.readFileSync(new URL(url),'utf8'),shortCircuit:true};return next(url,context);}
