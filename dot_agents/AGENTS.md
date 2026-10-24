# Global agent instructions

## Shell

Commands run in a **non-interactive shell** (zsh here; some agents use bash).
Interactive config (`.zshrc`, aliases, functions) is not loaded, so do not rely
on it.

- Write **bash-compatible** commands. Quote every expansion (`"$var"`,
  `"$(cmd)"`); zsh does not word-split unquoted parameters like bash.
- For bash-only features (`declare -a`, `mapfile`/`readarray`, `local -n`,
  `shopt`, `${var,,}`), wrap the snippet in `bash -lc '...'` or put it in a
  `#!/usr/bin/env bash` script.
- Use `command -v tool`, not `which tool`.
- Do not use zsh-only syntax in portable commands: glob qualifiers (`*(.)`),
  `setopt`, `zmodload`, `print -l`, `${(f)...}`, `$^array`.
- Do not `source ~/.zshrc` to obtain aliases; call the underlying command.

## Dotfiles

`$HOME` is managed by chezmoi. For dotfile changes, edit the source in
`~/.local/share/chezmoi` (or run `chezmoi edit --apply <path>`), then apply;
never edit a managed file directly in `$HOME`. Check drift with
`chezmoi status` and `chezmoi diff`. Machine-local secrets belong in
`~/.zshenv.local`.

## Tooling

- Prefer `rg`, `fd`, and `bat` when available.
- `java` and `mvn` default to sdkman's current versions; `sdk use` switches
  versions for the current shell.
