"""Importes configurables con seis identidades inmutables por aparición."""
from biblioteca_validacion import require
DEFAULT_REWARDS = dict(giftA=100, giftB=75, stealA=50, stealB=25, challengeA=100, challengeB=50)
SLOTS = list(DEFAULT_REWARDS)


def validate_amounts(a, limits):
    require(isinstance(a, dict) and set(a) == set(SLOTS) and all(type(a[k]) is int and 1 <= a[k] <= limits['max'] for k in SLOTS), 'Importes configurables inválidos.')
    require(a['stealA']+a['stealB'] <= -limits['min'], 'Los robos superan el descuento máximo aprobado.')


def validate_deck(f, g):
    validate_amounts(f['rewardAmounts'], g['scoring'])
    cards = f['rewardCards']
    require(f['rewardSchema'] == 1 and len(cards) == 6 and {c.get('slot') for c in cards} == set(SLOTS), 'Identidades de premios inválidas.')
    for c in cards:
        i = SLOTS.index(c['slot'])
        require(c['kind'] == ('gift' if i < 2 else 'steal' if i < 4 else 'challenge') and c['amount'] == f['rewardAmounts'][c['slot']] and c.get('challengeIndex') == (i-4 if i >= 4 else None), 'Tarjeta distinta al importe congelado.')


def challenge_index(c):
    return c.get('challengeIndex', 0 if c['amount'] == 100 else 1)
