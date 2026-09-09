import unittest

from graph import Graph


class GraphTests(unittest.TestCase):
    def test_views_share_stable_order(self) -> None:
        graph = Graph(
            ("fetch", "clean", "summarize", "publish"),
            (("fetch", "clean"), ("fetch", "summarize"), ("clean", "publish"), ("summarize", "publish")),
        )

        groups = graph.parallel_groups()

        self.assertEqual(groups, (("fetch",), ("clean", "summarize"), ("publish",)))
        self.assertEqual(tuple(node for group in groups for node in group), graph.topological_order())

    def test_views_reject_cycles(self) -> None:
        graph = Graph(("a", "b"), (("a", "b"), ("b", "a")))

        with self.assertRaisesRegex(ValueError, "cycle"):
            graph.topological_order()
        with self.assertRaisesRegex(ValueError, "cycle"):
            graph.parallel_groups()


if __name__ == "__main__":
    unittest.main()
