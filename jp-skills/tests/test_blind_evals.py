import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/blind-evals'

class BlindPackets(unittest.TestCase):
    def test_separates_identity_and_excludes_infrastructure(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cases = []
            for index, outcome in enumerate(['checks_passed', 'infrastructure_failure']):
                result = root / str(index)
                result.mkdir()
                (result / 'workspace').mkdir()
                (result / 'workspace/code.py').write_text('answer = 42\n')
                frozen = result / 'evaluator-case'
                (frozen / 'fixture').mkdir(parents=True)
                (frozen / 'fixture/code.py').write_text('answer = 0\n')
                (frozen / 'oracle').mkdir()
                (frozen / 'oracle/secret.txt').write_text('evaluator-only')
                (frozen / 'case.json').write_text(json.dumps({'name': 'case', 'rubric': [{'id': 'behavior', 'criterion': 'returns 42'}]}))
                (frozen / 'prompt.md').write_text('Fix the answer.')
                (result / 'metadata.json').write_text(json.dumps({'outcome': outcome, 'arm': 'proposed', 'model': 'private-model-label', 'trial': 1, 'mode': 'execution', 'checks': []}))
                events = [
                    {'type': 'message_end', 'message': {'role': 'assistant', 'content': [{'type': 'text', 'text': 'Before editing: use a bounded traversal.'}]}},
                    {'type': 'tool_execution_start', 'toolName': 'edit', 'args': {'path': '/private/proposed/SKILL.md', 'newText': 'private-model-label'}},
                    {'type': 'tool_execution_start', 'toolName': 'bash', 'args': {'command': 'cat /private/proposed/SKILL.md'}},
                    {'type': 'message_end', 'message': {'role': 'assistant', 'content': [{'type': 'text', 'text': 'Fixed the answer.'}]}},
                ]
                (result / 'agent.jsonl').write_text(''.join(json.dumps(event) + '\n' for event in events))
                cases.append(result)
            output = root / 'packet'
            subprocess.run([str(SCRIPT), str(output), *map(str, cases)], check=True, capture_output=True)
            identity = json.loads((output / 'identity-map.json').read_text())
            self.assertEqual(len(identity['candidates']), 1)
            self.assertEqual(len(identity['excluded']), 1)
            candidate = output / 'review/case/candidate-001'
            self.assertEqual((candidate / 'workspace/code.py').read_text(), 'answer = 42\n')
            self.assertEqual((candidate / 'baseline/code.py').read_text(), 'answer = 0\n')
            text = '\n'.join(p.read_text() for p in (output / 'review').rglob('*') if p.is_file())
            self.assertNotIn('private-model-label', text)
            self.assertNotIn('evaluator-only', text)
            self.assertNotIn('/private/proposed', text)
            self.assertEqual((candidate / 'response.md').read_text(),
                             'Before editing: use a bounded traversal.\n\nFixed the answer.')
            self.assertEqual(json.loads((candidate / 'process.json').read_text()), [
                {'kind': 'assistant', 'text': 'Before editing: use a bounded traversal.'},
                {'kind': 'tool_start', 'name': 'edit'},
                {'kind': 'tool_start', 'name': 'bash'},
                {'kind': 'assistant', 'text': 'Fixed the answer.'},
            ])

if __name__ == '__main__':
    unittest.main()
