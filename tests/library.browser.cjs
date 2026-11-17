const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const fixture=JSON.parse(fs.readFileSync('evidencia/sesion-demo-exportada.json','utf8'));
const KEY='retos.equipos.v2',evidence=process.env.LIBRARY_EVIDENCE||'evidencia/fase2b';
let browser,server,base;
async function startServer(lan=false){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'retos-library-'));
 const process=spawn('python3',lan?['-u','servidor_local.py','--port','0','--data-dir',dir]:['-u','-m','http.server','0','--bind','127.0.0.1'],{stdio:['ignore','pipe','pipe']});
 const url=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('Servidor sin respuesta')),10000);process.stdout.on('data',c=>{text+=c;const m=text.match(lan?/Computadora: http:\/\/127.0.0.1:(\d+)/:/port (\d+)/);if(m){clearTimeout(timer);resolve('http://127.0.0.1:'+m[1]);}});process.on('error',reject);});return {process,url,dir};
}
before(async()=>{fs.mkdirSync(evidence,{recursive:true});server=await startServer();base=server.url;browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();server?.process.kill();if(server)fs.rmSync(server.dir,{recursive:true,force:true});});
async function fresh(viewport={width:1440,height:1000},withoutUUID=false){const context=await browser.newContext({viewport});if(withoutUUID)await context.addInitScript(()=>Object.defineProperty(crypto,'randomUUID',{value:undefined}));const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/index.html');await page.waitForSelector('.section-nav');await page.evaluate(({fixture,KEY})=>localStorage.setItem(KEY,JSON.stringify(fixture)),{fixture,KEY});await page.reload();await page.waitForSelector('.section-nav');return {context,page,errors};}
const state=page=>page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
async function go(page,id){await page.locator(`.section-nav [data-section="${id}"]`).click();await page.locator(`#section-${id}`).waitFor({state:'visible'});assert.equal(await page.locator('[data-section-panel]:visible').count(),1);}
async function confirm(page){await page.locator('#confirmation button[value="ok"]').click();await page.locator('#confirmation').waitFor({state:'hidden'});}
async function shot(page,name){await page.screenshot({path:`${evidence}/${name}.jpg`,type:'jpeg',quality:85,fullPage:false});}
async function loadSeed(page){await go(page,'biblioteca');await page.locator('[data-library="seed"]').click();await page.locator('#library-confirm-import [name="conflicts"]').check();await shot(page,'importacion-vista-previa');await page.locator('#library-confirm-import button:not([type="button"])').click();await confirm(page);await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).contest?.library.games.length===12,KEY);}
async function saveEditor(page){await page.locator('#library-editor > .library-editor-actions > button:not([type="button"])').click();await page.locator('#library-editor').waitFor({state:'hidden'});}
async function filter(page,query){await page.locator('#library-filters [name="query"]').fill(query);await page.locator('#library-filters button:not([type="button"])').click();}

test('biblioteca real: cargar doce, editar, duplicar, archivar, restaurar, filtrar, colecciones e importar/exportar',async()=>{
 const {context,page,errors}=await fresh();await loadSeed(page);await shot(page,'biblioteca-escritorio');
 const first=await state(page);assert.equal(first.contest.library.games.find(g=>g.id==='actor').scoring.mode,'position');
 await page.locator('[data-library="new"]').click();await page.locator('#library-editor [name="name"]').fill('Reto de cumpleaños');await page.locator('#library-editor [name="category"]').fill('Familia');await page.locator('#library-editor [name="status"]').selectOption('active');await page.locator('#library-editor [name="publicRules"]').fill('Adivina la palabra siguiendo las reglas del conductor.');
 await page.locator('summary').filter({hasText:'Información privada del conductor'}).click();await page.locator('#library-editor [name="secrets"]').fill('CANARIO_PRIVADO_2B');await shot(page,'editor-escritorio');await saveEditor(page);
 let s=await state(page),g=s.contest.library.games.find(g=>g.name==='Reto de cumpleaños');assert.equal(g.ruleVersion,1);const id=g.id;
 await filter(page,'cumpleaños');assert.equal(await page.locator('.library-card').count(),1);await page.locator(`[data-library="edit"][data-id="${id}"]`).click();await page.locator('#library-editor [name="name"]').fill('Reto familiar actualizado');await saveEditor(page);
 await filter(page,'actualizado');s=await state(page);assert.equal(s.contest.library.games.find(g=>g.id===id).ruleVersion,2);
 await page.locator('.library-card details summary').click();await page.locator(`[data-library="restore"][data-version="1"]`).click();await confirm(page);await page.waitForFunction(({KEY,id})=>JSON.parse(localStorage.getItem(KEY)).contest.library.games.find(g=>g.id===id).ruleVersion===3,{KEY,id});await filter(page,'cumpleaños');
 await page.locator('[data-library="duplicate"]').click();await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).contest.library.games.length===14,KEY);await page.locator(`[data-library="archive"][data-id="${id}"]`).click();await confirm(page);
 await page.locator('[data-library="clear"]').click();await page.locator('summary').filter({hasText:'Crear o actualizar colección'}).click();await page.locator('#library-collection [name="name"]').fill('Navidad y siguientes reuniones');await page.locator('#library-collection [name="games"][value="actor"]').check();await page.locator('#library-collection button').click();await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).contest.library.collections?.length===1,KEY);await shot(page,'coleccion-escritorio');
 const download=page.waitForEvent('download');await page.locator('[data-library="export"]').click();const file=await download;const exported=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(exported.library.games.length,14);assert.equal(exported.library.collections.length,1);
 await page.locator('#library-import').setInputFiles(await file.path());await page.locator('#library-confirm-import').waitFor();assert.ok((await page.locator('.library-import-preview').innerText()).includes('sin cambios'));
 await page.locator('[data-library="cancel-import"]').click();await page.locator('#library-import').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from('{"kind":"incorrecto"}')});await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('incompatible'));
 const before=await state(page);await go(page,'resultados');await go(page,'biblioteca');assert.deepEqual(await state(page),before);
 await page.reload();await page.waitForSelector('.library-card');assert.equal((await state(page)).contest.library.games.length,14);
 await filter(page,'Roba y Gana');assert.equal(await page.locator('[data-library="archive"]').count(),0);
 assert.equal(await page.locator('.library-card').count(),1);await shot(page,'permanente-escritorio');assert.deepEqual(errors,[]);await context.close();
});

test('reunión usa revisión compatible anterior sin ejecutar las nuevas dinámicas; motor y privacidad sobreviven',async()=>{
 const {context,page,errors}=await fresh();await loadSeed(page);await go(page,'inicio');await page.locator('.new-meeting summary').click();assert.ok((await page.locator('#contest-create').innerText()).includes('revisión compatible anterior'));
 for(const input of await page.locator('#contest-create [name="games"]').all()){const value=await input.getAttribute('value');if(!value.startsWith('actor:')&&!value.startsWith('roba-y-gana:'))await input.uncheck();}await page.locator('[data-event-game="actor"] [data-event-version]').selectOption('1');await page.locator('#contest-create [name="approved"]').check();await page.locator('#contest-create button').click();await page.locator('#section-concurso').waitFor({state:'visible'});const event=await state(page);assert.equal(event.contest.events[0].selectedGames[0].ruleVersion,1);assert.equal(event.contest.events[0].selectedGames[0].scoring.mode,'fixed');
 const C=await import('../src/contest-core.js');let seed;for(let i=0;i<200;i++){if(C.drawGame(JSON.parse(JSON.stringify(event)),String(i),Date.now()).game.id==='actor'){seed=String(i);break;}}assert.ok(seed!==undefined);await page.locator('#contest-draw [name="seed"]').fill(seed);await page.locator('#contest-draw button').click();await page.locator('#contest-reveal').click();await page.locator('[data-contest="instructions"]').click();await page.locator('#contest-reps button').click();await page.locator('[data-contest="prepare"]').click();await page.locator('[data-contest="start"]').click();
 const running=await state(page);await go(page,'biblioteca');await filter(page,'actor');await page.locator('[data-library="edit"]').click();await page.locator('#library-editor [name="name"]').fill('Actor: reglas para próxima reunión');await saveEditor(page);assert.deepEqual((await state(page)).contest.events[0],running.contest.events[0]);
 const tv=await context.newPage();await tv.goto(base+'/publico.html');await tv.waitForSelector('#tv-stage');assert.ok(!(await tv.locator('body').innerText()).includes('Actor: reglas para próxima reunión'));assert.ok(!(await tv.locator('body').innerText()).includes('CANARIO_PRIVADO_2B'));
 assert.deepEqual(errors,[]);await context.close();
});

test('móvil: edición, navegación con borrador, filtros, teclado y offline',async()=>{
 const {context,page,errors}=await fresh({width:390,height:844},true);await loadSeed(page);await shot(page,'biblioteca-celular');await page.locator('[data-library="new"]').click();await page.locator('#library-editor [name="name"]').fill('Borrador móvil');await go(page,'participantes');await go(page,'biblioteca');assert.equal(await page.locator('#library-editor [name="name"]').inputValue(),'Borrador móvil');await shot(page,'editor-celular');
 await saveEditor(page);assert.ok((await state(page)).contest.library.games.some(g=>g.name==='Borrador móvil'));
 for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('Listo sin conexión'));const before=await state(page);await context.setOffline(true);await page.reload();await page.waitForSelector('.library-card');assert.deepEqual(await state(page),before);await filter(page,'actor');assert.equal(await page.locator('.library-card').count(),1);
 await page.locator('.section-nav [data-section="concurso"]').press('Enter');assert.equal(await page.locator('#section-concurso').isVisible(),true);assert.deepEqual(errors,[]);await context.close();
});

test('dos conductores LAN ven la misma biblioteca y preservan ediciones no guardadas',async()=>{
 const lan=await startServer(true);let context,remoteContext;
 try{
  context=await browser.newContext();const host=await context.newPage();await host.goto(lan.url+'/index.html');await host.waitForSelector('.section-nav');await loadSeed(host);const code=await host.evaluate(()=>sessionStorage.getItem('retos.lan.control'));
  remoteContext=await browser.newContext({viewport:{width:390,height:844}});const remote=await remoteContext.newPage();await remote.goto(lan.url+'/index.html#control='+code);await remote.waitForSelector('.section-nav');await go(remote,'biblioteca');await filter(remote,'actor');await remote.locator('[data-library="edit"]').click();await remote.locator('#library-editor [name="name"]').fill('Cambio local sin guardar');
  await filter(host,'actor');await host.locator('[data-library="edit"]').click();await host.locator('#library-editor [name="name"]').fill('Cambio confirmado del anfitrión');await saveEditor(host);
  await remote.waitForFunction(()=>document.querySelector('#message').textContent.includes('actualizada'));assert.equal(await remote.locator('#library-editor [name="name"]').inputValue(),'Cambio local sin guardar');await remote.locator('#library-editor > .library-editor-actions > button:not([type="button"])').click();assert.ok((await remote.locator('#message').innerText()).includes('cambió'));
  const raw=await host.request.get(lan.url+'/api/public').then(r=>r.text());assert.ok(!raw.includes('Cambio local sin guardar'));assert.ok(!raw.includes('Cambio confirmado del anfitrión'));assert.ok(!raw.includes('library'));
  await shot(remote,'conflicto-celular');
 }finally{await context?.close();await remoteContext?.close();lan.process.kill();fs.rmSync(lan.dir,{recursive:true,force:true});}
});


test('ficha manual creada sin código se selecciona mediante colección y registra puntos reales',async()=>{
 const {context,page,errors}=await fresh({width:1440,height:1000},true);await go(page,'biblioteca');await page.locator('[data-library="new"]').click();await page.locator('#library-editor [name="name"]').fill('Reto físico manual');await page.locator('#library-editor [name="status"]').selectOption('active');await page.locator('summary').filter({hasText:'Sistema de puntuación y límites'}).click();await page.locator('#library-editor [name="scoringMode"]').selectOption('manual');await saveEditor(page);
 const g=(await state(page)).contest.library.games.find(g=>g.name==='Reto físico manual');
 await page.locator('summary').filter({hasText:'Crear o actualizar colección'}).click();await page.locator('#library-collection [name="name"]').fill('Solo retos físicos');await page.locator(`#library-collection [name="games"][value="${g.id}"]`).check();await page.locator('#library-collection button').click();
 const collection=(await state(page)).contest.library.collections[0];await filter(page,'Reto físico manual');await page.locator('[data-library="edit"]').click();await page.locator('#library-editor [name="name"]').fill('Reto físico manual revisado');await saveEditor(page);await go(page,'inicio');await page.locator('.new-meeting summary').click();await page.locator('#event-collection').selectOption(collection.id);assert.equal(await page.locator('#contest-create [name="games"]:checked').count(),1);await page.locator('#contest-create [name="approved"]').check();await page.locator('#contest-create button').click();await page.locator('#section-concurso').waitFor({state:'visible'});assert.deepEqual((await state(page)).contest.events[0].selectedGames.map(x=>x.id),[g.id]);assert.equal((await state(page)).contest.events[0].selectedGames[0].ruleVersion,1);
 await page.locator('#contest-draw button').click();await page.locator('#contest-reveal').click();await page.locator('[data-contest="instructions"]').click();await page.locator('#contest-reps button').click();await page.locator('[data-contest="prepare"]').click();
 for(let i=0;i<4;i++){await page.locator('[data-contest="end"]').click();await confirm(page);await page.locator('#contest-outcome [name="manualPoints"]').fill(i===0?'75':'0');await page.locator('#contest-outcome [name="reason"]').fill('Resultado validado por el conductor');await page.locator('#contest-outcome button').click();}
 await page.locator('[data-contest="review"]').click();await shot(page,'puntuacion-manual');await page.locator('[data-contest="confirm"]').click();await confirm(page);await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).contest.events[0].phase==='scoreboard_updated',KEY);await shot(page,'puntuacion-confirmada');assert.equal((await state(page)).contest.events[0].ledger.reduce((n,m)=>n+m.amount,0),75);assert.deepEqual(errors,[]);await context.close();
});
