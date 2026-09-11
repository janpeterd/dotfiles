import unittest
from ledger import Ledger, Receipt

class LedgerTests(unittest.TestCase):
    def test_settle_and_retry(self):
        ledger = Ledger()
        ledger.open_account("a", 20)
        ledger.open_account("b", 0)
        receipt = Receipt("one", "a", "b", 7, 1)
        self.assertEqual(ledger.settle(receipt), receipt)
        self.assertEqual(ledger.settle(receipt), receipt)
        self.assertEqual(ledger.balances(), {"a": 13, "b": 7})

    def test_stale(self):
        ledger = Ledger()
        ledger.open_account("a", 20)
        ledger.open_account("b", 0)
        ledger.replace_owner()
        with self.assertRaises(ValueError):
            ledger.settle(Receipt("one", "a", "b", 7, 1))
        self.assertEqual(ledger.balances(), {"a": 20, "b": 0})

if __name__ == "__main__":
    unittest.main()
