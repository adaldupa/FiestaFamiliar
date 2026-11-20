"""Validación privada de biblioteca al guardar por LAN; nunca produce un DTO público."""
from datetime import datetime
import math


def require(ok, message):
    if not ok:
        raise ValueError(message)


def text(value, limit=5000):
    return isinstance(value, str) and 0 < len(value.strip()) <= limit


def date(value):
    if not text(value, 80):
        return False
    try:
        datetime.fromisoformat(value.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False


def game(g):
    require(isinstance(g, dict) and text(g.get('id'), 120) and type(g.get('ruleVersion')) is int and g['ruleVersion'] > 0, 'ID o versión de ficha inválidos.')
    for k in ['name', 'description', 'category', 'mode', 'publicRules', 'privateInstructions', 'victory', 'tie', 'noFinish', 'accessibility']:
        require(text(g.get(k)), 'Texto de ficha inválido: '+k)
    require(g.get('status') in ['active', 'inactive', 'archived'], 'Estado de ficha inválido.')
    require(type(g.get('minParticipants')) is int and type(g.get('maxParticipants')) is int and 1 <= g['minParticipants'] <= g['maxParticipants'] <= 10000, 'Participantes de ficha inválidos.')
    seconds = g.get('seconds')
    pending = g.get('pending', [])
    require(type(seconds) is int and 1 <= seconds <= 3600 or seconds is None and g.get('executionVersion') == 1 and g.get('unlimited') is True or seconds is None and g.get('implementation') == 'planned' and isinstance(pending, list) and len(pending) > 0, 'Duración de ficha inválida.')
    require(type(g.get('representativesBefore')) is bool, 'Modalidad de representantes inválida.')
    require(isinstance(g.get('materials'), list), 'Materiales inválidos.')
    for m in g['materials']:
        require(isinstance(m, dict) and text(m.get('name'), 200) and text(m.get('unit'), 80) and type(m.get('quantity')) in [int, float] and math.isfinite(m['quantity']) and m['quantity'] >= 0, 'Material inválido.')
    require(isinstance(g.get('secrets'), list) and all(text(v) for v in g['secrets']), 'Tarjetas privadas inválidas.')
    require(date(g.get('createdAt')) and date(g.get('updatedAt')), 'Fecha de ficha inválida.')
    p = g.get('scoring')
    require(isinstance(p, dict) and p.get('mode') in ['fixed', 'position', 'hits', 'closeness', 'manual', 'special'] and p.get('decision') == 'proposal', 'Puntuación de ficha inválida.')
    for k in ['nominal', 'min', 'max', 'pointsPerSuccess']:
        require(type(p.get(k)) is int, 'Los puntos deben ser enteros.')
    require(p['nominal'] == 100 and -10000 <= p['min'] <= 0 <= p['max'] <= 10000 and p['min'] <= p['pointsPerSuccess'] <= p['max'], 'Límites de puntos inválidos.')
    require(type(p.get('approvedException')) is bool and (not (p['min'] < 0 or p['max'] > 100 or p['pointsPerSuccess'] > 100) or p['approvedException']), 'Excepción sin aprobación.')
    if 'positions' in p:
        require(isinstance(p['positions'], list) and 2 <= len(p['positions']) <= 4 and all(type(v) is int and p['min'] <= v <= p['max'] for v in p['positions']), 'Posiciones inválidas.')
    if 'pointsPerHit' in p:
        require(type(p['pointsPerHit']) is int and 0 <= p['pointsPerHit'] <= p['max'], 'Puntos por acierto inválidos.')
    if 'target' in p:
        require(type(p['target']) in [int, float] and math.isfinite(p['target']), 'Objetivo de cercanía inválido.')
    for k in ['steps', 'pending']:
        if k in g:
            require(isinstance(g[k], list) and all(text(v) for v in g[k]), 'Pasos o pendientes inválidos.')
    if 'preparation' in g:
        require(text(g['preparation']), 'Preparación inválida.')
    for k in ['repeatable', 'permanent']:
        if k in g:
            require(type(g[k]) is bool, 'Metadatos de ficha inválidos.')
    if 'implementation' in g:
        require(g['implementation'] in ['turns', 'planned'], 'Disponibilidad inválida.')
    if 'executionVersion' in g:
        require(g['executionVersion'] == 1 and g.get('executionMode') in ['turns', 'simultaneous'] and isinstance(g.get('cards'), list), 'Contrato definitivo inválido.')
        require(len(g['cards']) == len({c['id'] for c in g['cards']}) and all(text(c.get('id'), 120) and text(c.get('text') or c.get('target')) and ('forbidden' not in c or len(c['forbidden']) == len(set(c['forbidden'])) == 3) for c in g['cards']), 'Banco definitivo inválido.')
    if g.get('executionVersion') == 1 and g['id'] == 'palabras-prohibidas':
        require(all(text(c.get('target')) and isinstance(c.get('forbidden'), list) and len(c['forbidden']) == 3 and all(text(w) for w in c['forbidden']) for c in g['cards']), 'Tarjeta de Palabras prohibidas incompleta.')
    if g['id'] == 'roba-y-gana' or g.get('permanent') is True:
        require(g.get('permanent') is True and g.get('repeatable') is True and g['status'] != 'archived', 'Juego permanente inválido.')


def validate_library(lib):
    require(isinstance(lib, dict) and lib.get('schemaVersion') == 1 and isinstance(lib.get('games'), list) and 1 <= len(lib['games']) <= 1000 and isinstance(lib.get('versions'), list) and len(lib['versions']) <= 10000, 'Biblioteca inválida.')
    versions, ids = {}, set()
    for g in lib['versions']:
        game(g)
        key = (g['id'], g['ruleVersion'])
        require(key not in versions, 'Versión repetida.')
        versions[key] = g
    for g in lib['games']:
        game(g)
        require(g['id'] not in ids and versions.get((g['id'], g['ruleVersion'])) == g, 'Ficha duplicada o revisión ausente.')
        ids.add(g['id'])
    require(all(g['id'] in ids for g in lib['versions']), 'Versión huérfana.')
    collections = lib.get('collections', [])
    require(isinstance(collections, list) and len(collections) <= 1000, 'Colecciones inválidas.')
    collection_ids = set()
    for c in collections:
        require(isinstance(c, dict) and text(c.get('id'), 120) and c['id'] not in collection_ids and text(c.get('name'), 120) and isinstance(c.get('games'), list) and c['games'] and date(c.get('createdAt')) and date(c.get('updatedAt')), 'Colección inválida.')
        collection_ids.add(c['id'])
        refs = set()
        for ref in c['games']:
            require(isinstance(ref, dict) and type(ref.get('ruleVersion')) is int and text(ref.get('id'), 120) and ref['id'] not in refs and (ref['id'], ref['ruleVersion']) in versions, 'Referencia de colección inválida.')
            refs.add(ref['id'])
    audit = lib.get('audit', [])
    require(isinstance(audit, list) and len(audit) <= 20000, 'Auditoría inválida.')
    audit_ids = set()
    for a in audit:
        require(isinstance(a, dict) and text(a.get('id'), 120) and a['id'] not in audit_ids and text(a.get('type'), 120) and date(a.get('at')) and isinstance(a.get('detail'), dict), 'Registro de auditoría inválido.')
        audit_ids.add(a['id'])
