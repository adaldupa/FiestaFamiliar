"""Validación y proyección LAN de motores definitivos; no expone bancos ni objetivos."""
import math
from biblioteca_validacion import require


def integer(n): return type(n) is int and n >= 0

def finite(n): return type(n) in (int, float) and math.isfinite(n)


def calculate(e, r):
    f = r['full']
    eligible = [t for t in e['teams'] if r['representatives'][t['id']] is not None]
    if f['mode'] == 'special':
        balances = {t['id']: sum(m['amount'] for m in e['ledger'] if m['status'] == 'active' and m['teamId'] == t['id'] and m['roundId'] != r['id']) for t in e['teams']}
        before = dict(balances)
        for t in eligible:
            c = f['rewardCards'][f['choices'][t['id']]]
            if c['kind'] == 'gift' or c['kind'] == 'challenge' and f['rewardDecisions'][t['id']]['success']:
                balances[t['id']] += c['amount']
        for t in eligible:
            c = f['rewardCards'][f['choices'][t['id']]]
            if c['kind'] == 'steal':
                target = f['rewardDecisions'][t['id']]['targetId']
                require(target in balances and target != t['id'], 'Víctima inválida.')
                amount = min(c['amount'], max(0, balances[target]))
                balances[target] -= amount
                balances[t['id']] += amount
        return {tid: balances[tid]-before[tid] for tid in balances}
    values = {}
    for t in eligible:
        tid = t['id']
        if f['mode'] == 'closeness':
            values[tid] = abs(f['estimates'][tid]-f['target'])
        elif f['mode'] == 'hits':
            n = f['results'][tid]['hits']
            if n > 0: values[tid] = -n
        elif f['results'].get(tid, {}).get('completed'):
            values[tid] = f['results'][tid]['ms']
    return {t['id']: [100, 75, 50, 25][sum(v < values[t['id']] for v in values.values())] if t['id'] in values else 0 for t in e['teams']}


def validate_full(e, r):
    f, g = r['full'], r['game']
    tids = {t['id'] for t in e['teams']}
    require(g.get('executionVersion') == 1 and f['version'] == 1 and f['mode'] == g['scoring']['mode'], 'Motor definitivo inválido.')
    cards = {c['id']: c for c in g['cards']}
    used = f['usedCards']
    require(len(used) == len(set(used)) and all(x.startswith(g['id']+':') and x[len(g['id'])+1:] in cards for x in used), 'Tarjetas usadas inválidas.')
    require(len(f['deck']) == len({c['id'] for c in f['deck']}) and all(cards.get(c['id']) == c and g['id']+':'+c['id'] not in used for c in f['deck']), 'Banco adulterado.')
    for tid, c in f['cards'].items():
        require(tid in tids and (c is None or cards.get(c['id']) == c and g['id']+':'+c['id'] in used), 'Tarjeta activa inválida.')
    clock = f['clock']
    require(clock['durationMs'] == (g['seconds'] if g['seconds'] is not None else 3600)*1000 and finite(clock['remainingMs']) and 0 <= clock['remainingMs'] <= clock['durationMs'] and clock['status'] in ['idle', 'running', 'paused', 'finished'], 'Reloj inválido.')
    require(finite(f['elapsedMs']) and f['elapsedMs'] >= 0 and (finite(clock['deadline']) and finite(f['startedAt']) if clock['status'] == 'running' else clock['deadline'] is None), 'Referencia temporal inválida.')
    require(len(f['logs']) == len({x['id'] for x in f['logs']}) == len({x['cardId'] for x in f['logs']}) and all(x['teamId'] in tids and x['cardId'] in cards and x['action'] in ['correct', 'pass', 'infraction'] for x in f['logs']), 'Registro de aciertos inválido.')
    for tid, v in f['results'].items():
        require(tid in tids and type(v['completed']) is bool and (v['ms'] is None or integer(v['ms'])) and integer(v['hits']), 'Resultado inválido.')
    require(f['target'] is None or integer(f['target']), 'Objetivo inválido.')
    require(all(tid in tids and integer(v) for tid, v in f['estimates'].items()), 'Estimaciones inválidas.')
    expected = {('gift', 100), ('gift', 75), ('steal', 50), ('steal', 25), ('challenge', 100), ('challenge', 50)}
    require(len(f['rewardCards']) == 6 and {(c['kind'], c['amount']) for c in f['rewardCards']} == expected, 'Premios inválidos.')
    require(len(f['choices']) == len(set(f['choices'].values())) and all(tid in tids and integer(n) and n < 6 for tid, n in f['choices'].items()), 'Elecciones inválidas.')
    for tid, d in f['rewardDecisions'].items():
        require(tid in tids and tid in f['choices'], 'Decisión de premio inválida.')
        card = f['rewardCards'][f['choices'][tid]]
        require(d.get('targetId') in tids and d['targetId'] != tid if card['kind'] == 'steal' else card['kind'] == 'challenge' and type(d.get('success')) is bool, 'Resolución inválida.')
    if f['revealed']:
        require(all(r['representatives'][t['id']] is None or t['id'] in f['choices'] for t in e['teams']), 'Revelación anticipada.')
    if e['activeRoundId'] == r['id'] and e['phase'] in ['timer_active', 'timer_paused']:
        require(clock['status'] == ('running' if e['phase'] == 'timer_active' else 'paused'), 'Fase y reloj distintos.')
    if r.get('status') == 'completed':
        active = next((a for a in r['attempts'] if a['status'] == 'active'), None)
        require(active is not None and {tid: row['points'] for tid, row in active['outcomes'].items()} == calculate(e, r), 'Asignación distinta al cálculo definitivo.')
    if r.get('draft'):
        require({tid: row['points'] for tid, row in r['draft']['outcomes'].items()} == calculate(e, r), 'Cálculo adulterado.')


def public_full(r):
    f = r['full']
    return {'simultaneous': f['simultaneous'], 'unlimited': r['game'].get('unlimited') is True,
            'progress': [{'teamId': t['teamId'], 'hits': t.get('bounces', 0) if r['game']['id'] == 'rebote-imposible' else None, 'completed': f['results'].get(t['teamId'], {}).get('completed') is True} for t in r['turns']],
            'rewards': [dict(index=i, kind=c['kind'], amount=c['amount'], teamId=next((tid for tid, index in f['choices'].items() if index == i), None), challenge=f['challenges'][0 if c['amount'] == 100 else 1] if c['kind'] == 'challenge' else None) for i, c in enumerate(f['rewardCards'])] if f['revealed'] else None}
