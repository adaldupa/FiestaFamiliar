// Pruebas reales de navegador. Requiere Playwright y Chromium; no cambia datos de usuario.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const fixture=JSON.parse(fs.readFileSync('evidencia/sesion-demo-exportada.json','utf8'));
const KEY='retos.equipos.v2';
let browser,server,base;
const evidence=process.env.NAV_EVIDENCE||'evidencia/navegacion';
const errors=[];
async function startServer(lan=false){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'retos-nav-'));
 const args=lan?['-u','servidor_local.py','--port','0','--data-dir',dir]:['-u','-m','http.server','0','--bind','127.0.0.1'];
 const process=spawn('python3',args,{stdio:['ignore','pipe','pipe']});
 const url=await new Promise((resolve,reject)=>{let text='';const timeout=setTimeout(()=>reject(Error('El servidor no inició')),10000);process.stdout.on('data',chunk=>{text+=chunk;const m=text.match(lan?/Computadora: http:\/\/127.0.0.1:(\d+)/:/port (\d+)/);if(m){clearTimeout(timeout);resolve('http://127.0.0.1:'+m[1]);}});process.on('error',reject);});
 return {process,url,dir};
}
before(async()=>{
 fs.mkdirSync(evidence,{recursive:true});
 server=await startServer();base=server.url;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
});
after(async()=>{await browser?.close();server?.process.kill();if(server)fs.rmSync(server.dir,{recursive:true,force:true});});
async function fresh(viewport={width:1440,height:1000}){
 const context=await browser.newContext({viewport});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/index.html');await page.waitForSelector('.section-nav');
 await page.evaluate(({fixture,KEY})=>localStorage.setItem(KEY,JSON.stringify(fixture)),{fixture,KEY});
 await page.reload();await page.waitForSelector('.section-nav');return {context,page};
}
const state=page=>page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
const go=async(page,id)=>{await page.locator(`.section-nav [data-section="${id}"]`).click();assert.equal(await page.locator('[data-section-panel]:visible').count(),1);await page.locator(`#section-${id}`).waitFor({state:'visible'});};
const shot=async(page,name)=>page.screenshot({path:`${evidence}/${name}.png`,fullPage:false});
const confirm=async page=>{await page.locator('#confirmation').waitFor({state:'visible'});await page.locator('#confirmation button[value="ok"]').click();await page.locator('#confirmation').waitFor({state:'hidden'});};
async function phase(page,value){await page.waitForFunction(({KEY,value})=>JSON.parse(localStorage.getItem(KEY)).contest?.events.find(x=>x.id===JSON.parse(localStorage.getItem(KEY)).contest.activeEventId)?.phase===value,{KEY,value});}
async function create(page){
 await page.locator('.new-meeting summary').click();await page.locator('#contest-create [name="name"]').fill('Navegación · familia de prueba');
 await page.locator('#contest-create [name="seconds"]').fill('120');await page.locator('#contest-create [name="approved"]').check();
 await page.locator('#contest-create button').click();await phase(page,'teams_confirmed');await page.locator('#section-concurso').waitFor({state:'visible'});
}
async function assertFits(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No debe existir desbordamiento horizontal');}

test('escritorio: secciones independientes, borradores, pasos, teclado y ronda completa',async()=>{
 const {context,page}=await fresh();
 await shot(page,'escritorio-inicio');const original=await state(page);
 for(const id of ['participantes','equipos','concurso','biblioteca','resultados','inicio']){await go(page,id);await assertFits(page);assert.deepEqual(await state(page),original);}
 await go(page,'participantes');await shot(page,'escritorio-participantes');
 // Un borrador de Inicio sobrevive a cambiar de sección sin enviar el formulario.
 await go(page,'inicio');await page.locator('.new-meeting summary').click();await page.locator('#contest-create [name="name"]').fill('Borrador conservado');
 await go(page,'equipos');await page.locator('.team-steps [data-team-step="sorteo"]').click();assert.equal(await page.locator('[data-team-panel]:visible').count(),1);
 await page.locator('[data-team-step="revision"]').first().click();await shot(page,'escritorio-equipos');
 await go(page,'inicio');assert.equal(await page.locator('#contest-create [name="name"]').inputValue(),'Borrador conservado');await page.locator('.new-meeting summary').click();
 await create(page);
 await page.locator('#contest-draw [name="seed"]').fill('navegacion-ronda');await page.locator('#contest-draw button').click();await phase(page,'selecting_game');
 await page.locator('#contest-reveal').click();await page.locator('[data-contest="instructions"]').click();await phase(page,'selecting_representatives');await page.locator('#contest-reps button').click();await phase(page,'presenting_rules');
 await shot(page,'escritorio-reglas');await page.locator('[data-contest="prepare"]').click();await phase(page,'preparing_challenge');
 await page.locator('.secret-card summary').click();await page.locator('#contest-phrase textarea').fill('CANARIO PRIVADO DE NAVEGACIÓN');await page.locator('#contest-phrase button').click();
 await page.locator('[data-contest="start"]').click();await phase(page,'timer_active');
 const active=await state(page),deadline=active.contest.events[0].rounds[0].turns[0].timer.deadline;
 for(const id of ['inicio','participantes','equipos','biblioteca','resultados','concurso']){await go(page,id);assert.deepEqual(await state(page),active);}
 assert.equal((await state(page)).contest.events[0].rounds[0].turns[0].timer.deadline,deadline);
 assert.equal(await page.locator('#add-person').isVisible(),false);assert.equal(await page.locator('#team-names').isVisible(),false);
 await shot(page,'escritorio-concurso');await page.reload();await phase(page,'timer_active');assert.equal(await page.locator('#section-concurso').isVisible(),true);
 assert.equal((await state(page)).contest.events[0].rounds[0].turns[0].timer.deadline,deadline);
 await page.locator('[data-contest="pause"]').click();await phase(page,'timer_paused');const paused=await state(page);await go(page,'resultados');await go(page,'concurso');assert.deepEqual(await state(page),paused);
 await page.locator('[data-contest="start"]').click();await phase(page,'timer_active');
 for(let i=0;i<4;i++){
  await page.locator('[data-contest="end"]').click();await confirm(page);await phase(page,'capturing_results');
  if(i===0)await page.locator('#contest-outcome [name="success"]').check();
  await page.locator('#contest-outcome button').click();
  if(i<3){await phase(page,'preparing_challenge');await page.locator('[data-contest="start"]').click();await phase(page,'timer_active');}
 }
 await page.locator('[data-contest="review"]').click();await phase(page,'confirming_score');await page.locator('[data-contest="confirm"]').click();await confirm(page);await phase(page,'scoreboard_updated');
 assert.equal((await state(page)).contest.events[0].ledger.reduce((n,m)=>n+m.amount,0),100);
 await go(page,'resultados');await shot(page,'escritorio-resultados');await go(page,'biblioteca');await shot(page,'escritorio-biblioteca');
 // Operación por teclado: activar Concurso usando Enter.
 await page.locator('.section-nav [data-section="concurso"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#section-concurso').isVisible(),true);
 const tv=await context.newPage();await tv.goto(base+'/publico.html');await tv.waitForSelector('#tv-stage');assert.ok(!(await tv.locator('body').innerText()).includes('CANARIO PRIVADO'));assert.equal(await tv.locator('.section-nav').count(),0);
 await shot(tv,'tv-separada');assert.deepEqual(errors,[]);await context.close();
});

test('celular 390 y 320 px: navegación compacta, borradores y reloj conservado',async()=>{
 const {context,page}=await fresh({width:390,height:844});
 for(const id of ['inicio','participantes','equipos','biblioteca','resultados']){await go(page,id);await assertFits(page);await shot(page,'celular-'+id);}
 await go(page,'inicio');await create(page);await page.locator('#contest-draw button').click();await page.locator('#contest-reveal').click();await page.locator('[data-contest="instructions"]').click();await page.locator('#contest-reps button').click();await page.locator('[data-contest="prepare"]').click();
 await page.locator('.secret-card summary').click();await page.locator('#contest-phrase textarea').fill('Tarjeta sin guardar');await go(page,'participantes');await go(page,'concurso');
 assert.equal(await page.locator('.secret-card').getAttribute('open'),null);await page.locator('.secret-card summary').click();assert.equal(await page.locator('#contest-phrase textarea').inputValue(),'Tarjeta sin guardar');await page.locator('.secret-card summary').click();
 await page.locator('[data-contest="start"]').click();await phase(page,'timer_active');const running=await state(page);await shot(page,'celular-concurso');
 await go(page,'resultados');await go(page,'concurso');assert.deepEqual(await state(page),running);await assertFits(page);
 await page.setViewportSize({width:320,height:740});for(const id of ['inicio','participantes','equipos','concurso','biblioteca','resultados']){await go(page,id);await assertFits(page);}
 assert.deepEqual(errors,[]);await context.close();
});

test('Wi-Fi: navegar no escribe revisiones; otro conductor y TV reciben el mismo estado',async()=>{
 const lan=await startServer(true);let hostContext,remoteContext;
 try{
  hostContext=await browser.newContext();const host=await hostContext.newPage();await host.goto(lan.url+'/index.html');await host.waitForSelector('.section-nav');
  const code=await host.evaluate(()=>sessionStorage.getItem('retos.lan.control'));
  const write=await host.request.post(lan.url+'/api/session',{headers:{Authorization:'Bearer '+code},data:{revision:1,state:fixture}});assert.equal(write.status(),200);
  await host.reload();await host.waitForSelector('.section-nav');await create(host);
  remoteContext=await browser.newContext({viewport:{width:390,height:844}});const remote=await remoteContext.newPage();await remote.goto(lan.url+'/index.html#control='+code);await remote.waitForSelector('.section-nav');await go(remote,'concurso');
  const before=await host.request.get(lan.url+'/api/session',{headers:{Authorization:'Bearer '+code}}).then(r=>r.json());
  for(const id of ['participantes','equipos','inicio','resultados','concurso'])await go(remote,id);
  const after=await host.request.get(lan.url+'/api/session',{headers:{Authorization:'Bearer '+code}}).then(r=>r.json());assert.deepEqual(after,before);
  await remote.locator('#contest-draw button').click();await remote.locator('#contest-reveal').click();await remote.locator('[data-contest="instructions"]').click();await remote.locator('#contest-reps button').click();await remote.locator('[data-contest="prepare"]').click();await remote.locator('[data-contest="start"]').click();await phase(remote,'timer_active');
  const tv=await hostContext.newPage();await tv.goto(lan.url+'/publico.html');await tv.waitForSelector('.contest-clock');
  const payload=await host.request.get(lan.url+'/api/public').then(r=>r.json());assert.equal(payload.snapshot.contest.phase,'timer_active');
  await go(host,'concurso');await host.locator('[data-contest="pause"]').waitFor();await go(remote,'biblioteca');await go(remote,'concurso');
  await remote.reload();await phase(remote,'timer_active');assert.equal(await remote.locator('#section-concurso').isVisible(),true);
  await shot(remote,'celular-wifi');
 }finally{await hostContext?.close();await remoteContext?.close();lan.process.kill();fs.rmSync(lan.dir,{recursive:true,force:true});}
});

test('offline: navegación, estilos y sección seleccionada sobreviven recarga sin servidor',async()=>{
 const {context,page}=await fresh();
 await page.waitForFunction(()=>document.querySelector('#save-status')?.textContent.includes('Listo sin conexión'));
 await go(page,'equipos');await page.locator('.team-steps [data-team-step="revision"]').click();
 const saved=await state(page);
 await context.setOffline(true);await page.reload();await page.waitForSelector('.section-nav');
 assert.equal(await page.locator('#section-equipos').isVisible(),true);assert.equal(await page.locator('#team-revision').isVisible(),true);
 await go(page,'concurso');assert.equal(await page.locator('[data-section-panel]:visible').count(),1);assert.deepEqual(await state(page),saved);
 await context.close();
});
