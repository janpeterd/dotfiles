#!/usr/bin/env python3
"""Both sides must satisfy the same behavior before judging design quality."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
for prefix, case, target, oracle, runtime in (
    ('settlement', 'atomic-settlement', 'ledger.py', 'check.py', 'python3'),
    ('validation', 'divergent-validation', 'validation.ts', 'check.mjs', 'node'),
):
    case_dir = root.parent / 'cases' / case
    for arm in ('a', 'b'):
        specimen = root / f'{prefix}-{arm}{Path(target).suffix}'
        with tempfile.TemporaryDirectory(prefix='boundary-anchor-') as directory:
            workspace = Path(directory)
            shutil.copytree(case_dir / 'fixture', workspace, dirs_exist_ok=True)
            shutil.copyfile(specimen, workspace / target)
            commands = [[runtime, str(case_dir / 'oracle' / oracle)]]
            commands.append(['python3', '-m', 'unittest', '-v'] if runtime == 'python3' else
                            ['node', '--test', *[str(p) for p in workspace.glob('*.test.ts')]])
            for command in commands:
                result = subprocess.run(command, cwd=workspace,
                                        env=dict(os.environ, EVAL_WORKSPACE=directory),
                                        capture_output=True, text=True, timeout=30)
                if result.returncode:
                    raise AssertionError(f'{specimen.name}:\n{result.stdout}\n{result.stderr}')
            print(f'{specimen.name}: public tests and external oracle passed')
