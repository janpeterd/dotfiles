import unittest

from graph_rendering import render_graph


class GraphRenderingTests(unittest.TestCase):
    def test_renders_stable_topological_ranks(self) -> None:
        self.assertEqual(
            render_graph(
                ("fetch", "clean", "summarize", "publish"),
                (
                    ("fetch", "clean"),
                    ("fetch", "summarize"),
                    ("clean", "publish"),
                    ("summarize", "publish"),
                ),
            ),
            "fetch: 0\nclean: 1\nsummarize: 1\npublish: 2",
        )

    def test_rejects_invalid_graphs(self) -> None:
        with self.assertRaisesRegex(ValueError, "unknown edge endpoint"):
            render_graph(("a",), (("a", "missing"),))
        with self.assertRaisesRegex(ValueError, "cycle"):
            render_graph(("a", "b"), (("a", "b"), ("b", "a")))


if __name__ == "__main__":
    unittest.main()
