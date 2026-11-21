import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class ManualAdjustmentsLAN(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        js = """import {fresh,open} from './tests/full-fixtures.js';import * as C from './src/contest-core.js';import * as F from './src/full-engines.js';import * as T from './src/teams-core.js';const out=[],snap=s=>out.push({state:T.clone(s),public:T.publicSnapshot(s)});for(const id of ['palabras-prohibidas','hazme-sonido','actor','tararea','picasso-oscuras','yo-soy-objeto']){const s=fresh(),r=open(s,id);snap(s);C.startTimer(s,10000);snap(s);C.pauseTimer(s,11000);snap(s);C.startTimer(s,12000);if(r.full.mode==='hits'){F.fullAction(s,'correct',{teamId:r.currentTeamId,cardId:r.full.cards[r.currentTeamId].id},13000);snap(s);C.finishTimer(s,14000);snap(s);}}console.log(JSON.stringify(out));"""
        cls.cases = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))

    def test_public_projection_matches_client_in_all_turn_states(self):
        for case in self.cases:
            self.assertEqual(lan.public_snapshot(case['state']), case['public'])
            dto = case['public']['contest']
            card = dto.get('execution', {}).get('publicCard')
            if card:
                self.assertIn(dto['game']['id'], ['palabras-prohibidas', 'hazme-sonido'])
                self.assertEqual(dto['phase'], 'timer_active')
                self.assertEqual(card['teamId'], dto['activeTeamId'])
                self.assertEqual(set(card), {'teamId', 'id', 'text', 'forbidden'} if dto['game']['id'] == 'palabras-prohibidas' else {'teamId', 'id', 'text'})
            self.assertNotIn('"deck"', json.dumps(dto))
            self.assertNotIn('"cards"', json.dumps(dto))

    def test_public_http_has_only_active_card_and_three_forbidden_words(self):
        case = next(x for x in self.cases if x['public']['contest']['game']['id'] == 'palabras-prohibidas' and x['public']['contest']['phase'] == 'timer_active')
        self.assertEqual(self.request('POST', '/api/session', {'state': case['state'], 'revision': 0}, True)[0], 200)
        status, raw, _ = self.request('GET', '/api/public')
        self.assertEqual(status, 200)
        dto = json.loads(raw)['snapshot']['contest']
        self.assertEqual(dto['execution']['publicCard'], case['public']['contest']['execution']['publicCard'])
        self.assertEqual(len(dto['execution']['publicCard']['forbidden']), 3)
        self.assertNotIn('privateInstructions', raw.decode())
        self.assertEqual(lan.Store(self.tmp.name).read()['state'], case['state'])

    def test_actor_and_song_cards_never_cross_public_endpoint(self):
        for case in self.cases:
            dto = case['public']['contest']
            if dto['game']['id'] in ['actor', 'tararea', 'picasso-oscuras', 'yo-soy-objeto']:
                self.assertNotIn('publicCard', dto['execution'])

    def test_public_card_disappears_on_pause_and_next_team_preparation(self):
        for case in self.cases:
            dto = case['public']['contest']
            if dto['phase'] != 'timer_active': self.assertNotIn('publicCard', dto['execution'])
