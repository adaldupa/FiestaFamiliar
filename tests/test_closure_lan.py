import copy
import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class ClosureLANTests(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        js = """import {cases} from './tests/closure-fixtures.js';const all=cases();console.log(JSON.stringify(all.filter((x,i)=>i<4||x.state.contest.events[0].phase==='awards'||x.state.contest.events[0].status==='finished'||x.state.contest.events[0].phase==='scoreboard_updated')));"""
        cls.cases = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))

    def test_full_event_public_contract_and_private_questions(self):
        for case in self.cases:
            self.assertEqual(lan.public_snapshot(case['state']), case['public'])
            public = json.dumps(case['public'])
            for key in ['"answer"', '"bank"', '"pending":', 'rewardSnapshot', '"ledger"']:
                self.assertNotIn(key, public)
        self.assertEqual(len(self.cases[-1]['state']['contest']['events'][0]['rounds']), 12)

    def test_duel_award_is_independent_unique_and_recovers_on_restart(self):
        case = next(c for c in self.cases if c['state']['contest']['events'][0]['duel']['attempts'])
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 200)
        restored = lan.Store(self.tmp.name).read()
        self.assertEqual(restored['state'], case['state'])
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 409)
        bad = copy.deepcopy(case['state'])
        e = bad['contest']['events'][0]
        e['ledger'].append(copy.deepcopy(e['ledger'][0]))
        self.assertEqual(self.request('POST', '/api/session', {'state': bad, 'revision': 1}, True)[0], 400)
        self.assertEqual(self.server.store.read(), restored)

    def test_awards_freeze_survives_reload_and_rejects_tampered_classification(self):
        case = next(c for c in self.cases if c['state']['contest']['events'][0]['phase'] == 'awards')
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 200)
        before = self.server.store.read()
        bad = copy.deepcopy(case['state'])
        bad['contest']['events'][0]['awards']['rows'][0]['score'] += 100
        self.assertEqual(self.request('POST', '/api/session', {'state': bad, 'revision': 1}, True)[0], 400)
        self.assertEqual(self.server.store.read(), before)
        status, raw, _ = self.request('GET', '/api/public')
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)['snapshot']['contest']['screen'], 'awards')

    def test_fractional_lan_clock_and_corrected_points_are_accepted_and_retained(self):
        js = """import {closure,prepare} from './tests/closure-fixtures.js';import * as C from './src/contest-core.js';import * as F from './src/full-engines.js';import * as T from './src/teams-core.js';const s=closure(),r=prepare(s,'galleta-viajera');C.prepareChallenge(s);C.startTimer(s,10000.5);F.fullAction(s,'complete',{teamId:'t1'},11001.75);C.finishTimer(s,12000.25);C.reviewScores(s);C.confirmScores(s,r.draft.id);C.correctScores(s,{t1:80,t2:60,t3:20,t4:0},'Corrección observada');C.confirmScores(s,r.draft.id);console.log(JSON.stringify({state:s,public:T.publicSnapshot(s)}));"""
        case = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))
        self.assertEqual(lan.public_snapshot(case['state']), case['public'])
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 200)
        saved = lan.Store(self.tmp.name).read()['state']
        self.assertEqual(saved, case['state'])
        self.assertEqual(lan.public_snapshot(saved)['contest']['teams'][0]['score'], 80)

    def test_definitive_duel_bank_is_private(self):
        self.assertEqual(self.request('GET', '/catalogo/duelo-generaciones.json')[0], 401)
        self.assertEqual(self.request('GET', '/catalogo/duelo-generaciones.json', auth=True)[0], 200)

    def test_blind_selection_and_automatic_reward_policy_match_public_lan_contract(self):
        js = """import {closure,selectGame,prepare} from './tests/closure-fixtures.js';import {play} from './tests/full-fixtures.js';import * as C from './src/contest-core.js';import * as T from './src/teams-core.js';import * as X from './src/closure-core.js';import * as F from './src/full-engines.js';const out=[],snap=s=>out.push({state:T.clone(s),public:T.publicSnapshot(s)});const s=closure();X.configureClosure(s,{representativesBefore:true});selectGame(s,'galleta-viajera');snap(s);const x=closure();play(x,'galleta-viajera');C.correctScores(x,{t1:100,t2:75,t3:50,t4:25},'Clasificación confirmada');C.confirmScores(x,C.activeRound(C.activeEvent(x)).draft.id);C.nextRound(x);X.configureClosure(x,{enabled:true,lead:25,cooldown:1});snap(x);const r=prepare(x,'roba-y-gana'),e=C.activeEvent(x);C.prepareChallenge(x);C.startTimer(x,10000);const desired=['steal:50','gift:100','challenge:100','steal:25'];e.teams.forEach((t,i)=>F.fullAction(x,'choose',{teamId:t.id,index:r.full.rewardCards.findIndex(c=>c.kind+':'+c.amount===desired[i])},11000));F.fullAction(x,'reveal',{},12000);F.fullAction(x,'reward',{teamId:'t1'},13000);F.fullAction(x,'reward',{teamId:'t3',success:true},13000);F.fullAction(x,'reward',{teamId:'t4'},13000);C.finishTimer(x,14000);C.reviewScores(x);C.confirmScores(x,r.draft.id);snap(x);console.log(JSON.stringify(out));"""
        frames = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))
        for i, case in enumerate(frames):
            self.assertEqual(lan.public_snapshot(case['state']), case['public'])
            self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': i}, True)[0], 200)
        self.assertIsNone(frames[0]['public']['contest']['game'])
        self.assertIsNone(frames[0]['public']['contest']['timer'])
        self.assertEqual(frames[1]['public']['contest']['availableCount'], 1)
        self.assertTrue(frames[1]['public']['contest']['automaticReward'])
        r = frames[-1]['state']['contest']['events'][0]['rounds'][-1]
        self.assertEqual(r['full']['rewardSnapshot']['targets']['t1'], 't2')


class ConfiguredPointsRegression(unittest.TestCase):
    def test_rank_points_use_game_configuration(self):
        from full_engines import calculate
        teams = [{'id': 't'+str(i)} for i in range(1, 5)]
        e = {'teams': teams}
        r = {'representatives': {t['id']: 'participant' for t in teams}, 'game': {'scoring': {'positions': [80, 60, 40, 20]}}, 'full': {'mode': 'position', 'results': {t['id']: {'completed': True, 'ms': i*100} for i, t in enumerate(teams)}}}
        self.assertEqual(calculate(e, r), dict(zip([t['id'] for t in teams], [80, 60, 40, 20])))
