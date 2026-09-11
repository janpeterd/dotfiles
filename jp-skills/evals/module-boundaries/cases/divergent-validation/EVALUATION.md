# Evaluator notes

The candidate sees only prompt.md and fixture/. Keep case.json, oracle/ and calibrate.py outside its workspace. The oracle calls the exported functions from EVAL_WORKSPACE and does not inspect source structure.

The baseline tests pass, while the external oracle detects the missing feature. `python3 calibrate.py` accepts separate domain policies and rejects applying project policy to devices, counting UTF-16 code units, and trimming device codes. Calibration initially exposed an inadequate supplementary-character boundary: 24 letters occupied 48 code units and passed both implementations. The corrected 25-letter probe distinguishes them. The passing example is not a required architecture.

The oracle checks normalization, Unicode categories, supplementary characters, exact length boundaries, error precedence, original device bytes, and rejection of unsupported characters. It cannot prove a future edit will preserve separation. Blinded review must assess the proposed next change and the caller obligations directly.

Separate routines can pass. Small shared mechanical helpers can also pass. Even a bounded parameterized helper can pass when its parameters express stable mechanics and domain policy remains explicit. Rejecting a solution solely for using a helper, two files, or similar-looking code is a grading false positive. A rule framework with domain flags must earn its added contracts against the supplied changes.
