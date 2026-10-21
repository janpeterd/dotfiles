#!/bin/sh
set -eu

# Yazi pins plugin revisions in ~/.config/yazi/package.toml. That file stays
# machine-local; this list is the shared part. Re-runs whenever the list changes.
plugins="
yazi-rs/plugins:toggle-pane
yazi-rs/plugins:mount
yazi-rs/plugins:git
yazi-rs/plugins:piper
yazi-rs/plugins:vcs-files
yazi-rs/plugins:smart-enter
yazi-rs/plugins:zoom
"

if ! command -v ya >/dev/null 2>&1; then
  echo "Skipping Yazi plugins: yazi is not installed" >&2
  exit 0
fi

installed=$(ya pkg list 2>/dev/null || true)
for plugin in $plugins; do
  if printf '%s\n' "$installed" | grep -q "[[:space:]]$plugin "; then
    continue
  fi
  echo "Adding Yazi plugin $plugin"
  ya pkg add "$plugin"
done

# Fetch anything package.toml lists but the plugins directory lacks.
if ! ya pkg install; then
  echo "ya pkg install failed; a stale clone in ~/.cache/yazi/packages is the usual cause" >&2
fi
