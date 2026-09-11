import unittest
from graph import Graph, Edge, Selection

class Existing(unittest.TestCase):
    def test_directions_and_bindings(self):
        edges = (Edge("a", "b", "left"), Edge("a", "b", "right"), Edge("b", "c", "value"))
        graph = Graph(["a", "b", "c", "isolated"], edges)
        self.assertEqual(graph.select(["a"]), Selection(("a", "b", "c"), edges))
        self.assertEqual(graph.select(["b"], "in").nodes, ("a", "b"))
        self.assertEqual(graph.select(["isolated"], "both"), Selection(("isolated",), ()))

if __name__ == "__main__":
    unittest.main()
