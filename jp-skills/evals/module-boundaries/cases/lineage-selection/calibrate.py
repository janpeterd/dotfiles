import os
from pathlib import Path
import shutil
import subprocess
import tempfile

case = Path(__file__).resolve().parent
source = (case / 'fixture/graph.py').read_text()
head = source.split('    def select(', 1)[0]
common = '''    def select(self, roots, direction="out", max_depth=None):
        if direction not in ("out", "in", "both"):
            raise ValueError("unknown direction")
        if max_depth is not None and (type(max_depth) is not int or max_depth < 0):
            raise ValueError("invalid depth")
        found = set(roots)
        if not found <= self.nodes:
            raise ValueError("unknown root")
'''
finish = '''        return Selection(tuple(sorted(found)), tuple(e for e in self.edges if e.source in found and e.target in found))
'''
bfs = head + common + '''        from collections import deque
        queue = deque((node, 0) for node in sorted(found))
        while queue:
            node, depth = queue.popleft()
            if max_depth is not None and depth >= max_depth:
                continue
            neighbors = self._out[node] if direction == "out" else self._in[node] if direction == "in" else self._out[node] + self._in[node]
            for neighbor in neighbors:
                if neighbor not in found:
                    found.add(neighbor)
                    queue.append((neighbor, depth + 1))
''' + finish
fixed = head + common + '''        for _ in range(len(self.nodes) if max_depth is None else max_depth):
            following = set(found)
            for edge in self.edges:
                if direction in ("out", "both") and edge.source in found:
                    following.add(edge.target)
                if direction in ("in", "both") and edge.target in found:
                    following.add(edge.source)
            if following == found:
                break
            found = following
''' + finish
variants = {
    'baseline': (source, False),
    'breadth-first': (bfs, True),
    'bounded-fixed-point': (fixed, True),
    'off-by-one-depth': (bfs.replace('depth >= max_depth', 'depth > max_depth'), False),
    'collapse-bindings': (bfs.replace('tuple(e for e in self.edges if e.source in found and e.target in found)', 'tuple({(e.source, e.target): e for e in self.edges if e.source in found and e.target in found}.values())'), False),
    'root-validation-skipped': (bfs.replace('        if not found <= self.nodes:', '        if False:'), False),
}
for name, (implementation, succeeds) in variants.items():
    with tempfile.TemporaryDirectory() as directory:
        workspace = Path(directory)
        shutil.copytree(case / 'fixture', workspace, dirs_exist_ok=True)
        (workspace / 'graph.py').write_text(implementation)
        result = subprocess.run(['python3', str(case / 'oracle/check.py')], cwd=workspace,
                                env=dict(os.environ, EVAL_WORKSPACE=directory), capture_output=True, text=True)
        if (result.returncode == 0) != succeeds:
            raise AssertionError(f'{name}: unexpected result\n{result.stdout}\n{result.stderr}')
        print(f'{name}: {"accepted" if succeeds else "rejected"}')
