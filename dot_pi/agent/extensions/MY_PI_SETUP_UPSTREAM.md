# Vendored Pi extensions

The `subagents/` and `workflows/` extensions, the workflow helpers in `shared/`, and `../skills/subagents/` are vendored from:

- Repository: <https://github.com/davis7dotsh/my-pi-setup>
- Commit: `d8534d7e6ec6609b7e684a8a0eb2e7a0195115ba`

`workflows/package.json` and its lockfile are local packaging additions so chezmoi can install the workflow runtime dependency (`acorn`) independently.

Runtime dependencies are installed by:

```text
run_onchange_after_20-install-pi-extension-deps.sh.tmpl
```
