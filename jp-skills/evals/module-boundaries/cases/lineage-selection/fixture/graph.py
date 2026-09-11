from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Edge:
    source: str
    target: str
    binding: str

@dataclass(frozen=True)
class Selection:
    nodes: tuple[str, ...]
    edges: tuple[Edge, ...]

class Graph:
    def __init__(self, nodes, edges):
        self.nodes = frozenset(nodes)
        self.edges = tuple(sorted(set(edges)))
        for edge in self.edges:
            if edge.source not in self.nodes or edge.target not in self.nodes:
                raise ValueError("unknown endpoint")
        self._out = {node: [] for node in self.nodes}
        self._in = {node: [] for node in self.nodes}
        for edge in self.edges:
            self._out[edge.source].append(edge.target)
            self._in[edge.target].append(edge.source)

    def select(self, roots, direction="out"):
        if direction not in ("out", "in", "both"):
            raise ValueError("unknown direction")
        found = set(roots)
        if not found <= self.nodes:
            raise ValueError("unknown root")
        queue = sorted(found)
        while queue:
            node = queue.pop(0)
            if direction == "out":
                neighbors = self._out[node]
            elif direction == "in":
                neighbors = self._in[node]
            else:
                neighbors = self._out[node] + self._in[node]
            for neighbor in neighbors:
                if neighbor not in found:
                    found.add(neighbor)
                    queue.append(neighbor)
        edges = tuple(e for e in self.edges if e.source in found and e.target in found)
        return Selection(tuple(sorted(found)), edges)
