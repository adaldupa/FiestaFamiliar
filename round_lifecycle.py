"""Ciclo 2C.1: validación y proyección públicas independientes del código JS."""
from biblioteca_validacion import game as validate_game, require, date

ENGINES = {
    'fixed': ('fixed-turns', True, 'Puntos fijos por éxito'),
    'manual': ('manual-turns', True, 'Captura manual por turnos'),
    'position': ('position', False, 'Clasificación por posición'),
    'hits': ('count', False, 'Clasificación por cantidad de aciertos'),
    'closeness': ('closeness', False, 'Clasificación por cercanía'),
    'special': ('direct-awards', False, 'Premios directos y transferencias'),
}


def engine_for(g):
    mode = g['scoring']['mode']
    key, ready, label = ENGINES[mode]
    operational = (ready or g.get('executionVersion') == 1) and g.get('implementation') != 'planned'
    return {'key': key, 'mode': mode, 'operational': operational, 'label': label,
            'message': 'Motor operativo' if operational else 'Motor pendiente de integración'}


def lifecycle_at(e):
    phase = e['phase']
    if phase == 'selecting_game':
        return 'spinning'
    if phase == 'game_selected':
        return 'selected'
    if phase in ['selecting_representatives', 'presenting_rules', 'preparing_challenge']:
        return 'instructions'
    if phase in ['timer_active', 'timer_paused', 'engine_pending']:
        return 'execution'
    if phase in ['capturing_results', 'confirming_score']:
        return 'validation'
    if phase in ['scoreboard_updated', 'round_finished']:
        return 'finished'
    return 'preparation'


def screen_at(e):
    if e['phase'] == 'awards' or (e.get('awards') or {}).get('status') == 'finished': return 'awards'
    if e.get('duel', {}).get('current'): return 'duel'
    if e.get('publicScreen') == 'standings':
        return 'standings'
    return {'preparation': 'waiting', 'spinning': 'wheel', 'selected': 'selected', 'instructions': 'instructions',
            'execution': 'execution', 'validation': 'validation', 'finished': 'results'}[lifecycle_at(e)]


def eligible(e, lib):
    current = {g['id']: g for g in lib['games']}
    completed = {r['game']['id'] for r in e['rounds'] if r['status'] == 'completed' or r['attempts']}
    skipped = {r['game']['id'] for r in e['rounds'] if r['status'] == 'skipped' and not r['restoredAt']}
    result = []
    for g in e['selectedGames']:
        permanent = g['id'] == 'roba-y-gana'
        c = current.get(g['id'])
        if (g['status'] == 'active' or permanent) and c and (c['status'] == 'active' or permanent) and (permanent or g['id'] not in skipped) and (g['id'] not in completed or g.get('repeatable') or permanent or any(x['gameId'] == g['id'] and not x['usedBy'] for x in e['replays'])):
            result.append(g)
    return result


def public_result(e, r):
    if r is None:
        return None
    attempt = next((a for a in r['attempts'] if a['status'] == 'active'), None)
    rows = []
    for t in e['teams']:
        tid = t['id']
        points = attempt['outcomes'][tid]['points'] if attempt else None
        row = {'teamId': tid, 'points': points}
        if attempt and 'full' in r:
            f = r['full']
            row.update(place=None if f['mode'] == 'special' or points == 0 else 1+sum(n > points for n in f['scoreOverride']['points'].values()) if f.get('scoreOverride') else 5-points//25,
                       elapsedMs=f['results'].get(tid, {}).get('ms') if f['mode'] == 'position' else None,
                       hits=f['results'].get(tid, {}).get('hits', 0) if f['mode'] == 'hits' else None,
                       difference=abs(f['estimates'][tid]-f['target']) if f['mode'] == 'closeness' and tid in f['estimates'] else None)
        rows.append(row)
    return {'status': 'confirmed' if r['status'] == 'completed' else 'unscored' if r['status'] == 'skipped' else 'pending', 'rows': rows}


def validate_modern(e):
    require(type(e['settings'].get('lifecycleVersion')) is int and e['settings']['lifecycleVersion'] == 1, 'Versión de ciclo inválida.')
    archive = e.get('ruleSnapshots')
    require(isinstance(archive, list) and len(archive) > 0, 'Faltan reglas congeladas del evento.')
    for g in archive:
        validate_game(g)
    require(e.get('publicScreen', 'auto') in ['auto', 'standings'], 'Pantalla pública inválida.')
    for r in e['rounds']:
        ref = r.get('ruleRef')
        require(isinstance(ref, dict) and ref.get('id') == r['game']['id'] and ref.get('ruleVersion') == r['game']['ruleVersion'] and type(ref.get('eventSnapshot')) is int and 0 <= ref['eventSnapshot'] < len(archive) and archive[ref['eventSnapshot']] == r['game'], 'Referencia de versión de ronda inválida.')
        if 'full' in r:
            from full_engines import validate_full
            validate_full(e, r)
        engine = engine_for(r['game'])
        if 'engine' in r:
            require(r['engine'] == engine, 'Descriptor de motor inválido.')
        if not engine['operational']:
            require(not r['attempts'] and r['draft'] is None and r['currentTeamId'] is None and r['status'] != 'completed', 'Un motor pendiente no permite puntuar.')
            for t in r['turns']:
                require(t['timer'] is None and t['outcome'] is None and t['secretIndex'] is None, 'Un motor pendiente no permite cronómetros o resultados ficticios.')
        if r.get('closure') == 'unscored':
            require(r['status'] == 'skipped' and r['attempts'] == [] and date(r.get('closedAt')) and r.get('skipReason'), 'Cierre sin resultados inválido.')
    used = [c for r in e['rounds'] for c in r.get('full', {}).get('usedCards', [])]
    require(len(used) == len(set(used)), 'Tarjetas repetidas en el evento.')
    active = next((r for r in e['rounds'] if r['id'] == e['activeRoundId']), None)
    if e['phase'] in ['game_selected', 'engine_pending', 'round_finished']:
        require(active is not None, 'La fase necesita una ronda vigente.')
    if e['phase'] == 'engine_pending':
        require(not engine_for(active['game'])['operational'] and active.get('execution', {}).get('status') == 'pending', 'Ejecución pendiente inválida.')
    if e['phase'] == 'round_finished':
        require(active.get('closure') == 'unscored', 'Falta el cierre explícito de la ronda.')
