import copy
import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class RewardConfigLAN(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        cls.frames = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {rewardCases} from './tests/reward-config-fixtures.js';console.log(JSON.stringify(rewardCases()));"], cwd=ROOT))

    def test_custom_amounts_hidden_until_reveal_and_public_contract_matches(self):
        for frame in self.frames:
            self.assertEqual(lan.public_snapshot(frame['state']), frame['public'])
            dto = frame['public']['contest']
            if dto.get('execution'):
                revealed = frame['state']['contest']['events'][0]['rounds'][-1]['full']['revealed']
                self.assertEqual(dto['execution']['rewards'] is not None, revealed)
            self.assertNotIn('rewardAmounts', json.dumps(dto))

    def test_restart_and_stale_conductor_do_not_duplicate_configured_prizes(self):
        frame = self.frames[-1]
        self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 200)
        before = self.server.store.read()
        self.assertEqual(lan.Store(self.tmp.name).read(), before)
        self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 409)
        self.assertEqual(self.server.store.read(), before)
        self.assertEqual(lan.public_snapshot(before['state']), frame['public'])

    def test_tampered_slot_amount_or_exception_cannot_replace_saved_session(self):
        frame = self.frames[-1]
        self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 200)
        before = self.server.store.read()
        for mode in ['slot', 'amount', 'exception']:
            bad = copy.deepcopy(frame['state'])
            e = bad['contest']['events'][0]
            f = e['rounds'][-1]['full']
            if mode == 'slot': f['rewardCards'][0]['slot'] = f['rewardCards'][1]['slot']
            elif mode == 'amount': f['rewardCards'][0]['amount'] += 1
            else: e['settings']['repeat']['maxConsecutive'] = 999
            self.assertEqual(self.request('POST', '/api/session', {'state': bad, 'revision': 1}, True)[0], 400)
            self.assertEqual(self.server.store.read(), before)

    def test_immediate_advantage_exception_has_same_public_schedule_in_lan(self):
        js = """import {closure} from './tests/closure-fixtures.js';import {play} from './tests/full-fixtures.js';import {rewardRound} from './tests/reward-config-fixtures.js';import * as C from './src/contest-core.js';import * as X from './src/closure-core.js';import * as T from './src/teams-core.js';const s=closure();play(s,'galleta-viajera');C.correctScores(s,{t1:100,t2:0,t3:0,t4:0},'Ventaja confirmada');C.confirmScores(s,C.activeRound(C.activeEvent(s)).draft.id);rewardRound(s,['giftA','challengeB','challengeA','giftB']);C.nextRound(s);X.configureClosure(s,{enabled:true,lead:25,cooldown:2,advantageException:true,maxConsecutive:2});console.log(JSON.stringify({state:s,public:T.publicSnapshot(s)}));"""
        frame = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))
        self.assertEqual(lan.public_snapshot(frame['state']), frame['public'])
        self.assertTrue(frame['public']['contest']['automaticReward'])
        self.assertEqual(frame['public']['contest']['availableCount'], 1)
        self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 200)
