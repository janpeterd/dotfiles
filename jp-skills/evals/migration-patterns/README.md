# Migration pattern evals

These cases measure database migration history, multi-dialect parity, rollback evidence, and selective persisted-envelope versioning.

Database checks and envelope checks remain separate because they have different rollback and compatibility contracts.
