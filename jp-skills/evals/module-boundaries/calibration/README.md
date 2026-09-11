# Evaluator calibration: equal behavior, different maintenance costs

These specimens are evaluator-only. Keep this directory outside candidate workspaces and skill bundles. `python3 evals/module-boundaries/calibration/check.py` runs both specimens in each pair against the same public tests and external oracle. All four pass. That establishes coverage parity for these tests, not universal equivalence or measured maintenance outcomes.

Use these pairs before grading trial outputs. Give a reviewer each pair in shuffled order with the fixture request and source files, withholding this document, filenames that reveal the pair, arm identity, candidate skills and expected interpretation. Ask for a preference or justified tie, exact code evidence, one future change, and a failure rehearsal. Score the reasoning against the anchors below after the reviewer answers. A second reviewer should adjudicate disagreements before trial identities are revealed. These are calibration examples, not held-out trials or evidence that the proposed skill improves model behavior.

## Settlement pair

Both preserve the public `Ledger` API, one SQLite connection, atomic batch behavior, fencing and exact retries. `settlement-a.py:80` owns the transaction and delegates one complete operation to `_settle`. `settlement-b.py:53` also owns the transaction correctly, but its caller must sequence checking, debit, credit and receipt recording at lines 57-63. The collaborators at lines 68, 98 and 109 share storage; they do not duplicate balances or commit independently.

A grounded preference for A identifies the additional internal coordination contract in B. Rehearse a transfer fee: source validation and debit amount must agree, the recipient still gets the transfer amount, and replay must remain idempotent. In A, inspect one complete operation plus the transaction wrapper. In B, inspect `ReceiptChecks.check`, `AccountWrites.debit`, the coordinator and any fee recording change. The issue is the decision spread, not the class count. Both designs still require a deliberate fee contract, persistence handling and tests.

A strong review can defend B if it establishes a concrete independently useful decision those collaborators hide and shows that fee and failure changes do not increase coordination. Merely pointing at shorter methods is insufficient. A review falsely asserting that B currently commits prefixes, copies authoritative balances or has a demonstrated race fails factual accuracy. A recommendation to merge every helper regardless of its hidden algorithm fails proportionality. Lowering cyclomatic complexity is not evidence of a better outcome.

## Validation pair

Both preserve the existing exported functions and implement the requested international project names without changing device codes. `validation-a.ts` keeps the two domain policies explicit. `validation-b.ts:3` introduces an eight-field internal configuration; lines 13-21 interpret combinations and lines 24-28 select them. It remains private, so claiming that public callers must configure these flags is false.

A grounded preference for A weighs B's additional combination space and dynamic pattern construction against just two known policies. Rehearse allowing underscores in project names while keeping device provisioning unchanged. A changes one policy expression. B must extend the shared alphabet logic or add another option, then establish that the device configuration is unaffected. A can still share a bounded mechanical helper later. A next change solely increasing the project maximum is equally local in both designs; citing that change alone cannot support a strong preference.

A justified tie or preference for B can pass if it names a real benefit from the current contract and accounts for the configuration cost without inventing consumers. Reject blanket rules against all configuration or all duplicated expressions. Calling B behaviorally broken solely because it is configurable fails factual accuracy. Calling A deficient solely because it retains similar length checks fails the commonality test.

## Grading dimensions

Rate each dimension independently as supported, partial or unsupported, with a source location and reason:

- Behavioral accuracy: recognizes the verified parity and keeps claims within the supplied contract.
- Hidden knowledge: names what the internal caller still coordinates, distinguishing that from the public API.
- Change locality: rehearses a discriminating change across the actual code rather than counting files or repeating a slogan.
- Proportionality: allows different valid boundaries and weighs the full additional contract against a concrete benefit.

A persuasive answer with a factual error remains factually wrong. A preferred specimen named without the causal explanation earns no design-quality credit. Do not collapse these dimensions into an automatic pass from the behavior checks. Record reviewer disagreement and its adjudication, including cases where the anchors prove too prescriptive.
