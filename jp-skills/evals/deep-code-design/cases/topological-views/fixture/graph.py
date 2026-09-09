from collections import defaultdict, deque


class Graph:
    def __init__(self, nodes: tuple[str, ...], edges: tuple[tuple[str, str], ...]) -> None:
        self.nodes = dict.fromkeys(nodes)
        self.edges = edges

    def topological_order(self) -> tuple[str, ...]:
        indegree: dict[str, int] = dict.fromkeys(self.nodes, 0)
        outgoing: dict[str, list[str]] = defaultdict(list)
        for source, target in self.edges:
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
        if len(ordered) != len(self.nodes):
            raise ValueError("graph contains a cycle")
        return tuple(ordered)

    def parallel_groups(self) -> tuple[tuple[str, ...], ...]:
        indegree: dict[str, int] = dict.fromkeys(self.nodes, 0)
        outgoing: dict[str, list[str]] = defaultdict(list)
        for source, target in self.edges:
            indegree[target] += 1
            outgoing[source].append(target)
        frontier = [node for node, degree in indegree.items() if degree == 0]
        groups: list[tuple[str, ...]] = []
        while frontier:
            groups.append(tuple(frontier))
            next_frontier: list[str] = []
            for node in frontier:
                for target in outgoing[node]:
                    indegree[target] -= 1
                    if indegree[target] == 0:
                        next_frontier.append(target)
            frontier = next_frontier
        if sum(map(len, groups)) != len(self.nodes):
            raise ValueError("graph contains a cycle")
        return tuple(groups)
