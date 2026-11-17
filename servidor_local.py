#!/usr/bin/env python3
"""Servidor opcional para celular + TV en la misma Wi-Fi. Solo biblioteca estándar."""
import argparse
import copy
import hmac
import ipaddress
import json
import math
import os
from pathlib import Path
import secrets
import socket
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
MAX_BODY = 10_000_000


def public_snapshot(state):
    """Lista blanca independiente. Nunca copiar el estado entero a la ruta pública."""
    if state is None:
        return None
    if not isinstance(state, dict) or state.get('version') != 2:
        raise ValueError('Sesión de fase 1 inválida.')
    people = state.get('people')
    if not isinstance(people, list):
        raise ValueError('Concursantes inválidos.')
    by_id = {}
    for p in people:
        if not isinstance(p, dict) or not isinstance(p.get('id'), str) or p['id'] in by_id or not isinstance(p.get('name'), str) or not p['name'].strip():
            raise ValueError('Identidades de concursantes inválidas.')
        age = p.get('age')
        if age is not None and (type(age) is not int or not 1 <= age <= 110):
            raise ValueError('Edad inválida.')
        by_id[p['id']] = p['name']
    k = state.get('teamCount')
    if k is not None and (type(k) is not int or k not in (2, 3, 4)):
        raise ValueError('Cantidad de equipos inválida.')
    names = state.get('teamNames')
    if not isinstance(names, list) or len(names) != (k or 0) or any(not isinstance(n, str) or not n.strip() for n in names):
        raise ValueError('Nombres de equipo inválidos.')
    p = state.get('presentation')
    if not isinstance(p, dict) or p.get('view') not in ('welcome', 'teams') or type(p.get('page')) is not int or p['page'] < 0:
        raise ValueError('Presentación inválida.')
    result = state.get('result')
    teams, draw = [], None
    if result is not None:
        if not isinstance(result, dict) or not isinstance(result.get('teams'), list) or len(result['teams']) != k:
            raise ValueError('Distribución inválida.')
        all_ids = []
        for i, t in enumerate(result['teams']):
            if not isinstance(t, dict) or not isinstance(t.get('members'), list) or any(not isinstance(pid, str) or pid not in by_id for pid in t['members']):
                raise ValueError('Integrantes inválidos.')
            if not t['members'] or len(t['members']) != t.get('capacity'):
                raise ValueError('Cupo inválido.')
            all_ids.extend(t['members'])
            teams.append({'id': f't{i+1}', 'name': names[i], 'members': [by_id[pid] for pid in t['members']]})
        if len(all_ids) != len(by_id) or len(set(all_ids)) != len(all_ids):
            raise ValueError('Hay personas repetidas u omitidas.')
        sizes = [len(t['members']) for t in teams]
        if max(sizes)-min(sizes) > 1:
            raise ValueError('Cupos desequilibrados.')
        started = result.get('startedAt')
        duration = result.get('duration')
        if not isinstance(started, (int, float)) or not math.isfinite(started) or duration not in (0, 2400):
            raise ValueError('Animación inválida.')
        draw = {'token': str(started), 'startedAt': started, 'duration': duration}
    elif state.get('confirmed'):
        raise ValueError('No se puede confirmar sin distribución.')
    return {'version': 2, 'count': len(people), 'teamCount': k, 'confirmed': state.get('confirmed') is True,
            'presentation': {'view': p['view'], 'page': p['page'], 'sound': p.get('sound') is True, 'reducedMotion': p.get('reducedMotion') is True},
            'draw': draw, 'teams': teams}


class Store:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.directory.mkdir(mode=0o700, parents=True, exist_ok=True)
        self.path = self.directory/'session.json'
        key = self.directory/'control.key'
        if key.exists():
            self.code = key.read_text().strip()
        else:
            self.code = secrets.token_hex(8)
            fd = os.open(key, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'w') as f:
                f.write(self.code)
        self.lock = threading.Lock()
        self.state, self.revision = None, 0
        if self.path.exists():
            saved = json.loads(self.path.read_text())
            public_snapshot(saved['state'])
            self.state, self.revision = saved['state'], saved['revision']

    def read(self, public=False):
        with self.lock:
            return {'snapshot' if public else 'state': public_snapshot(self.state) if public else copy.deepcopy(self.state), 'revision': self.revision}

    def write(self, state, revision):
        public_snapshot(state)
        with self.lock:
            if type(revision) is not int or revision != self.revision:
                raise RuntimeError('Otro conductor cambió la sesión. Se recuperará la versión más reciente; vuelve a aplicar tu cambio.')
            saved = {'state': state, 'revision': self.revision+1}
            tmp = self.directory/'session.tmp'
            fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            with os.fdopen(fd, 'w') as f:
                json.dump(saved, f, ensure_ascii=False, allow_nan=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, self.path)
            self.state, self.revision = copy.deepcopy(state), saved['revision']
            return copy.deepcopy(saved)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass  # No registrar enlaces ni códigos de conductor.

    def reply(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, allow_nan=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def authorized(self):
        value = self.headers.get('Authorization', '')
        return hmac.compare_digest(value.encode(), f'Bearer {self.server.store.code}'.encode())

    def allowed_file(self):
        route = unquote(urlsplit(self.path).path)
        parts = Path(route).parts
        if any(p.startswith('.') for p in parts) or '..' in parts:
            return False
        name = route.lstrip('/') or 'index.html'
        return name in ('index.html', 'publico.html', 'estilos.css', 'navidad.css', 'equipos.css', 'escenario.css', 'service-worker.js', 'icon.svg') or (name.startswith(('src/', 'assets/', 'catalogo/')) and not (ROOT/name).is_dir() and (ROOT/name).resolve().is_relative_to(ROOT))

    def do_GET(self):
        route = urlsplit(self.path).path.rstrip('/')
        if route == '/api/status':
            return self.reply({'mode': 'lan', 'publicUrl': self.server.base_url+'/publico.html', 'controlUrl': self.server.base_url+'/index.html'})
        if route == '/api/pairing':
            host = self.headers.get('Host', '').split(':')[0]
            if ipaddress.ip_address(self.client_address[0]).is_loopback and host in ('127.0.0.1', 'localhost'):
                return self.reply({'code': self.server.store.code})
            return self.reply({'error': 'El código solo se muestra en la computadora anfitriona.'}, 403)
        if route == '/api/public':
            return self.reply(self.server.store.read(public=True))
        if route == '/api/session':
            if not self.authorized():
                return self.reply({'error': 'Introduce el código del conductor mostrado en la computadora.'}, 401)
            return self.reply(self.server.store.read())
        if route.startswith('/api') or not self.allowed_file():
            return self.reply({'error': 'Recurso no disponible.'}, 404)
        return super().do_GET()

    def do_HEAD(self):
        if not self.allowed_file():
            return self.reply({'error': 'Recurso no disponible.'}, 404)
        return super().do_HEAD()

    def do_POST(self):
        if urlsplit(self.path).path != '/api/session':
            return self.reply({'error': 'Ruta no disponible.'}, 404)
        if not self.authorized():
            return self.reply({'error': 'Código del conductor inválido.'}, 401)
        origin = self.headers.get('Origin')
        if origin and origin != 'http://'+self.headers.get('Host', ''):
            return self.reply({'error': 'Origen no permitido.'}, 403)
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= MAX_BODY:
                return self.reply({'error': 'Tamaño de archivo inválido (máximo 10 MB).'}, 413)
            data = json.loads(self.rfile.read(size))
            result = self.server.store.write(data['state'], data['revision'])
            return self.reply(result)
        except RuntimeError as err:
            return self.reply({'error': str(err)}, 409)
        except (ValueError, KeyError, TypeError, AttributeError) as err:
            return self.reply({'error': 'Sesión inválida: '+str(err)}, 400)
        except OSError:
            return self.reply({'error': 'No se pudo guardar en la computadora. Libera espacio antes de reintentar.'}, 507)


def lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('192.0.2.1', 1))  # Consulta la ruta local, sin enviar datos a Internet.
            return s.getsockname()[0]
    except OSError:
        return 'IP-DE-TU-COMPUTADORA'


def make_server(host='0.0.0.0', port=8080, data_dir=None, advertised_host=None):
    server = ThreadingHTTPServer((host, port), Handler)
    server.daemon_threads = True
    server.store = Store(data_dir or ROOT/'.datos-locales')
    server.base_url = f'http://{advertised_host or lan_ip()}:{server.server_port}'
    return server


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--data-dir', type=Path)
    parser.add_argument('--ip', help='IP que se mostrará en los enlaces, si la detección no corresponde a tu Wi-Fi')
    args = parser.parse_args()
    server = make_server(args.host, args.port, args.data_dir, args.ip)
    print(f'Computadora: http://127.0.0.1:{server.server_port}/index.html', flush=True)
    print(f'Celular:     {server.base_url}/index.html', flush=True)
    print(f'TV:          {server.base_url}/publico.html', flush=True)
    print('El código privado de control se muestra en el panel de la computadora.', flush=True)
    print('Misma Wi-Fi. Mantén esta terminal abierta. Ctrl+C para detener.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
