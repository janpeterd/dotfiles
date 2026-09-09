import unittest

from jobs import Job, export_job


class JobExportTests(unittest.TestCase):
    def test_exports_running_job(self) -> None:
        self.assertEqual(export_job(Job("job-7", "running")), "job-7\tRunning")


if __name__ == "__main__":
    unittest.main()
