# Baseline

Model: `openai-codex/gpt-5.6-sol`

Three isolated runs completed the task without a skill. All three made one traversal the owner, preserved the public interface, and passed the tests. Two added explicit ordering independent of edge declaration order. One used the existing group order directly.

This case is a useful regression case, but it does not currently separate skilled from unskilled behavior on this model. Do not use it alone to justify the skill.
