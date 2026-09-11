"""Harness contract checks using a local agent double, never paid model calls."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

RUNNER = Path(__file__).resolve().parents[1] / 'scripts' / 'run-case'

STUB = '''#!/usr/bin/env python3
import json, os, pathlib, sys, time
args = sys.argv[1:]
p = pathlib.Path.cwd()
seen = {'stdin': sys.stdin.read(), 'args': args, 'files': sorted(str(x.relative_to(p)) for x in p.rglob('*')),
        'eval_env': [k for k in os.environ if k.startswith(('CASE_', 'EVAL_', 'BAKEOFF_'))]}
if '--skill' in args:
    skill = pathlib.Path(args[args.index('--skill') + 1])
    seen['reference'] = (skill.parent / '../shared/reference.md').read_text()
    seen['skill'] = str(skill)
print(json.dumps(seen), flush=True)
message = {'role': 'assistant', 'model': args[args.index('--model') + 1], 'provider': args[args.index('--provider') + 1], 'content': [{'type': 'text', 'text': 'Completed review.'}], 'stopReason': 'stop'}
if os.environ.get('STUB_PROVIDER_ERROR'):
    message.update(content=[], stopReason='error', errorMessage='provider unavailable')
print(json.dumps({'type': 'message_end', 'message': message}), flush=True)
if os.environ.get('STUB_WRITE'):
    (p / 'source.py').write_text('answer = 0\\n')
if os.environ.get('STUB_SLEEP'):
    time.sleep(20)
'''


class HarnessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.case = self.root / 'case'
        (self.case / 'fixture').mkdir(parents=True)
        (self.case / 'oracle').mkdir()
        (self.case / 'fixture/source.py').write_text('answer = 42\n')
        (self.case / 'oracle/check.py').write_text(
            "from pathlib import Path\nassert Path('source.py').read_text() == 'answer = 42\\n'\n")
        (self.case / 'prompt.md').write_text('Investigate the behavior and explain a design.')
        self.config = {'name': 'harness', 'checks': ['python3 -m py_compile source.py'],
                       'oracle_checks': ['python3 "$EVAL_CASE_DIR/oracle/check.py"'],
                       'rubric': ['SECRET_GRADING_RULE']}
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        (self.bin / 'pi').write_text(STUB)
        (self.bin / 'pi').chmod(0o755)
        self.skills = self.root / 'source-skills'
        for name in ['review', 'shared']:
            (self.skills / name).mkdir(parents=True)
            (self.skills / name / 'SKILL.md').write_text(
                f'---\nname: {name}\ndescription: review code\n---\nUNIQUE_SKILL_BODY\n')
        (self.skills / 'shared/reference.md').write_text('FROZEN_REFERENCE')

    def invoke(self, mode='execution', skill=True, **extra):
        (self.case / 'case.json').write_text(json.dumps(self.config))
        env = dict(os.environ, PATH=str(self.bin) + os.pathsep + os.environ['PATH'],
                   RUN_ROOT=str(self.root / 'results'), CASE_MODE=mode,
                   EVAL_CASE_DIR='SECRET_EVALUATOR_PATH', CASE_SECRET='SECRET', **extra)
        command = [str(RUNNER), str(self.case)]
        if skill:
            command.append(str(self.skills / 'review'))
        process = subprocess.run(command, env=env, capture_output=True, text=True, input='HIDDEN_EVALUATOR_INPUT', timeout=10)
        self.assertTrue(process.stdout.strip(), process.stderr)
        result = Path(process.stdout.strip())
        return process.returncode, json.loads((result / 'metadata.json').read_text()), result

    def test_bakeoff_seeded_schedule_unique_roots_and_failure_exit(self):
        (self.case / 'case.json').write_text(json.dumps(self.config))
        scripts = self.root / 'scripts'
        scripts.mkdir()
        fake = scripts / 'run-case'
        fake.write_text('#!/bin/sh\ncat >/dev/null\nprintf "stub-result\\n"\nexit "${STUB_CELL_STATUS:-0}"\n')
        fake.chmod(0o755)
        (self.bin / 'pi').write_text('#!/bin/sh\nexit 0\n')
        env = dict(os.environ, PATH=str(self.bin) + os.pathsep + os.environ['PATH'],
                   BAKEOFF_TRIALS='2', BAKEOFF_CONCURRENCY='2', BAKEOFF_SEED='stable-test',
                   BAKEOFF_MODELS='openai-codex/gpt-5.6-sol,openai-codex/gpt-6-astra')
        command = [str(RUNNER.with_name('run-bakeoff')), str(self.case),
                   str(self.skills / 'review'), str(self.skills / 'shared')]
        roots = []
        for status in ('0', '2'):
            process = subprocess.run(command, cwd=self.root, env=dict(env, STUB_CELL_STATUS=status),
                                     capture_output=True, text=True, timeout=10)
            self.assertEqual(process.returncode, int(status), process.stderr)
            roots.append(self.root / process.stdout.strip())
        self.assertNotEqual(roots[0], roots[1])
        schedules = [json.loads((root / 'schedule.json').read_text()) for root in roots]
        self.assertEqual(schedules[0], schedules[1])
        self.assertEqual(schedules[0]['seed'], 'stable-test')
        self.assertEqual(len(schedules[0]['schedule']), 12)
        self.assertEqual(len({(cell['arm'], cell['model'], cell['trial'])
                              for cell in schedules[0]['schedule']}), 12)
        self.assertGreater(len({cell['arm'] for cell in schedules[0]['schedule'][:4]}), 1)
        self.assertEqual((roots[1] / 'status').read_text(), '2\n')

    def test_forbidden_models_and_proxy_aliases_never_launch_or_auth(self):
        (self.case / 'case.json').write_text(json.dumps(self.config))
        for provider, model in [('anthropic', 'sonnet'), ('openai', 'Claude-proxy'),
                                ('openrouter', 'anthropic/claude'), ('proxy', 'innocent-alias')]:
            with self.subTest(provider=provider, model=model):
                env = dict(os.environ, PATH=str(self.bin) + os.pathsep + os.environ['PATH'],
                           CASE_PROVIDER=provider, CASE_MODEL=model,
                           BAKEOFF_MODELS=f'{provider}/{model}')
                for command in ([str(RUNNER), str(self.case)],
                                [str(RUNNER.with_name('run-bakeoff')), str(self.case),
                                 str(self.skills / 'review'), '-']):
                    process = subprocess.run(command, env=env, cwd=self.root,
                                             capture_output=True, text=True)
                    self.assertNotEqual(process.returncode, 0)
                    self.assertEqual(process.stdout, '')
                    self.assertTrue('forbidden' in process.stderr or 'direct OpenAI' in process.stderr)

    def test_astra_uses_exact_id_and_local_extension(self):
        status, metadata, _ = self.invoke(CASE_MODEL='gpt-6-astra')
        self.assertEqual(status, 0)
        self.assertEqual(metadata['model'], 'gpt-6-astra')
        self.assertEqual(metadata['model_family'], 'openai')
        self.assertIn('--extension', metadata['command'])
        self.assertTrue(metadata['eval_model_extension_sha256'])

    def test_execution_snapshot_and_candidate_separation(self):
        status, metadata, result = self.invoke()
        self.assertEqual(status, 0)
        seen = json.loads((result / 'agent.jsonl').read_text().splitlines()[0])
        self.assertEqual(seen['files'], ['source.py'])
        self.assertEqual(seen['stdin'], '')
        self.assertEqual(seen['eval_env'], [])
        self.assertEqual(seen['reference'], 'FROZEN_REFERENCE')
        self.assertNotIn(str(self.skills), seen['skill'])
        self.assertIn('UNIQUE_SKILL_BODY', seen['args'][-1])
        self.assertNotIn('SECRET', seen['args'][-1])
        self.assertEqual(metadata['candidate_changed_paths'], [])
        self.assertIn('shared/reference.md', metadata['skill_bundle_hashes'])
        self.assertEqual(metadata['command'][1:], seen['args'])
        (self.skills / 'shared/reference.md').write_text('CHANGED')
        self.assertEqual((result / 'skill-bundle/shared/reference.md').read_text(), 'FROZEN_REFERENCE')

    def test_discovery_registers_without_body_and_absent_registers_nothing(self):
        status, metadata, result = self.invoke(mode='discovery')
        seen = json.loads((result / 'agent.jsonl').read_text().splitlines()[0])
        self.assertEqual(status, 0)
        self.assertEqual(metadata['mode'], 'discovery')
        self.assertIn('--skill', seen['args'])
        self.assertNotIn('UNIQUE_SKILL_BODY', seen['args'][-1])
        _, metadata, result = self.invoke(mode='discovery', skill=False)
        seen = json.loads((result / 'agent.jsonl').read_text().splitlines()[0])
        self.assertNotIn('--skill', seen['args'])
        self.assertFalse(metadata['skill_present'])

    def test_external_oracle_catches_wrong_but_syntactically_valid_code(self):
        status, metadata, _ = self.invoke(STUB_WRITE='1')
        self.assertEqual(status, 1)
        self.assertEqual(metadata['outcome'], 'behavioral_failure')
        self.assertEqual(metadata['checks'][1]['exit_code'], 0)
        self.assertEqual(metadata['checks'][0]['exit_code'], 1)
        self.assertFalse(metadata['read_only_violation'])

    def test_readonly_source_write_fails_without_an_oracle_failure(self):
        self.config.update(review_only=True, oracle_checks=[])
        status, metadata, _ = self.invoke(STUB_WRITE='1')
        self.assertEqual(status, 1)
        self.assertTrue(metadata['read_only_violation'])
        self.assertEqual(metadata['candidate_changed_paths'], ['source.py'])

    def test_exit_zero_provider_error_is_infrastructure(self):
        status, metadata, _ = self.invoke(STUB_PROVIDER_ERROR='1')
        self.assertEqual(metadata['agent']['exit_code'], 0)
        self.assertEqual(status, 2)
        self.assertFalse(metadata['transcript']['completed_assistant_response'])

    def test_candidate_checks_cannot_repair_code_before_oracle(self):
        self.config['checks'] = ["printf 'answer = 42\\n' > source.py"]
        status, metadata, result = self.invoke(STUB_WRITE='1')
        self.assertEqual(status, 1)
        self.assertEqual(metadata['checks'][0]['exit_code'], 1)
        self.assertEqual((result / 'workspace/source.py').read_text(), 'answer = 0\n')

    def test_evaluator_timeout_is_infrastructure(self):
        self.config['oracle_checks'] = ['sleep 20']
        status, metadata, _ = self.invoke(CASE_CHECK_TIMEOUT_SECONDS='0.1')
        self.assertEqual(status, 2)
        self.assertEqual(metadata['agent']['exit_code'], 0)
        self.assertTrue(metadata['checks'][0]['timed_out'])
        self.assertEqual(metadata['outcome'], 'infrastructure_failure')

    def test_timeout_is_infrastructure_not_behavior(self):
        status, metadata, _ = self.invoke(STUB_SLEEP='1', CASE_TIMEOUT_SECONDS='0.15')
        self.assertEqual(status, 2)
        self.assertTrue(metadata['agent']['timed_out'])
        self.assertEqual(metadata['outcome'], 'infrastructure_failure')
        self.assertEqual(metadata['checks'][1]['exit_code'], 0)


if __name__ == '__main__':
    unittest.main()
