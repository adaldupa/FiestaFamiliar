import copy
import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class RoundLANTests(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        cls.cases = json.loads(subprocess.check_output(['node', 'tests/rounds-fixtures.js'], cwd=ROOT))

    def test_public_snapshots_match_javascript_in_all_new_states(self):
        for case in self.cases:
            self.assertEqual(lan.public_snapshot(case['state']), case['public'])
            self.assertNotIn('privateInstructions', json.dumps(case['public']))
            self.assertNotIn('secretIndex', json.dumps(case['public']))
            self.assertNotIn('ruleSnapshots', json.dumps(case['public']))

    def test_two_conductors_cannot_create_duplicate_rounds(self):
        before=self.cases[0]['state']
        first=self.cases[1]['state']
        second=copy.deepcopy(first)
        self.assertEqual(self.request('POST','/api/session',{'state':before,'revision':0},True)[0],200)
        self.assertEqual(self.request('POST','/api/session',{'state':first,'revision':1},True)[0],200)
        self.assertEqual(self.request('POST','/api/session',{'state':second,'revision':1},True)[0],409)
        self.assertEqual(len(self.server.store.read()['state']['contest']['events'][0]['rounds']),1)

    def test_restart_recovers_pending_execution_and_its_version(self):
        state=self.cases[4]['state']
        self.assertEqual(self.request('POST','/api/session',{'state':state,'revision':0},True)[0],200)
        restored=lan.Store(self.tmp.name).read()['state']
        self.assertEqual(restored,state)
        self.assertEqual(lan.public_snapshot(restored)['contest']['engine']['message'],'Motor pendiente de integración')

    def test_fake_results_timers_and_version_references_are_rejected(self):
        state=self.cases[4]['state']
        for mutate in [lambda r:r['turns'][0].update({'outcome':{'points':100}}),
                       lambda r:r['turns'][0].update({'timer':{'status':'running'}}),
                       lambda r:r['ruleRef'].update({'eventSnapshot':999}),
                       lambda r:r['attempts'].append({'status':'active'})]:
            bad=copy.deepcopy(state)
            mutate(bad['contest']['events'][0]['rounds'][0])
            self.assertEqual(self.request('POST','/api/session',{'state':bad,'revision':0},True)[0],400)
            self.assertIsNone(self.server.store.read()['state'])

    def test_unscored_round_stays_unscored_and_no_ledger_is_created(self):
        state=self.cases[5]['state']
        self.assertEqual(self.request('POST','/api/session',{'state':state,'revision':0},True)[0],200)
        status,raw,_=self.request('GET','/api/public')
        self.assertEqual(status,200)
        public=json.loads(raw)['snapshot']['contest']
        self.assertEqual(public['screen'],'results')
        self.assertEqual(public['result']['status'],'unscored')
        self.assertTrue(all(x['points'] is None for x in public['result']['rows']))
        self.assertEqual(self.server.store.read()['state']['contest']['events'][0]['ledger'],[])
