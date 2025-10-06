#!/usr/bin/env bash
# Faster web app picker: non-blocking icon fetch + cached browser exec + small icons

set -euo pipefail

LIST_FILE="${1:-$HOME/.local/share/scripts/webapps.txt}"
ICON_CACHE="${ICON_CACHE:-$HOME/.cache/webapp-icons}"
BROWSER_CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/webapp-browser"
ICON_SIZE="${ICON_SIZE:-64}"       # requires 'magick' (ImageMagick) if present
CURL_OPTS=(--fail --silent --show-error --location --max-time 2 --connect-timeout 1)

mkdir -p "$ICON_CACHE" "$(dirname "$BROWSER_CACHE")"

log() { [[ "${DEBUG:-0}" = "1" ]] && printf '[webapp] %s\n' "$*" >&2 || true; }

# --- cached chromium-family binary for --app ---
pick_chromium() {
  if [[ -s "$BROWSER_CACHE" ]]; then
    cat "$BROWSER_CACHE"
    return 0
  fi

  local browser desktop_exec exec_bin
  browser="$(xdg-settings get default-web-browser 2>/dev/null || true)"
  case "$browser" in
    google-chrome*|brave-browser*|microsoft-edge*|vivaldi*|opera*|chromium*) ;;
    *) browser="chromium.desktop" ;;
  esac

  desktop_exec="$(
    sed -n 's/^Exec=\([^ ]*\).*/\1/p' {~/.local,~/.nix-profile,/usr}/share/applications/"$browser" 2>/dev/null | head -1 || true
  )"
  if [[ -n "$desktop_exec" && -x "$(command -v "$desktop_exec" || true)" ]]; then
    exec_bin="$desktop_exec"
  else
    for cand in chromium google-chrome-stable google-chrome brave microsoft-edge vivaldi opera; do
      if command -v "$cand" >/dev/null 2>&1; then exec_bin="$cand"; break; fi
    done
  fi

  printf '%s' "${exec_bin:-}" | tee "$BROWSER_CACHE"
}

BROWSER_EXEC="$(pick_chromium)"
log "Browser exec: ${BROWSER_EXEC:-<none>}"

# --- parse list & build fuzzel feed (missing icons fetched in background) ---
declare -A URLS
feed="$(mktemp)"
trap 'rm -f "$feed"' EXIT

queue_download() {
  # $1: url of icon, $2: cache_file target
  (
    url="$1"; out="$2"
    # skip if already downloaded (another parallel run)
    [[ -s "$out" ]] && exit 0
    curl "${CURL_OPTS[@]}" "$url" -o "$out" 2>/dev/null || exit 0
    # optional downscale to speed fuzzel rendering
    if command -v magick >/dev/null 2>&1; then
      tmp="${out}.tmp"
      magick "$out" -resize "${ICON_SIZE}x${ICON_SIZE}" "$tmp" 2>/dev/null && mv -f "$tmp" "$out"
    fi
  ) &
}

while IFS='|' read -r name url icon; do
  # ignore empty / comment
  [[ -z "${name:-}" ]] && continue
  if [[ "$(printf '%s' "$name" | sed 's/^[[:space:]]*//')" =~ ^# ]]; then continue; fi

  name="$(printf '%s' "${name:-}" | xargs)"
  url="$(printf '%s' "${url:-}" | xargs)"
  icon="$(printf '%s' "${icon:-}" | xargs)"
  [[ -z "$name" || -z "$url" ]] && continue

  URLS["$name"]="$url"

  icon_path=""
  if [[ -n "$icon" ]]; then
    if [[ "$icon" =~ ^https?:// ]]; then
      cache_file="${ICON_CACHE}/$(printf '%s' "$icon" | sed 's#[^A-Za-z0-9._-]#_#g')"
      if [[ -s "$cache_file" ]]; then
        icon_path="$cache_file"
      else
        # queue download but DON'T block UI; first run shows no icon, next run will
        queue_download "$icon" "$cache_file"
      fi
    elif [[ -f "$icon" ]]; then
      icon_path="$icon"
    fi
  fi

  if [[ -n "$icon_path" ]]; then
    printf '%s\0icon\x1f%s\n' "$name" "$icon_path" >>"$feed"
  else
    printf '%s\n' "$name" >>"$feed"
  fi
done < <(grep -vE '^\s*($|#)' "$LIST_FILE")

[[ -s "$feed" ]] || { echo "No valid entries in $LIST_FILE" >&2; exit 1; }

# --- show picker immediately ---
selection="$(fuzzel --dmenu --prompt='Webapp: ' --icon-theme=hicolor --log-level=error <"$feed" || true)"
[[ -n "${selection:-}" ]] || exit 0

url="${URLS[$selection]+${URLS[$selection]}}"
[[ -n "${url:-}" ]] || { echo "No URL mapped for '$selection'" >&2; exit 1; }

# --- launch ---
if [[ -n "$BROWSER_EXEC" ]]; then
  if command -v uwsm >/dev/null 2>&1; then
    setsid uwsm app -- "$BROWSER_EXEC" --app="$url" >/dev/null 2>&1 &
  else
    setsid "$BROWSER_EXEC" --app="$url" >/dev/null 2>&1 &
  fi
else
  if command -v xdg-open >/dev/null 2>&1; then
    setsid xdg-open "$url" >/dev/null 2>&1 &
  else
    echo "No Chromium-family browser or xdg-open found." >&2
    exit 1
  fi
fi
