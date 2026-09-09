import unittest

from status_labels import status_label


class StatusPresentationTests(unittest.TestCase):
    def test_known_status(self) -> None:
        self.assertEqual(status_label("running").label, "Running")

    def test_unknown_status_is_not_mislabeled(self) -> None:
        self.assertNotEqual(status_label("paused").label, "Paused")


if __name__ == "__main__":
    unittest.main()
