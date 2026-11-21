import unittest
from full_engines import calculate


class ConfiguredPositions(unittest.TestCase):
    def test_configured_points_keep_competition_ties_and_zero_for_noncompletion(self):
        tids = ['t1', 't2', 't3', 't4']
        event = {'teams': [{'id': tid} for tid in tids]}
        round_ = {
            'representatives': {tid: 'person-'+tid for tid in tids},
            'game': {'scoring': {'positions': [80, 60, 40, 20]}},
            'full': {'mode': 'position', 'results': {
                tid: {'completed': tid != 't4', 'ms': 2000 if tid == 't3' else 1000}
                for tid in tids
            }}
        }
        self.assertEqual(calculate(event, round_), {'t1': 80, 't2': 80, 't3': 40, 't4': 0})
