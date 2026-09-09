# JP skills

My personal collection of AI skills for software design, implementation, review, and user interface work.

Skills are developed against realistic cases mined from working systems. Repository code is evidence, not assumed best practice. A skill change is promoted only when blinded comparisons show better task outcomes without harmful false positives.

## Linux setup

This project lives in the `jp-skills/` directory of my dotfiles repository. Run commands from this directory. Install Bash 4.3 or newer, Python 3 (`python3`), ripgrep (`rg`), and GNU coreutils, diffutils, and findutils.

Agent evals also require the `pi` CLI on `PATH`, authenticated for the providers being tested. Individual fixtures may require additional tools such as Node.js and pnpm; see their manifests and package files.

For skill authoring, install the `writing-for-agents` skill and its linked `SKILL-MECHANICS.md` in your agent's skill directory.

## Checks

```bash
./scripts/check
```

Run one isolated case with `scripts/run-case`. Run proposed, prior, and skill-absent arms across the configured model families with `scripts/run-bakeoff`.

## Eval sources

Cases include examples drawn from projects I work on, including Geoflow. The `source.repository` and `source.commit` fields record provenance only, not checkout paths or runtime dependencies. Each case runs against its bundled `fixture/`; the original repository is not required.

Temporary workspaces use `TMPDIR` when set, otherwise `/tmp`. Results are saved under the ignored `runs/` directory; `RUN_ROOT` overrides the output directory for `run-case`.

## Installation and editing

Chezmoi manages links in `~/.agents/skills/` to this source directory. The links use `{{ .chezmoi.sourceDir }}` so each machine resolves its own dotfiles checkout. Skill installation is shared across agents and does not change agent-specific settings.

After pulling dotfiles, apply only the shared skills:

```bash
chezmoi apply --include=dirs,symlinks ~/.agents/skills
```

Edit the skills, evals, and scripts here and commit them in the parent dotfiles repository. The project is ignored by chezmoi deployment so eval fixtures and research stay in the source checkout. Git still tracks the complete project.

Imported from the standalone JP skills repository at commit `46a9cc067290c521744a15df372e0a9206ac30b6`. The original checkout retains its Git history; this directory is the maintained copy.
