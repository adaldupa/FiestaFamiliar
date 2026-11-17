import copy
import json
import unittest
from pathlib import Path
import test_lan
lan = test_lan.lan
ROOT = Path(__file__).resolve().parents[1]


class LibraryLANTests(unittest.TestCase):
    setUp = test_lan.LANTests.setUp
    tearDown = test_lan.LANTests.tearDown
    request = test_lan.LANTests.request
    publish = test_lan.LANTests.publish

    def library(self):
        self.fixture = json.loads((ROOT/'tests/contest-fixture.json').read_text())['state']
        lib = self.fixture['contest']['library']
        seed = {'games':json.loads((ROOT/'catalogo/fichas-publicas-fase2b.json').read_text())['games']}
        for game in seed['games']:
            g = copy.deepcopy(game)
            g['privateInstructions'] = 'Sin instrucciones privadas. Complétalas localmente si son necesarias.'
            g['secrets'] = []
            if g['id'] == 'actor':
                g['ruleVersion'] = 2
                lib['games'][0] = g
            else:
                lib['games'].append(g)
            lib['versions'].append(copy.deepcopy(g))
        lib['games'][0]['secrets'] = ['CANARIO_LIBRERIA_NO_PUBLICAR']
        for g in lib['versions']:
            if g['id'] == 'actor' and g['ruleVersion'] == 2:
                g['secrets'] = ['CANARIO_LIBRERIA_NO_PUBLICAR']
        lib['collections'] = [{'id':'navidad','name':'Navidad','games':[{'id':'actor','ruleVersion':2}], 'createdAt':'2026-11-17T19:00:00Z','updatedAt':'2026-11-17T19:00:00Z'}]
        return self.fixture

    def test_catalog_metadata_and_versions_persist_without_public_exposure(self):
        self.library()
        self.publish()
        status, raw, _ = self.request('GET', '/api/public')
        self.assertEqual(status, 200)
        for word in [b'CANARIO_LIBRERIA', b'"library"', b'"collections"', b'"pending"']:
            self.assertNotIn(word, raw)
        restored = lan.Store(self.tmp.name).read()['state']
        self.assertEqual(restored['contest']['library'], self.fixture['contest']['library'])
        self.assertEqual(json.loads(raw)['snapshot']['contest']['teams'][0]['score'], 100)

    def test_bad_library_cannot_overwrite_state_or_revision(self):
        self.library()
        self.publish()
        before = self.server.store.read()
        for mutate in [lambda lib: lib['versions'].append(copy.deepcopy(lib['versions'][0])),
                       lambda lib: lib['collections'][0]['games'][0].update({'ruleVersion':999}),
                       lambda lib: next(g for g in lib['games'] if g['id']=='roba-y-gana').update({'status':'archived'}),
                       lambda lib: lib['games'][0]['scoring'].update({'max':1000,'approvedException':False})]:
            state = copy.deepcopy(self.fixture)
            mutate(state['contest']['library'])
            self.assertEqual(self.request('POST','/api/session',{'state':state,'revision':1},True)[0],400)
            self.assertEqual(self.server.store.read(),before)

    def test_library_seed_requires_authentication(self):
        for method in ['GET','HEAD']:
            self.assertEqual(self.request(method,'/catalogo/fichas-publicas-fase2b.json')[0],401)
            self.assertEqual(self.request(method,'/%63atalogo/fichas-publicas-fase2b.json')[0],401)
        self.assertEqual(self.request('GET','/catalogo/fichas-publicas-fase2b.json',auth=True)[0],200)
        self.assertEqual(self.request('GET','/biblioteca_validacion.py')[0],404)

    def test_stale_conductor_cannot_replace_library_changes(self):
        self.library()
        self.publish()
        changed = copy.deepcopy(self.fixture)
        changed['contest']['library']['collections'][0]['name'] = 'Nombre actualizado'
        self.assertEqual(self.request('POST','/api/session',{'state':changed,'revision':1},True)[0],200)
        self.assertEqual(self.request('POST','/api/session',{'state':self.fixture,'revision':1},True)[0],409)
        self.assertEqual(self.server.store.read()['state']['contest']['library']['collections'][0]['name'],'Nombre actualizado')

    def test_future_engine_cannot_be_activated_by_session_import(self):
        self.library()
        self.fixture['contest']['events'][0]['selectedGames'][0]['implementation'] = 'planned'
        self.assertEqual(self.request('POST','/api/session',{'state':self.fixture,'revision':0},True)[0],400)
        self.assertIsNone(self.server.store.read()['state'])
