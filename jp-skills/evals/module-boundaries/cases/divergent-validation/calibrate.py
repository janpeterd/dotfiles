#!/usr/bin/env python3
"""Check oracle sensitivity with temporary implementations, never candidate inputs."""
from pathlib import Path
import os
import shutil
import subprocess
import tempfile

CASE = Path(__file__).resolve().parent

def trial(label, transform, should_pass):
    with tempfile.TemporaryDirectory(prefix="boundary-calibration-") as directory:
        target = Path(directory)
        shutil.copytree(CASE / "fixture", target, dirs_exist_ok=True)
        path = target / SOURCE
        path.write_text(transform(path.read_text()))
        env = dict(os.environ, EVAL_WORKSPACE=str(target), EVAL_CASE_DIR=str(CASE))
        checks = [subprocess.run(["node", "--test", *map(str, target.glob("*.test.ts"))], cwd=target, env=env, capture_output=True, text=True),
                  subprocess.run(["node", str(CASE / "oracle/check.mjs")], cwd=target, env=env, capture_output=True, text=True)]
        passed = all(check.returncode == 0 for check in checks)
        if passed != should_pass:
            raise AssertionError(label + " unexpected result\n" + "\n".join(check.stdout + check.stderr for check in checks))
        print(label + (": accepted" if passed else ": rejected"))

SOURCE = "validation.ts"
PROJECT = "export function validateProjectName(input: string): Validation {\n  const value = input.trim().normalize('NFC');\n  const size = [...value].length;\n  if (size < 3 || size > 48) return {ok:false, error:'length'};\n  if (!/^[\\p{L}\\p{M}\\p{Nd} -]+$/u.test(value) || !/[\\p{L}\\p{Nd}]/u.test(value)) return {ok:false, error:'characters'};\n  return {ok:true, value};\n}\n\n"

def implement(source):
    start = source.index("export function validateProjectName")
    end = source.index("export function validateDeviceCode")
    return source[:start] + PROJECT + source[end:]

def shared_policy(source):
    source = implement(source)
    start = source.index("export function validateDeviceCode")
    return source[:start] + "export const validateDeviceCode = validateProjectName;\n"

trial("baseline lacks international names", lambda text: text, False)
trial("separate domain policies", implement, True)
trial("one shared project policy", shared_policy, False)
trial("UTF-16 code unit length", lambda text: implement(text).replace("[...value].length", "value.length"), False)
trial("trim device identifiers", lambda text: implement(text).replace("export function validateDeviceCode(input: string): Validation {", "export function validateDeviceCode(input: string): Validation { input = input.trim();"), False)
