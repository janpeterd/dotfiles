import unittest

from runtime import Worker, lifespan


class RuntimeTests(unittest.IsolatedAsyncioTestCase):
    async def test_successful_workers_stop(self) -> None:
        required = Worker()
        optional = Worker()
        health: dict[str, str] = {}
        async with lifespan(required, optional, health):
            self.assertTrue(required.started)
        self.assertFalse(required.started)


if __name__ == "__main__":
    unittest.main()
