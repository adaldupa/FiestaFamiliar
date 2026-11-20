from closure_public import validate_closure, validate_duel_movement, public_closure, scheduled
"""Proyección independiente de fase 2A. No importar código de cliente ni copiar secretos."""
import math
from round_lifecycle import engine_for, lifecycle_at, screen_at, eligible, public_result, validate_modern

PHASES = {'awards', 'game_selected', 'engine_pending', 'round_finished', 'preparation', 'teams_confirmed', 'selecting_game', 'selecting_representatives', 'presenting_rules', 'preparing_challenge', 'timer_active', 'timer_paused', 'capturing_results', 'confirming_score', 'scoreboard_updated', 'next_round', 'event_finished'}


def text(value, limit=5000):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise ValueError('Texto de concurso inválido.')
    return value


def integer(value, low=-10000, high=10000):
    if type(value) is not int or not low <= value <= high:
        raise ValueError('Número de concurso inválido.')
    return value


def finite(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError('Referencia temporal inválida.')
    return value


def public_game(g, modern=False):
    from presentation_copy import COPY
    g = dict(g, **COPY.get(g['id'], {}))
    scoring = g['scoring']
    dto = {'id': text(g['id'], 120), 'name': text(g['name']), 'mode': text(g['mode']), 'publicRules': text(g['publicRules']),
            'materials': [{'name': text(m['name'], 200), 'quantity': finite(m['quantity']), 'unit': text(m['unit'], 80)} for m in g['materials']],
            'seconds': None if modern and g['seconds'] is None else integer(g['seconds'], 1, 3600),
            'scoring': {'mode': text(scoring['mode'], 80), 'pointsPerSuccess': integer(scoring['pointsPerSuccess']), 'min': integer(scoring['min']), 'max': integer(scoring['max']), 'decision': 'proposal'},
            'victory': text(g['victory']), 'tie': text(g['tie']), 'noFinish': text(g['noFinish']), 'accessibility': text(g['accessibility']), 'ruleVersion': integer(g['ruleVersion'], 1, 1000000)}
    if modern:
        dto.update({'preparation': g.get('preparation', 'Preparar materiales y explicar las reglas.'), 'steps': list(g.get('steps', [])), 'positions': list(g['scoring']['positions']) if 'positions' in g['scoring'] else None})
    return dto


def public_timer(t):
    if t is None:
        return None
    if t['status'] not in ('idle', 'running', 'paused', 'finished'):
        raise ValueError('Estado de reloj inválido.')
    duration, remaining = finite(t['durationMs']), finite(t['remainingMs'])
    if not 1000 <= duration <= 3600000 or not 0 <= remaining <= duration:
        raise ValueError('Duración inválida.')
    deadline = finite(t['deadline']) if t['status'] == 'running' else None
    return {'durationMs': duration, 'remainingMs': remaining, 'deadline': deadline, 'status': t['status']}


def contest_public_snapshot(c):
    if not isinstance(c, dict) or c.get('schemaVersion') != 1 or not isinstance(c.get('events'), list):
        raise ValueError('Concurso inválido.')
    events = c['events']
    for event in events:
        validate_closure(event)
        if event.get('settings', {}).get('lifecycleVersion') == 1:
            validate_modern(event)
        for game in event.get('selectedGames', []):
            if event.get('settings', {}).get('lifecycleVersion') != 1 and (game.get('scoring', {}).get('mode') not in ('fixed', 'manual') or game.get('implementation') == 'planned'):
                raise ValueError('El evento contiene una dinámica aún no implementada.')
    ids = [text(e['id'], 120) for e in events]
    if len(set(ids)) != len(ids):
        raise ValueError('Eventos duplicados.')
    if c['activeEventId'] is None:
        return None
    e = next((e for e in events if e['id'] == c['activeEventId']), None)
    if e is None or e['phase'] not in PHASES or e['status'] not in ('preparation', 'in_progress', 'finished'):
        raise ValueError('Evento activo inválido.')
    modern = e.get('settings', {}).get('lifecycleVersion') == 1
    people = {text(p['id'], 120): text(p['name'], 120) for p in e['people']}
    if len(people) != len(e['people']):
        raise ValueError('Identidades duplicadas.')
    teams = e['teams']
    team_ids = [text(t['id'], 120) for t in teams]
    assigned = [pid for t in teams for pid in t['members']]
    if len(teams) not in (2, 3, 4) or len(set(team_ids)) != len(team_ids) or len(assigned) != len(people) or set(assigned) != set(people):
        raise ValueError('Equipos de concurso inválidos.')
    rounds = e['rounds']
    round_ids = [text(r['id'], 120) for r in rounds]
    if len(set(round_ids)) != len(round_ids):
        raise ValueError('Rondas duplicadas.')
    r = next((r for r in rounds if r['id'] == e['activeRoundId']), None)
    if e['activeRoundId'] is not None and r is None:
        raise ValueError('La ronda activa no existe.')
    points = dict.fromkeys(team_ids, 0)
    movement_ids, tuples = set(), set()
    for m in e['ledger']:
        if m.get('kind') == 'duel':
            validate_duel_movement(e, m)
            require_unique = m['id'] not in movement_ids
            if not require_unique: raise ValueError('Movimiento duplicado.')
            movement_ids.add(m['id'])
            points[m['teamId']] += m['amount']
            continue
        mid = text(m['id'], 120)
        key = (m['batchId'], m['teamId'])
        if mid in movement_ids or key in tuples or m['eventId'] != e['id'] or m['roundId'] not in round_ids or m['teamId'] not in points or m['status'] not in ('active', 'voided'):
            raise ValueError('Movimiento de puntos inválido o duplicado.')
        movement_ids.add(mid)
        tuples.add(key)
        amount = integer(m['amount'])
        round_record = next(x for x in rounds if x['id'] == m['roundId'])
        attempt = next((a for a in round_record['attempts'] if a['id'] == m['batchId']), None)
        if attempt is None or attempt['status'] != m['status'] or attempt['outcomes'][m['teamId']]['points'] != amount or mid not in attempt['movementIds']:
            raise ValueError('Puntos ajenos a una confirmación.')
        limits = round_record['game']['scoring']
        if not limits['min'] <= amount <= limits['max']:
            raise ValueError('Puntos fuera de los límites acordados.')
        if m['status'] == 'active':
            points[m['teamId']] += amount
    unique_scores = sorted(set(points.values()), reverse=True)
    ranked = []
    for t in teams:
        representative = None
        if r and r['representativesConfirmed'] and r['representatives'][t['id']] is not None:
            pid = r['representatives'][t['id']]
            if pid not in t['members']:
                raise ValueError('Representante ajeno a su equipo.')
            representative = ' y '.join(people[x] for x in r.get('full', {}).get('pairs', {}).get(t['id'], [pid]))
        score = points[t['id']]
        place = unique_scores.index(score)+1 if e['settings']['ranking'] == 'dense' else 1+sum(n > score for n in points.values())
        ranked.append({'id': t['id'], 'name': text(t['name'], 80), 'score': score, 'place': place, 'members': [people[pid] for pid in t['members']], 'representative': representative})
    completed = {x['game']['id'] for x in rounds if x['status'] == 'completed' or x['attempts']}
    skipped = {x['game']['id'] for x in rounds if x['status'] == 'skipped' and not x['restoredAt']}
    available = [g for g in e['selectedGames'] if g['status'] == 'active' and g['id'] not in skipped and (g['id'] not in completed or any(a['gameId'] == g['id'] and not a['usedBy'] for a in e['replays']))]
    if modern:
        available = eligible(e, c['library'])
        if scheduled(e): available = [g for g in available if g['id'] == 'roba-y-gana']
    turn = next((t for t in r['turns'] if t['teamId'] == r['currentTeamId']), None) if r else None
    hidden = r and r['game']['representativesBefore'] and not r['representativesConfirmed']
    game = r['game'] if r and not hidden else None
    wheel = None
    if game and r['draw']['startedAt'] is not None and e['phase'] == 'selecting_game':
        d = r['draw']
        choices = {g['id']: g['name'] for g in e['selectedGames']}
        index = integer(d['selectedIndex'], 0, len(d['ids'])-1)
        if d['selectedId'] != d['ids'][index] or d['selectedId'] != game['id']:
            raise ValueError('Resultado de ruleta inconsistente.')
        rotation = finite(d['rotation'])
        expected = 2160 + (360-(index+.5)*360/len(d['ids'])) % 360
        if abs(rotation-expected) > 1e-8:
            raise ValueError('La animación no corresponde al juego seleccionado.')
        wheel = {'candidates': [{'id': text(gid, 120), 'title': text(choices[gid])} for gid in d['ids']], 'selectedId': text(d['selectedId'], 120), 'selectedIndex': index, 'rotation': rotation, 'startedAt': finite(d['startedAt']), 'duration': integer(d['duration'], 0, 2400)}
    dto = {'schemaVersion': 1, 'eventId': e['id'], 'eventName': text(e['name'], 120), 'status': e['status'], 'phase': e['phase'], 'roundNumber': r['number'] if r else len(rounds), 'availableCount': len(available), 'teams': ranked,
            'activeTeamId': turn['teamId'] if turn else None, 'timer': None if hidden else public_timer(r['full']['clock']) if r and 'full' in r else public_timer(turn['timer']) if turn else None, 'wheel': wheel, 'game': public_game(game, modern) if game else None}
    if modern:
        engine = engine_for(r['game']) if r and not hidden else None
        dto.update({'lifecycle': lifecycle_at(e), 'screen': screen_at(e), 'roundId': r['id'] if r else None, 'engine': {'key': engine['key'], 'operational': engine['operational'], 'message': engine['message']} if engine else None, 'result': public_result(e, r)})
    if r and 'full' in r and not hidden:
        from full_engines import public_full
        dto['execution'] = public_full(r, e['phase'])
        if r['game'].get('unlimited'):
            dto['timer'].update(unlimited=True, elapsedMs=r['full']['elapsedMs'], startedAt=r['full']['startedAt'])
    dto.update(public_closure(e))
    return dto
