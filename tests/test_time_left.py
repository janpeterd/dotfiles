import importlib.util
from datetime import datetime
from pathlib import Path
import unittest

MODULE = Path(__file__).resolve().parents[1] / 'dot_config/DankMaterialShell/plugins/TimeLeft/countdown.py'
spec = importlib.util.spec_from_file_location('countdown', MODULE)
countdown = importlib.util.module_from_spec(spec)
spec.loader.exec_module(countdown)


def read(iso, birth=''):
    return countdown.snapshot(datetime.fromisoformat(iso), birth)


class TimeLeftTests(unittest.TestCase):
    def test_readable_durations(self):
        for minutes, expected in [(0, 'Over'), (1, '1 min'), (59, '59 min'), (60, '1h 0m'), (61, '1h 1m')]:
            self.assertEqual(countdown.format_minutes(minutes), expected)
        result = read('2026-09-08T18:00:00+02:00', '2002-10-31')
        self.assertEqual(result['label'], '5h 30m')
        self.assertEqual(result['rows'][0]['remaining'], 'Over')
        self.assertEqual(result['rows'][1]['remaining'], '5h 30m left')
        self.assertEqual(result['rows'][2]['remaining'], '3mo 24d left')
        self.assertEqual(result['rows'][3]['remaining'], '66y 1mo 23d left')

    def test_calendar_month_ends(self):
        for start, end, expected in [
            ('2026-01-31', '2026-02-28', '1mo left'),
            ('2024-02-29', '2025-02-28', '1y left'),
            ('2026-01-31', '2026-03-30', '1mo 30d left'),
            ('2026-12-31', '2027-01-01', '1d left'),
        ]:
            self.assertEqual(countdown.format_calendar_remaining(
                datetime.fromisoformat(start), datetime.fromisoformat(end)), expected)

    def test_daily_boundaries(self):
        for time, mode, minutes in [
            ('00:00:00', 'work', 1020), ('06:00:00', 'work', 660),
            ('16:59:59', 'work', 1), ('17:00:00', 'bed', 390),
            ('23:29:59', 'bed', 1), ('23:30:00', 'bed', 0),
            ('23:59:59', 'bed', 0),
        ]:
            with self.subTest(time=time):
                result = read('2026-09-08T' + time + '+02:00')
                self.assertEqual((result['mode'], result['minutes']), (mode, minutes))

    def test_workday_and_evening_progress(self):
        self.assertEqual(read('2026-09-08T05:00:00+02:00')['rows'][0]['progress'], 0)
        self.assertEqual(read('2026-09-08T11:30:00+02:00')['rows'][0]['progress'], 0.5)
        rows = read('2026-09-08T20:15:00+02:00')['rows']
        self.assertEqual(rows[0]['progress'], 1)
        self.assertAlmostEqual(rows[1]['progress'], 14.25 / 17.5)

    def test_full_day_progress(self):
        for time, expected in [('05:00:00', 0), ('06:00:00', 0),
                               ('14:45:00', 0.5), ('23:30:00', 1)]:
            with self.subTest(time=time):
                row = read('2026-09-08T' + time + '+02:00')['rows'][1]
                self.assertEqual(row['progress'], expected)
                self.assertEqual(row['detail'], '06:00 to 23:30')

    def test_timezone_independent(self):
        self.assertEqual(read('2026-09-08T15:00:00+00:00')['mode'], 'bed')
        self.assertEqual(read('2026-01-08T16:00:00+00:00')['mode'], 'bed')

    def test_dst_changes_and_weekends(self):
        self.assertEqual(read('2026-03-29T01:00:00+01:00')['minutes'], 900)
        self.assertEqual(read('2026-10-25T01:00:00+02:00')['minutes'], 1020)

    def test_year_rollover_and_leap_year(self):
        self.assertEqual(read('2024-01-01T00:00:00+01:00')['rows'][2]['remaining'], '1y left')
        self.assertEqual(read('2025-01-01T00:00:00+01:00')['rows'][2]['progress'], 0)
        self.assertGreater(read('2024-12-31T23:59:59+01:00')['rows'][2]['progress'], 0.999)

    def test_birth_unknown_or_invalid(self):
        for birth in ['', 'wrong', '2026-02-30', '2030-01-01']:
            with self.subTest(birth=birth):
                self.assertIsNone(read('2026-09-08T00:00:00+02:00', birth)['rows'][3]['progress'])

    def test_life_start_end_and_clamping(self):
        self.assertEqual(read('2000-01-01T00:00:00+01:00', '2000-01-01')['rows'][3]['progress'], 0)
        for year in [2090, 2091]:
            row = read(f'{year}-01-01T00:00:00+01:00', '2000-01-01')['rows'][3]
            self.assertEqual(row['progress'], 1)
            self.assertEqual(row['remaining'], 'Over')

    def test_leap_birthday_uses_february_28_in_non_leap_target_year(self):
        self.assertEqual(read('2090-02-28T00:00:00+01:00', '2000-02-29')['rows'][3]['progress'], 1)


if __name__ == '__main__':
    unittest.main()
