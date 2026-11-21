import copy
import json
import subprocess
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]

class PostensayoLAN(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request

    @classmethod
    def setUpClass(cls):
        cls.frames = json.loads(subprocess.check_output(['node', 'tests/postensayo-fixtures.js'], cwd=ROOT))

    def test_all_revised_turns_and_choice_owners_match_public_contract(self):
        for frame in self.frames:
            self.assertEqual(lan.public_snapshot(frame['state']), frame['public'])

    def test_save_restart_stale_write_and_private_cards(self):
        for frame in self.frames:
            e = frame['state']['contest']['events'][0]
            if e['phase'] != 'timer_active': continue
            r = e['rounds'][-1]
            if r['game']['id'] not in ['actor', 'tararea']: continue
            self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 200)
            before = self.server.store.read()
            self.assertEqual(lan.Store(self.tmp.name).read(), before)
            self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 409)
            public = json.loads(self.request('GET', '/api/public')[1])
            for card in r['full']['cards'].values():
                if card: self.assertNotIn(card['text'], json.dumps(public, ensure_ascii=False))
            self.assertEqual(self.server.store.read(), before)
            break

    def test_reject_tampered_mode_and_selection_order(self):
        frame = next(f for f in self.frames if f['state']['contest']['events'][0]['rounds'][-1]['game']['id'] == 'roba-y-gana' and f['state']['contest']['events'][0]['rounds'][-1]['full']['choices'])
        self.assertEqual(self.request('POST', '/api/session', {'state': frame['state'], 'revision': 0}, True)[0], 200)
        before = self.server.store.read()
        bad = copy.deepcopy(frame['state'])
        bad['contest']['events'][0]['rounds'][-1]['full']['simultaneous'] = False
        self.assertEqual(self.request('POST', '/api/session', {'state': bad, 'revision': 1}, True)[0], 400)
        self.assertEqual(self.server.store.read(), before)
