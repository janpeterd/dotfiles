import os
import random
import sys
import unittest
sys.path.insert(0, os.environ["EVAL_WORKSPACE"])
from graph import Edge, Graph, Selection

def expected(nodes, edges, roots, direction, depth):
    # Fixed-point sets are independent of candidate queue/stack decomposition.
    reached = set(roots)
    for _ in range(len(nodes) if depth is None else depth):
        following = set(reached)
        for edge in edges:
            if direction in ("out", "both") and edge.source in reached:
                following.add(edge.target)
            if direction in ("in", "both") and edge.target in reached:
                following.add(edge.source)
        if following == reached:
            break
        reached = following
    return Selection(tuple(sorted(reached)), tuple(sorted(set(e for e in edges if e.source in reached and e.target in reached))))

class Contract(unittest.TestCase):
    def test_shortest_distance_and_induced_bindings(self):
        edges = [Edge("a", "b", "x"), Edge("b", "c", "x"), Edge("c", "d", "x"),
                 Edge("a", "d", "shortcut"), Edge("d", "e", "x"), Edge("e", "d", "cycle"),
                 Edge("a", "d", "other"), Edge("e", "e", "self")]
        graph = Graph("abcdef", edges)
        for roots in (["a"], ["c", "a", "c"], [], ["f"]):
            for direction in ("out", "in", "both"):
                for depth in (None, 0, 1, 2, 9):
                    self.assertEqual(graph.select(roots, direction, depth), expected("abcdef", edges, roots, direction, depth))
        self.assertEqual(graph.select(["a"]), expected("abcdef", edges, ["a"], "out", None))

    def test_validation_before_early_return(self):
        graph = Graph("ab", [Edge("a", "b", "x")])
        for invalid in (-1, True, 1.5, "1"):
            with self.assertRaises(ValueError):
                graph.select([], max_depth=invalid)
        with self.assertRaises(ValueError):
            graph.select(["missing"], max_depth=0)
        with self.assertRaises(ValueError):
            graph.select([], "sideways", 0)

    def test_small_generated_graphs(self):
        rng = random.Random(1703)
        nodes = tuple("abcde")
        for _ in range(24):
            edges = [Edge(a, b, label) for a in nodes for b in nodes for label in ("x", "y") if rng.random() < .12]
            graph = Graph(nodes, edges)
            roots = rng.sample(nodes, rng.randrange(4))
            for direction in ("out", "in", "both"):
                for depth in (0, 1, 2, None):
                    self.assertEqual(graph.select(roots, direction, depth), expected(nodes, edges, roots, direction, depth))

if __name__ == "__main__":
    unittest.main()
