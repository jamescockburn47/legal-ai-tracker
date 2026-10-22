// Offline recovery rehearsal. Never connects to or overwrites production.
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
const [input,output]=process.argv.slice(2);
if(!input||!output||fs.existsSync(output))throw new Error('Usage: node scripts/restore-backup.mjs backup.json NEW-database.sqlite');
const data=JSON.parse(fs.readFileSync(input,'utf8'));
if(data.format!==1||!data.tables)throw new Error('Unsupported backup');
const db=new DatabaseSync(output);
try{
 for(const file of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())db.exec(fs.readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 const tables=new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name));
 db.exec('BEGIN');
 for(const [table,rows] of Object.entries(data.tables)){
  if(!tables.has(table)||!/^[a-z_]+$/.test(table)||!Array.isArray(rows))throw new Error('Invalid table');
  db.exec(`DELETE FROM "${table}"`);
  const columns=new Set(db.prepare(`PRAGMA table_info("${table}")`).all().map(r=>r.name));
  for(const row of rows){const keys=Object.keys(row);if(!keys.length||keys.some(k=>!columns.has(k)||!/^[a-z_]+$/.test(k)))throw new Error('Invalid columns');db.prepare(`INSERT INTO "${table}" (${keys.map(k=>'"'+k+'"').join(',')}) VALUES(${keys.map(()=>'?').join(',')})`).run(...keys.map(k=>row[k]));}
 }
 db.exec('COMMIT');
 if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Integrity check failed');
 console.log('Restored into a new offline database; integrity check passed. Production unchanged.');
}finally{db.close();}
