import unittest
from jobs import Service

class Existing(unittest.TestCase):
    def test_result_retry(self):
        service = Service()
        service.start("one")
        self.assertEqual(service.results.accept("one", "output"), "output")
        self.assertEqual(service.results.accept("one", "output"), "output")
        self.assertEqual(len(service.results.messages), 1)

    def test_cancellation_retry(self):
        service = Service()
        service.start("one")
        self.assertEqual(service.cancellation.cancel("one"), "cancelled")
        self.assertEqual(service.cancellation.cancel("one"), "cancelled")
        self.assertEqual(len(service.cancellation.messages), 1)

if __name__ == "__main__":
    unittest.main()
