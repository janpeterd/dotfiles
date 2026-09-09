#!/usr/bin/env bash
set -euo pipefail

mkdir -p artifacts
pnpm exec vite --host 127.0.0.1 --port 4317 >artifacts/vite.log 2>&1 &
server_pid=$!

cleanup() {
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT

for attempt in {1..40}; do
  if curl --fail --silent http://127.0.0.1:4317 >/dev/null; then
    break
  fi
  sleep 0.25
done
curl --fail --silent http://127.0.0.1:4317 >/dev/null

capture() {
  local name=$1 width=$2 height=$3 scheme=$4 session
  session=$(agent-browser session id --scope worktree --prefix "visual-${name}")
  agent-browser --session "$session" set viewport "$width" "$height" >/dev/null
  agent-browser --session "$session" set media "$scheme" >/dev/null
  agent-browser --session "$session" open http://127.0.0.1:4317 >/dev/null
  agent-browser --session "$session" wait --load networkidle >/dev/null
  overflow=$(agent-browser --session "$session" eval "document.documentElement.scrollWidth > window.innerWidth")
  if [[ "$overflow" != "false" ]]; then
    printf 'horizontal overflow in %s: %s\n' "$name" "$overflow" >&2
    exit 1
  fi
  natural_case=$(agent-browser --session "$session" eval --stdin < tests/natural-case.js)
  if [[ "$natural_case" != "true" ]]; then
    printf 'all-caps interface text in %s\n' "$name" >&2
    exit 1
  fi
  agent-browser --session "$session" screenshot "artifacts/${name}.png" >/dev/null
  agent-browser --session "$session" close >/dev/null
}

capture desktop-light 1440 900 light
capture desktop-dark 1440 900 dark
capture mobile-light 390 844 light
capture mobile-dark 390 844 dark

test -s artifacts/desktop-light.png
test -s artifacts/desktop-dark.png
test -s artifacts/mobile-light.png
test -s artifacts/mobile-dark.png

if cmp --silent artifacts/desktop-light.png artifacts/desktop-dark.png; then
  printf 'desktop light and dark screenshots are identical\n' >&2
  exit 1
fi

if cmp --silent artifacts/mobile-light.png artifacts/mobile-dark.png; then
  printf 'mobile light and dark screenshots are identical\n' >&2
  exit 1
fi
