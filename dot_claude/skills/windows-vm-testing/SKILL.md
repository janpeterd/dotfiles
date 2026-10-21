---
name: windows-vm-testing
description: Test a commit on Windows through the local Windows VM, whose Claude Code agent runs the task and reports back. Use when a change needs Windows verification (paths, encodings, processes, file locks, SQLite or SpatiaLite) or the user asks to test on Windows. Skip for checks the Linux suite already covers.
---

# Windows VM testing

The VM is a dockur Windows 11 container in `~/Code/Programs/windows-docker`. Its Claude Code agent runs headless
over SSH, one task at a time. `winvm` (on PATH, `winvm --help`) owns every mechanical step; you write the task.

## Steps

1. **Start:** `winvm up`. Done when it prints "VM ready over SSH". If the private index is unreachable, the VITO
   jumphost or VPN has expired: ask the user to reconnect, then run it again.
2. **Package:** from the repository, `winvm send --ref REF` (add `--file PATH` for wheels or probe scripts). It
   opens `shared/tasks/NNN/` and prints each file's SHA256. The bundle builds on the VM checkout's current head,
   so the VM never needs network access to Git.
3. **Write the task:** `shared/tasks/NNN/task.md`. Model it on the latest `shared/tasks/*/task.md`:
   - what changed since the agent's last task, in two or three lines;
   - a Files block with each name and SHA256;
   - numbered steps, each with the exact command and the expected result, including known expected failures;
   - the files to publish in the task folder.
4. **Run:** `winvm run NNN` in the background. It blocks until the agent finishes and fails unless
   `tasks/NNN/report.md` exists. The agent's full transcript is `tasks/NNN/agent.log`.
5. **Check the report** against the published logs before relaying it. A follow-up is a new task number; never
   edit a file you or the agent already wrote.

Done when the report answers every step of the task, with logs for every test result it claims.

## Rules

- **Never overwrite or delete a file in Shared.** The Windows SMB client caches old metadata and the file becomes
  unreadable. Publish every version under a new name; `winvm` refuses reused task numbers.
- In Geoflow Core, 3 `test_database_roles` errors are expected: the test role lacks CREATEROLE.
- The Windows test database (`geoflow_test`) is migrated by whichever branch ran last; a branch with older
  migrations refuses it. Reset it only while no task runs, from the host: in one transaction drop schema
  `geoflow` and the `inspection_bounds_*` tables, then `CREATE SCHEMA geoflow AUTHORIZATION geoflow_test`
  (`docker exec geoflow-windows-services-postgres-1 psql -U postgres -d geoflow_test`).

## Reference

- Host setup, services and history: `~/Code/Programs/windows-docker/README.md`; `./dev status` checks services.
- Layout of Shared: `shared/README.md`. Tasks before 015 are in `shared/archive/`.
- Inside Windows: `shared/setup/WINDOWS-DEV-README.md` (the `gfdev` helper, test database, tunnel).
- SSH: `127.0.0.1:2222`, key `~/.ssh/windows-vm_ed25519`, PowerShell as the remote shell. A fresh VM needs
  `shared/setup/bootstrap-ssh.ps1` once, run elevated (over SSH with the VM password, or from the desktop at
  http://127.0.0.1:8006).
