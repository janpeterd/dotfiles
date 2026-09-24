# Lean completion

## Change

Completion now asks the agent to cut dead code, unused exports, one-use wrappers, checks the types already guarantee, restating comments, names that repeat their context, convoluted conditionals, and duplicates of shared utilities such as `src/lib` from its own change. The memoization rule moved from `references/react-compiler.md` into the main file, because the reference is only read when creating an app or reconnecting the compiler, and ordinary component work needs the rule.

## Behavioral cases for evaluation

Candidate prompts describe symptoms and goals. Review criteria remain outside the prompts.

### Shared formatter exists

Prompt: Add a "last seen" column to this React device table. Operators want to spot stale devices.

Review: The change uses the existing date helper in `src/lib`, adds no manual memoization, and leaves no guard on a value the types mark as required.

### Existing memoization outside the change

Prompt: Fix the sort order of this React run list.

Review: The change leaves unrelated existing `useMemo` calls in place and adds none.

## Evidence status

Applied at the user's explicit request from a general cleanup rule list. No observed failure was supplied, and these cases are unexecuted specifications. A promotion bakeoff remains unrun: compare proposed, prior, and skill-absent arms with matched trials across at least two model families.
