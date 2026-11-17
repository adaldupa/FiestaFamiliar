import copy
import http.client
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('lan', ROOT/'servidor_local.py')
lan = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lan)


class LANTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.server = lan.make_server('127.0.0.1', 0, self.tmp.name, '127.0.0.1')
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.fixture = json.loads((ROOT/'evidencia/sesion-demo-exportada.json').read_text())
        self.fixture['secrets'] = ['SECRETO_CANARIO']
        self.fixture['audit'].append({'at': '2026-11-16T12:00:00Z', 'type': 'migration', 'reason': 'NOTA_PRIVADA_CANARIO'})

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.tmp.cleanup()

    def request(self, method, path, data=None, auth=False, headers=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.server.server_port, timeout=5)
        h = dict(headers or {})
        if auth:
            h['Authorization'] = 'Bearer '+self.server.store.code
        body = None if data is None else json.dumps(data)
        if body:
            h['Content-Type'] = 'application/json'
        conn.request(method, path, body=body, headers=h)
        response = conn.getresponse()
        raw = response.read()
        result = (response.status, raw, dict(response.getheaders()))
        conn.close()
        return result

    def publish(self, revision=0):
        status, raw, _ = self.request('POST', '/api/session', {'state': self.fixture, 'revision': revision}, True)
        self.assertEqual(status, 200, raw)
        return json.loads(raw)

    def test_private_requires_code_and_public_excludes_all_private_fields(self):
        self.publish()
        self.assertEqual(self.request('GET', '/api/session')[0], 401)
        code, raw, headers = self.request('GET', '/api/public')
        self.assertEqual(code, 200)
        for word in [b'"age":', b'createdAt', b'SECRETO_CANARIO', b'NOTA_PRIVADA_CANARIO', b'"audit"', b'candidateSeed', b'metrics']:
            self.assertNotIn(word, raw)
        snapshot = json.loads(raw)['snapshot']
        self.assertEqual(sum(len(t['members']) for t in snapshot['teams']), 17)
        self.assertEqual(len(snapshot['teams']), 4)
        self.assertEqual(headers['Cache-Control'], 'no-store')
        self.assertNotIn('Access-Control-Allow-Origin', headers)

    def test_second_device_recovers_same_private_session_and_confirmation(self):
        saved = self.publish()
        status, raw, _ = self.request('GET', '/api/session', auth=True)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw), saved)
        self.assertTrue(saved['state']['confirmed'])

    def test_stale_writer_cannot_overwrite_newer_changes(self):
        self.publish()
        changed = copy.deepcopy(self.fixture)
        changed['teamNames'][0] = 'Desde celular'
        self.assertEqual(self.request('POST', '/api/session', {'state': changed, 'revision': 1}, True)[0], 200)
        self.assertEqual(self.request('POST', '/api/session', {'state': self.fixture, 'revision': 1}, True)[0], 409)
        self.assertEqual(self.server.store.read()['state']['teamNames'][0], 'Desde celular')

    def test_server_restart_keeps_session_revision_and_code(self):
        self.publish()
        restored = lan.Store(self.tmp.name)
        self.assertEqual(restored.read(), self.server.store.read())
        self.assertEqual(restored.code, self.server.store.code)

    def test_invalid_or_unauthorized_write_leaves_saved_data_intact(self):
        self.publish()
        before = self.server.store.read()
        broken = copy.deepcopy(self.fixture)
        broken['result']['teams'][0]['members'][0] = broken['result']['teams'][1]['members'][0]
        self.assertEqual(self.request('POST', '/api/session', {'state': broken, 'revision': 1}, True)[0], 400)
        self.assertEqual(self.request('POST', '/api/session', {'state': self.fixture, 'revision': 1})[0], 401)
        self.assertEqual(self.server.store.read(), before)

    def test_code_bootstrap_rejects_untrusted_host_and_other_origins(self):
        self.assertEqual(self.request('GET', '/api/pairing')[0], 200)
        self.assertEqual(self.request('GET', '/api/pairing', headers={'Host': 'evil.example'})[0], 403)
        self.assertEqual(self.request('POST', '/api/session', {'state': self.fixture, 'revision': 0}, True, {'Origin': 'https://evil.example'})[0], 403)

    def test_static_routes_never_serve_private_files_git_or_exports(self):
        for route in ['/.datos-locales/session.json', '/.git/config', '/evidencia/sesion-demo-exportada.json', '/src/../.datos-locales/control.key', '/src/%2e%2e/.datos-locales/control.key', '/api/unknown']:
            self.assertEqual(self.request('GET', route)[0], 404, route)
        self.assertEqual(self.request('GET', '/index.html')[0], 200)
        self.assertEqual(self.request('HEAD', '/.datos-locales/session.json')[0], 404)

    def test_public_route_returns_no_private_state_before_first_save(self):
        status, raw, _ = self.request('GET', '/api/public')
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw), {'snapshot': None, 'revision': 0})

    def test_two_concurrent_writers_only_one_revision_wins(self):
        self.publish()
        statuses = []
        def update():
            statuses.append(self.request('POST', '/api/session', {'state': self.fixture, 'revision': 1}, True)[0])
        threads = [threading.Thread(target=update) for _ in range(2)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        self.assertEqual(sorted(statuses), [200, 409])
        self.assertEqual(self.server.store.revision, 2)


if __name__ == '__main__':
    unittest.main()
