"""Contrato LAN de Duelo, repetición y premiación. Las respuestas nunca se proyectan."""
import json
from biblioteca_validacion import require


def scores(e):
    return {t['id']: sum(m['amount'] for m in e['ledger'] if m['status'] == 'active' and m['teamId'] == t['id']) for t in e['teams']}


def rankings(e):
    values = scores(e)
    distinct = sorted(set(values.values()), reverse=True)
    return [dict(id=t['id'], name=t['name'], score=values[t['id']], place=distinct.index(values[t['id']])+1 if e['settings']['ranking'] == 'dense' else 1+sum(v > values[t['id']] for v in values.values())) for t in e['teams']]


def summary(e):
    return [dict(number=r['number'], name=r['game']['name'], status=r['status'], points={t['id']: sum(m['amount'] for m in e['ledger'] if m['status'] == 'active' and m['roundId'] == r['id'] and m['teamId'] == t['id']) for t in e['teams']}) for r in e['rounds']]


def signature(e):
    return json.dumps([[m['id'], m['status'], m['amount']] for m in e['ledger']], separators=(',', ':'), ensure_ascii=False)


def scheduled(e):
    rule = e['settings'].get('repeat')
    if not rule or not rule['enabled'] or e['phase'] not in ['teams_confirmed', 'next_round'] or not any(g['id'] == 'roba-y-gana' for g in e['selectedGames']):
        return False
    values = sorted(scores(e).values(), reverse=True)
    last = next((i for i in reversed(range(len(e['rounds']))) if e['rounds'][i]['game']['id'] == 'roba-y-gana'), -1)
    return values[0]-values[1] >= rule['lead'] and len(e['rounds'])-last-1 >= rule['cooldown']


def validate_duel_movement(e, m):
    a = next((a for a in e.get('duel', {}).get('attempts', []) if a['id'] == m['batchId']), None)
    require(e['settings'].get('closureVersion') == 1 and a and a['status'] == 'correct' and m['id'] == a['movementId'] and m['eventId'] == e['id'] and m['teamId'] == a['teamId'] and m['roundId'] is None and m['amount'] == 10 and m['status'] == 'active' and m['correctionOf'] is None, 'Movimiento de Duelo inválido.')


def validate_closure(e):
    if e['settings'].get('closureVersion') != 1:
        return
    d = e['duel']
    require(d['version'] == 1 and len({q['id'] for q in d['bank']}) == len(d['bank']), 'Banco de Duelo inválido.')
    qs = {q['id'] for q in d['bank']}
    require(len(d['used']) == len(set(d['used'])) and all(q in qs for q in d['used']), 'Preguntas repetidas.')
    require(len({a['id'] for a in d['attempts']}) == len(d['attempts']), 'Intentos duplicados.')
    for a in d['attempts']:
        require(a['questionId'] in d['used'] and a['status'] in ['passed', 'correct'], 'Intento inválido.')
        if a['status'] == 'correct':
            require(any(t['id'] == a['teamId'] and a['personId'] in t['members'] for t in e['teams']), 'Representante ajeno al equipo.')
            require(sum(m.get('kind') == 'duel' and m['id'] == a['movementId'] and m['batchId'] == a['id'] and m['amount'] == 10 for m in e['ledger']) == 1, 'Premio duplicado o inexistente.')
    if d['current']:
        require(d['current']['questionId'] in d['used'] and all(a['id'] != d['current']['id'] for a in d['attempts']), 'Pregunta activa inválida.')
    for tid, pid in d['pending'].items():
        require(any(t['id'] == tid and pid in t['members'] for t in e['teams']), 'Representante inválido.')
    attempted = [a['questionId'] for a in d['attempts']] + ([d['current']['questionId']] if d['current'] else [])
    require(len(attempted) == len(set(attempted)) == len(d['used']), 'Pregunta premiada dos veces.')
    rule = e['settings']['repeat']
    require(type(rule['enabled']) is bool and type(rule['lead']) is int and 25 <= rule['lead'] <= 10000 and type(rule['cooldown']) is int and 1 <= rule['cooldown'] <= 20, 'Parámetros de repetición inválidos.')
    a = e.get('awards')
    if a and a['status'] == 'presenting': require(e['phase'] == 'awards', 'Ceremonia activa fuera de etapa.')
    if e['phase'] == 'awards' or a and a['status'] == 'finished':
        require(a and a['places'] == sorted(set(r['place'] for r in a['rows']), reverse=True) and type(a['index']) is int and a['signature'] == signature(e) and a['summary'] == summary(e) and a['rows'] == rankings(e) and -1 <= a['index'] < len(a['places']), 'Premiación inconsistente.')
        if a['status'] == 'finished': require(e['phase'] == 'event_finished' and a['index'] == len(a['places'])-1, 'Premiación incompleta.')


def public_closure(e):
    if e['settings'].get('closureVersion') != 1:
        return {}
    d, a = e['duel'], e.get('awards')
    q = next((q for q in d['bank'] if d['current'] and q['id'] == d['current']['questionId']), None)
    return {'duel': dict(id=d['current']['id'], generation=q['generation'], question=q['question']) if q else None, 'automaticReward': scheduled(e) or any(r['id'] == e['activeRoundId'] and r.get('scheduledReward') is True for r in e['rounds']),
            'awards': dict(id=a['id'], status=a['status'], index=a['index'], place=a['places'][a['index']] if a['index'] >= 0 else None, stageAt=a['stageAt'], rows=a['rows'], summary=a['summary']) if a else None}
