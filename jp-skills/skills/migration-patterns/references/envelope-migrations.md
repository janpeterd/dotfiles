# Envelope migrations

Use envelope migrations only for persisted JSON that may remain stale across releases and must stay readable. Do not version transient request, response, or internal models by default.

Store the module under `migrations/envelopes/`:

```text
migrations/envelopes/
  registry.py
  schemas.py
  versions/
    v1_to_v2.py
    v2_to_v3.py
```

Give every persisted envelope an integer `schema_version`. Name Pydantic models `EnvelopeV1`, `EnvelopeV2`, and so on, with `schema_version: Literal[1]` for each concrete schema.

Expose one deep interface:

```python
def migrate_envelope(
    document: JsonObject,
    *,
    target_version: int = CURRENT_VERSION,
) -> JsonObject:
    ...
```

Each registered function accepts one JSON object, returns a new JSON object, and advances exactly one version. It is deterministic and performs no database, network, filesystem, logging, or ambient-configuration work. Validate the source and every intermediate output against its Pydantic schema. Reject missing, malformed, unsupported, and future versions. Do not mutate the input.

Migrate stale data in memory on read and write only the current version. Do not silently rewrite a database row during a read. Use a separate bounded, resumable, concurrency-safe backfill when stored rows should be rewritten.

Envelope migration is forward-only. Keep historical JSON fixtures immutable. Test each adjacent step, every historical version to current, current-version no-op behavior, input immutability, malformed intermediate output, missing registry steps, and future-version rejection.
