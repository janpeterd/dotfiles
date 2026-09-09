# Database migrations

Use Alembic for Python relational database migrations. Store revisions under `migrations/database/versions/` with date-prefixed descriptive filenames. Let `revision` and `down_revision` define order.

Maintain one append-only chain and one head. Add a child or merge revision for new work. Never rewrite a revision that may have run outside the current private checkout.

## Multiple databases

All supported engines execute the same revision graph. Prefer portable Alembic operations. When an operation genuinely differs, select the implementation inside the revision using `op.get_bind().dialect.name`. Fail before mutation for unsupported dialects.

Keep SQLite and PostgreSQL migration tests separate. Each test owns its engine setup and independently proves the same logical contract. Do not treat SQLite success as PostgreSQL evidence.

## Round-trip test

For each supported engine:

1. Create a real database on that engine.
2. Upgrade through the existing chain to the new revision's `down_revision`.
3. Insert representative old data, including null and boundary cases.
4. Capture the affected logical schema and data.
5. Upgrade to the new revision and assert revision, schema, transformed data, constraints, and indexes.
6. Downgrade to `down_revision` and compare with the captured logical state.
7. Upgrade again and reassert the target state.

Also test an empty database to head, the previous production revision to head, a single head, malformed legacy data, and rollback after an injected failure. Test concurrent legacy writers when they can exist during migration.

Implement and test `downgrade()` when restoration is realistic. For destructive changes that cannot restore information, fail clearly instead of recreating an empty shape and pretending rollback succeeded. Require a verified backup and restoration procedure as separate operational evidence.
