# Evaluator notes

The candidate sees only prompt.md and fixture/. Keep case.json, oracle/ and calibrate.py outside its workspace. The oracle imports the public TypeScript API from EVAL_WORKSPACE and checks observable behavior. It accepts any internal layout satisfying that API.

The baseline tests pass. The missing feature fails the external oracle. `python3 calibrate.py` checks a temporary correct batch implementation and three faulty alternatives: publication after each entry, freshly allocated snapshots on every read, and mutation of retained records. All three faults are rejected. The correct example is calibration evidence, not an expected architecture.

The external oracle covers failed-batch rollback, repeated IDs, net no-ops, one publication per commit, shared behavior across both update methods, old snapshot retention, frozen results, and deterministic multi-step replay. It verifies notification count as a public contract rather than benchmarking speed. It cannot establish production rendering cost or TypeScript type correctness.

Blinded design review should accept keeping this cohesive class, a private pure batch calculation, or another bounded design justified by actual caller knowledge. Stable snapshots are part of the supplied consumer contract. Treating the derived representation itself as competing state authority is a false positive. Added managers with independent transition decisions require scrutiny even if they share the same mutable object.
