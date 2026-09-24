import tempfile, subprocess, json
from pathlib import Path
script=str(Path(__file__).resolve().parents[2] / 'skills/simplicity-review/scripts/measure-python.py')
with tempfile.TemporaryDirectory(prefix='review-collector-check-') as tmp:
 root=Path(tmp); repo=root/'repo'; repo.mkdir()
 def git(*args): subprocess.run(['git','-C',str(repo),*args],check=True,capture_output=True)
 git('init','-q')
 (repo/'a').mkdir();(repo/'b').mkdir()
 (repo/'a/owner.py').write_text('raise RuntimeError("must never import target")\nclass Owner:\n    def read(self, x):\n        return x if x else None\n'+'# cohesive owner size counterexample\n'*1001)
 (repo/'b/helper.py').write_text('def helper(x):\n    def nested(y):\n        return y + 1\n    return nested(x)\n')
 git('add','.');git('-c','user.name=Collector check','-c','user.email=check@invalid','commit','-qm','fixture')
 def run(out,*args): return subprocess.run(['uv','run',script,str(repo),str(out),'--scope','a','--scope','b',*args],capture_output=True,text=True)
 result=run(root/'committed'); assert result.returncode==0, result.stderr
 rows=json.loads((root/'committed/radon-functions.json').read_text())
 assert sorted(f['name'] for f in rows)==['Owner.read','helper','helper.<locals>.nested'], rows
 assert len(json.loads((root/'committed/files.json').read_text()))==2
 (repo/'b/new.py').write_text('def fresh():\n    return 1\n')
 result=run(root/'working','--working-tree'); assert result.returncode==0,result.stderr
 assert json.loads((root/'working/manifest.json').read_text())['files']==3
 (repo/'b/broken.py').write_text('def broken(:\n')
 result=run(root/'broken','--working-tree');assert result.returncode!=0
 result=run(repo/'forbidden'); assert result.returncode!=0 and not (repo/'forbidden').exists()
 print('PASS: multi-scope snapshot, no target imports, >1000-line acceptance, method/closure accounting, working-tree inclusion, parse failure and external output requirement')
