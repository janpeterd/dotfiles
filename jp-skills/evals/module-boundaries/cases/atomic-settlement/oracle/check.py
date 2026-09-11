"""Evaluator-owned contract checks. Candidate tests are not the acceptance oracle."""
import os
import sys
import unittest
sys.path.insert(0, os.environ["EVAL_WORKSPACE"])
from ledger import Ledger, Receipt

class Contract(unittest.TestCase):
    def setUp(self):
        self.ledger = Ledger()
        self.ledger.open_account("a", 20)
        self.ledger.open_account("b", 0)
        self.ledger.open_account("c", 0)

    def r(self, name, amount=7, source="a", destination="b", epoch=1):
        return Receipt(name, source, destination, amount, epoch)

    def test_order_and_retry(self):
        first = self.r("1", 18)
        second = self.r("2", 10, "b", "c")
        expected = (first, second, first)
        self.assertEqual(self.ledger.settle_many(iter(expected)), expected)
        self.assertEqual(self.ledger.balances(), {"a": 2, "b": 8, "c": 10})
        self.assertEqual(self.ledger.settle_many(expected), expected)
        self.assertEqual(self.ledger.receipts(), (first, second))
        self.assertEqual(self.ledger.settle(first), first)
        self.assertEqual(self.ledger.settle_many([]), ())

    def test_late_invalid_rolls_back_prefix(self):
        for invalid in (self.r("bad", 30), self.r("bad", 0), self.r("bad", True),
                        self.r("bad", source="unknown"), self.r("bad", destination="a"),
                        self.r("bad", epoch=0), self.r("", 1)):
            with self.subTest(invalid=invalid):
                with self.assertRaises(ValueError):
                    self.ledger.settle_many([self.r("ok"), invalid])
                self.assertEqual(self.ledger.balances(), {"a": 20, "b": 0, "c": 0})
                self.assertEqual(self.ledger.receipts(), ())

    def test_conflict_and_mixed_existing(self):
        old = self.r("old", 2)
        self.ledger.settle(old)
        with self.assertRaises(ValueError):
            self.ledger.settle_many([old, self.r("new"), self.r("new", 8)])
        self.assertEqual(self.ledger.balances(), {"a": 18, "b": 2, "c": 0})
        self.assertEqual(self.ledger.receipts(), (old,))

    def test_stale_retry_is_fenced(self):
        old = self.r("old")
        self.ledger.settle(old)
        self.ledger.replace_owner()
        with self.assertRaises(ValueError):
            self.ledger.settle_many([old])
        self.assertEqual(self.ledger.balances(), {"a": 13, "b": 7, "c": 0})

    def test_generator_error_rolls_back(self):
        def broken():
            yield self.r("ok")
            raise RuntimeError("upstream decoder")
        with self.assertRaises(RuntimeError):
            self.ledger.settle_many(broken())
        self.assertEqual(self.ledger.balances(), {"a": 20, "b": 0, "c": 0})
        self.assertEqual(self.ledger.receipts(), ())

if __name__ == "__main__":
    unittest.main()
