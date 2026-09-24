# Review autonomy pilot

Observed failures: vague depth language permits a directory survey to stand in for a review; compulsory recursive dispatch and report states prescribe execution even when one reviewer can trace the behavior. Size and maintainability scores can reward moving complexity into glue.

Compare the frozen current and revised system-and-simplicity-review bundles on the same IOW revision and alerting, batch and monitoring scope. Two GPT-6 Astra Codex reviewers only, same reasoning settings and organic prompt, read-only on the API. No additional model calls. This overrides delegation instructions equally in both arms and tests coverage under that constraint, not the value of delegation itself. Freeze the bundles before starting either reviewer. Keep run artifacts outside this repository.

Judge concrete evidence rather than prose length or vocabulary. Compare entry points and lifecycles traced, state and transaction ownership, material failure and concurrency paths, affected callers, tests actually inspected, algorithm and representation reasoning, peer consistency, source-correct findings, concrete interfaces, preserved guarantees, and uncertainty. Spot-check findings and omissions against source independently. A confident invented defect is worse than an explicit evidence limit. A useful KEEP requires a real alternative and the invariant it would lose.

Counterexamples: a cohesive large owner should not be split for length; a useful private extraction should not be rejected for having one consumer; validation at an external boundary should not be cut as defensive noise. Smaller files and shorter reports do not establish improvement.

Stop after these two reviews, a source-grounded comparison and deterministic repository checks. One run per version on one repository provides pilot evidence, not a statistically reliable model comparison. Do not expand to a model bakeoff or another judge agent without user authorization.

Run `python evals/review-autonomy/check-collector.py` for the bounded collector checks. The fixture verifies snapshot selection, multiple scopes, target code never being imported, method/closure accounting, a legitimate large file, parse failure and output outside the target repository.

## Observed pilot outcome

On IOW revision `443c87d163ff1c9c2834520d950f40800f6d1d42`, both Astra reviewers traced all 24 scoped files and relevant callers, ran selected local tests, produced failure probes and retained the main state owners. The revised wording preserved depth without the compulsory report tree. The previous wording produced stronger suppression/retry and stale-policy locking proposals; the revised run reproduced a production session-setting mismatch and premature HTTP success after commit failure. Keep the wording change, with no claim of general superiority or lower token cost from this single unblinded comparison. Both runs prohibit further agents, so this is not a test of delegation's value. No API fixes were made.
