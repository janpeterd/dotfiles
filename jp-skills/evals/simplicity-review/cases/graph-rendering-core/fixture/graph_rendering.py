from collections import defaultdict, deque
from dataclasses import dataclass


@dataclass(frozen=True)
class GraphInput:
    nodes: tuple[str, ...]
    edges: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class LayoutGraph:
    node_ids: tuple[str, ...]
    connections: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class RenderNode:
    identifier: str
    rank: int


def _layout_graph(graph: GraphInput) -> LayoutGraph:
    known = set(graph.nodes)
    for source, target in graph.edges:
        if source not in known or target not in known:
            raise ValueError("unknown edge endpoint")
    return LayoutGraph(graph.nodes, graph.edges)


def _ordered_nodes(graph: LayoutGraph) -> tuple[str, ...]:
    indegree = dict.fromkeys(graph.node_ids, 0)
    outgoing: dict[str, list[str]] = defaultdict(list)
    for source, target in graph.connections:
        indegree[target] += 1
        outgoing[source].append(target)
    queue = deque(node for node, degree in indegree.items() if degree == 0)
    ordered: list[str] = []
    while queue:
        node = queue.popleft()
        ordered.append(node)
        for target in outgoing[node]:
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if len(ordered) != len(graph.node_ids):
        raise ValueError("graph contains a cycle")
    return tuple(ordered)


def _node_ranks(graph: LayoutGraph) -> dict[str, int]:
    indegree = dict.fromkeys(graph.node_ids, 0)
    outgoing: dict[str, list[str]] = defaultdict(list)
    for source, target in graph.connections:
        indegree[target] += 1
        outgoing[source].append(target)
    queue = deque(node for node, degree in indegree.items() if degree == 0)
    ranks = dict.fromkeys(graph.node_ids, 0)
    visited = 0
    while queue:
        node = queue.popleft()
        visited += 1
        for target in outgoing[node]:
            ranks[target] = max(ranks[target], ranks[node] + 1)
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if visited != len(graph.node_ids):
        raise ValueError("graph contains a cycle")
    return ranks


def render_graph(nodes: tuple[str, ...], edges: tuple[tuple[str, str], ...]) -> str:
    graph = _layout_graph(GraphInput(nodes, edges))
    ranks = _node_ranks(graph)
    render_nodes = tuple(RenderNode(node, ranks[node]) for node in _ordered_nodes(graph))
    return "\n".join(f"{node.identifier}: {node.rank}" for node in render_nodes)
