import copy
import json
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan

ROOT = Path(__file__).resolve().parents[1]

class ContestLANTests(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request
    publish = test_lan.LANTests.publish

    def contest(self):
        fixture = json.loads((ROOT/'tests/contest-fixture.json').read_text())
        self.fixture = fixture['state']
        return fixture

    def test_python_and_javascript_public_snapshots_match(self):
        fixture = self.contest()
        self.publish()
        status, raw, _ = self.request('GET', '/api/public')
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)['snapshot'], fixture['public'])
        for secret in self.fixture['contest']['events'][0]['selectedGames'][0]['secrets']:
            self.assertNotIn(secret.encode(), raw)
        for word in [b'"age"', b'privateInstructions', b'"ledger"', b'"audit"', b'"draft"', self.server.store.code.encode()]:
            self.assertNotIn(word, raw)

    def test_catalog_is_authenticated_and_public_clock_uses_server_time(self):
        self.assertEqual(self.request('GET','/catalogo/actor-fase2.json')[0],401)
        self.assertEqual(self.request('HEAD','/catalogo/actor-fase2.json')[0],401)
        self.assertEqual(self.request('GET','/%63atalogo/actor-fase2.json')[0],401)
        self.assertEqual(self.request('GET','/catalogo/actor-fase2.json',auth=True)[0],200)
        status, _, headers = self.request('GET','/api/public')
        self.assertEqual(status,200)
        self.assertGreater(int(headers['X-Server-Time']),0)

    def test_broken_ledger_cannot_overwrite_saved_event(self):
        self.contest()
        self.publish()
        before=self.server.store.read()
        self.fixture['contest']['events'][0]['ledger'][0]['amount']=999
        self.assertEqual(self.request('POST','/api/session',{'state':self.fixture,'revision':1},True)[0],400)
        self.assertEqual(self.server.store.read(),before)

    def test_two_devices_cannot_duplicate_confirmation_and_restart_retains_score(self):
        self.contest()
        self.publish()
        self.assertEqual(self.request('POST','/api/session',{'state':self.fixture,'revision':0},True)[0],409)
        restored=lan.Store(self.tmp.name)
        self.assertEqual(restored.read(),self.server.store.read())
        self.assertEqual(lan.public_snapshot(restored.read()['state'])['contest']['teams'][0]['score'],100)

    def test_before_representatives_neither_selection_nor_wheel_is_public(self):
        self.contest()
        event=self.fixture['contest']['events'][0]
        event['selectedGames'][0]['representativesBefore']=True
        r=event['rounds'][0]
        r['game']['representativesBefore']=True
        r['representativesConfirmed']=False
        event['phase']='selecting_representatives'
        public=lan.public_snapshot(self.fixture)['contest']
        self.assertIsNone(public['game'])
        self.assertIsNone(public['wheel'])
        self.assertTrue(all(t['representative'] is None for t in public['teams']))
