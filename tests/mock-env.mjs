import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
const sqlite = new DatabaseSync(':memory:');
for(const name of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort()) sqlite.exec(fs.readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
function prepare(sql){let vals=[];const query={bind(...v){vals=v;return query;},async first(){return sqlite.prepare(sql).get(...vals)||null;},async all(){return {results:sqlite.prepare(sql).all(...vals)};},async run(){const r=sqlite.prepare(sql).run(...vals);return {...r,meta:{changes:Number(r.changes)}};}};query.execute=()=>/^\s*SELECT/i.test(sql)?query.all():query.run();return query;}
export const env={ADMIN_EMAIL:'owner@example.test',UPDATE_TOKEN:'test-update-token',DB:{prepare,async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.execute());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
