import unittest
from formatting import format_count

class Formatting(unittest.TestCase):
    def test_singular(self):
        self.assertEqual(format_count(1), "1 job")

if __name__ == "__main__":
    unittest.main()
