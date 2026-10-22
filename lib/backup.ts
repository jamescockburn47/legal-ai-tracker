export const backupTables=['records','saved','alerts','runs','revisions','currency_proposals','suggestions','overview_panels','analytics_events','mail_subscriptions','mail_deliveries','editorial_proposals','topic_articles','topic_revisions'] as const;
let checkedUntil=0;
export async function dailyBackup(db:D1Database,bucket:R2Bucket,force=false){
  if(!force&&Date.now()<checkedUntil)return;
  checkedUntil=Date.now()+60000;
  const day=new Date().toISOString().slice(0,10),key=`backups/${day}.json`;
  if(await bucket.head(key))return;
  const now=Math.floor(Date.now()/1000);
  const lock=await db.prepare(`INSERT INTO security_counters(key,count,expires) VALUES('backup-lock',1,?) ON CONFLICT(key) DO UPDATE SET expires=excluded.expires WHERE expires<? RETURNING key`).bind(now+300,now).first();
  if(!lock)return;
  try{
    // One D1 batch gives a transactional snapshot across all application tables.
    const results=await db.batch(backupTables.map(table=>db.prepare(`SELECT * FROM ${table}`)));
    const snapshot={format:1,created:new Date().toISOString(),tables:Object.fromEntries(backupTables.map((table,i)=>[table,results[i].results]))};
    const body=JSON.stringify(snapshot);
    if(new TextEncoder().encode(body).length>20_000_000)throw new Error('Backup exceeds safe export size; operator intervention required');
    await bucket.put(key,body,{httpMetadata:{contentType:'application/json'}});
    console.info('security:backup_complete',day);
    const cutoff=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
    const old=await bucket.list({prefix:'backups/',limit:1000});
    for(const object of old.objects)if(object.key.slice(8,18)<cutoff)await bucket.delete(object.key);
    await db.prepare('DELETE FROM analytics_events WHERE day<?').bind(new Date(Date.now()-90*86400000).toISOString().slice(0,10)).run();
    await db.prepare('DELETE FROM security_counters WHERE expires<? AND key!=?').bind(now-86400,'backup-lock').run();
  }catch(e){console.error('security:backup_failed');throw e;}
  finally{await db.prepare("DELETE FROM security_counters WHERE key='backup-lock'").run();}
}
