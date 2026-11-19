import copy
import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class FullLANTests(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        cls.cases = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {fresh,play,catalog} from './tests/full-fixtures.js';import * as T from './src/teams-core.js';const s=fresh(),cases=[];for(const g of catalog.games){let i=0;play(s,g.id,()=>{if(i++<3)cases.push({state:T.clone(s),public:T.publicSnapshot(s)});});cases.push({state:T.clone(s),public:T.publicSnapshot(s)});}console.log(JSON.stringify(cases));"], cwd=ROOT))

    def test_all_twelve_public_snapshots_match_javascript_without_private_data(self):
        games = set()
        for case in self.cases:
            self.assertEqual(lan.public_snapshot(case['state']), case['public'])
            dto = case['public']['contest']
            games.add(dto['game']['id'])
            raw = json.dumps(dto)
            for field in ['privateInstructions', 'forbidden', 'rewardDecisions', '"target"', 'estimates', 'usedCards', 'deck']:
                self.assertNotIn(field, raw)
        self.assertEqual(len(games), 12)

    def test_disconnect_restart_and_stale_conductor_preserve_full_game(self):
        case = self.cases[-1]
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 200)
        restored = lan.Store(self.tmp.name).read()
        self.assertEqual(restored['state'], case['state'])
        self.assertEqual(lan.public_snapshot(restored['state']), case['public'])
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 409)
        self.assertEqual(self.server.store.read(), restored)

    def test_bank_and_prize_tampering_cannot_replace_saved_session(self):
        case = self.cases[-1]['state']
        self.assertEqual(self.request('POST', '/api/session', {'state': case, 'revision': 0}, True)[0], 200)
        before = self.server.store.read()
        for field in ['bank', 'prize']:
            bad = copy.deepcopy(case)
            rounds = bad['contest']['events'][0]['rounds']
            if field == 'bank':
                r = next(r for r in rounds if r['game']['cards'])
                r['full']['cards']['t1'] = {'id': 'inventada', 'text': 'inventada'}
            else:
                rounds[0]['full']['rewardCards'][0]['amount'] = 999
            self.assertEqual(self.request('POST', '/api/session', {'state': bad, 'revision': 1}, True)[0], 400)
            self.assertEqual(self.server.store.read(), before)

    def test_definitive_catalog_and_banks_require_conductor_authentication(self):
        for path in ['/catalogo/catalogo-definitivo.json', '/catalogo/bancos-definitivos.json']:
            self.assertEqual(self.request('GET', path)[0], 401)
            self.assertEqual(self.request('GET', path, auth=True)[0], 200)
