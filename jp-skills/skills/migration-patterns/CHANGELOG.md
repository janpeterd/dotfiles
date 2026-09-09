# Candidate history

## Initial candidate

- Recorded the explicit convention that every supported database executes one Alembic chain and has a separate round-trip integration test. The skill-absent model already met the case, so this remains an unpromoted candidate pending a matched multi-model bakeoff. Evidence: `../../evals/migration-patterns/cases/multi-dialect-chain/baseline.md`.
- Recorded the selective forward-only envelope design for persisted stale JSON. The skill-absent model also met this case. Evidence: `../../evals/migration-patterns/cases/envelope-chain/baseline.md`.
- Kept envelope migration inactive for transient models. Evidence: `../../evals/migration-patterns/cases/ordinary-response-model/baseline.md`.
