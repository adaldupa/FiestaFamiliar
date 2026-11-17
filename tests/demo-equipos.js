// Repite los datos y semillas de la demostración de navegador sin modificar la sesión del usuario.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initialState,selectCount,runDraw,confirmTeams,validateState,parsePeopleFile,publicSnapshot} from '../src/teams-core.js';
const fixture=JSON.parse(await fs.readFile(new URL('../evidencia/sesion-demo-exportada.json',import.meta.url),'utf8'));
const reports=[];
for(const k of [2,3,4]){const s=initialState();s.people=parsePeopleFile({participants:fixture.people});selectCount(s,k);runDraw(s,`demo-navidad-${k}`,1794873600000);confirmTeams(s,'2026-11-16T12:00:00Z');const restored=validateState(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored,s);assert.equal(new Set(s.result.teams.flatMap(t=>t.members)).size,17);assert.ok(!JSON.stringify(publicSnapshot(s)).includes('"age":'));reports.push({k,seed:s.seed,candidateSeed:s.result.candidateSeed,capacities:s.result.teams.map(t=>t.capacity),meanSpread:s.result.metrics.meanSpread,potSpread:s.result.metrics.potSpread,score:s.result.metrics.score,teams:s.result.teams.map((t,i)=>({name:s.teamNames[i],...s.result.metrics.rows[i]})),reloadConfirmed:restored.confirmed,publicContainsAges:false});}
const output=JSON.stringify({participants:17,ages:fixture.people.map(p=>p.age),reports},null,2)+'\n';
if(process.argv.includes('--save'))await fs.writeFile(new URL('../evidencia/demo-reproducible.json',import.meta.url),output);
console.log(output);
