"""Demonstrate that the external oracle detects plausible semantic regressions."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

case = Path(__file__).resolve().parent
source = (case / "fixture/ledger.py").read_text()
head, method = source.split("    def settle(self, receipt):\n", 1)
body = method.removeprefix("        with self.db:\n")
body = "\n".join(line[4:] if line.startswith("    ") else line for line in body.splitlines())
good = head + "    def _settle(self, receipt):\n" + body + '''

    def settle(self, receipt):
        return self.settle_many([receipt])[0]

    def settle_many(self, receipts):
        with self.db:
            return tuple(self._settle(receipt) for receipt in receipts)
'''
variants = {
    "baseline-missing-feature": (source, False),
    "private-operation": (good, True),
    "materialize-first": (good.replace('with self.db:\n            return tuple(self._settle', 'receipts = tuple(receipts)\n        with self.db:\n            return tuple(self._settle'), True),
    "committed-prefix": (source + '\n    def settle_many(self, receipts):\n        return tuple(self.settle(r) for r in receipts)\n', False),
    "duplicate-debits": (good.replace('            return old', '            pass'), False),
    "unfenced-owner": (good.replace('if receipt.owner_epoch != epoch:', 'if False:'), False),
}
for name, (implementation, succeeds) in variants.items():
    with tempfile.TemporaryDirectory() as directory:
        workspace = Path(directory)
        shutil.copytree(case / 'fixture', workspace, dirs_exist_ok=True)
        (workspace / 'ledger.py').write_text(implementation)
        result = subprocess.run(['python3', str(case / 'oracle/check.py')], cwd=workspace,
                                env=dict(os.environ, EVAL_WORKSPACE=directory), capture_output=True, text=True)
        if (result.returncode == 0) != succeeds:
            raise AssertionError(f'{name}: unexpected result\n{result.stdout}\n{result.stderr}')
        print(f'{name}: {"accepted" if succeeds else "rejected"}')
