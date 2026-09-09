---
name: migration-patterns
description: Use when creating, changing, testing, or reviewing an Alembic database migration or a versioned migration for persisted JSON envelopes. Do not invoke for ordinary model changes whose data is not persisted across releases.
---

# Migration patterns

Keep migration history append-only. Inspect the supported database engines, current heads, production revision, persistence format, writer behavior, and migration commands before editing.

For a review, read repository `CONTEXT.md` and `CODING_STANDARDS.md` when present. Their absence is normal.

For relational database work, read [database migrations](references/database-migrations.md).

For persisted JSON that older releases may have written and current code must still read, read [envelope migrations](references/envelope-migrations.md). Use this branch sparingly.

## Completion

Run focused migration tests and the repository's full migration gate. Report each database engine separately. Separate local evidence from containers, deployment databases, backups, and restoration procedures that were not exercised.
