# Surface checks

Read only the branches the scoped journey crosses.

## Web and native UI

- The first viewport communicates the primary object or action without generic orientation copy.
- Primary actions, full-row actions, navigation, focus, keyboard behavior, and destructive actions are predictable.
- Loading, empty, partial, unavailable, success, and error states use established components and truthful language.
- Remote values truncate or wrap intentionally. Narrow, wide, light, and dark presentations remain equivalent where supported.
- Statuses, icons, colors, labels, spacing, and control variants come from canonical mappings and the design system.
- Accessibility names, focus order, validation associations, and touch targets describe the actual action.

## API

- Resource names, field names, casing, enum values, status codes, error shapes, pagination, and nullability agree across endpoints and schemas.
- Errors distinguish invalid input, absence, conflict, permission, dependency failure, and temporary unavailability without leaking internals or promising unsafe retry.
- Examples and generated or handwritten documentation execute against the current contract.
- Deprecation and compatibility surfaces have a named consumer, migration window, and removal condition.

## CLI and scripts

- Command names, arguments, help, examples, prompts, progress, and completion messages use one vocabulary.
- stdout, stderr, exit codes, TTY and machine-readable modes, `--dry-run`, and partial side effects match their documented contracts.
- Errors identify the failed operation, what changed or remained unchanged, and the next valid action.
- Interrupts, reruns, missing input, invalid configuration, network failure, and filesystem failure leave an understandable state.

## Libraries and internal developer products

- The caller is the user. Names, signatures, types, errors, examples, and import paths form one small, accurate interface.
- Documentation and examples use supported public APIs and current terminology.
- Preserve exact technical language when friendlier wording would lose meaning. Do not invent a user journey for a local utility that already has a coherent contract.
