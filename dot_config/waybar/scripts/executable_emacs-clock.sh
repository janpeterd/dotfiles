#!/bin/bash

string_cutoff=35

function json() {
    jq --unbuffered --null-input --compact-output \
        --arg text "$1" \
        --arg alt "$2" \
        --arg tooltip "$3" \
        --arg class "$4" \
        '{"text": $text, "alt": $alt, "tooltip": $tooltip, "class": $class}'
}

if pgrep -xl emacs >/dev/null 2>&1 && command -v emacsclient >/dev/null 2>&1; then
    org_task="$(
        emacsclient -e '(if (org-clock-is-active) (substring-no-properties (org-clock-get-clock-string)) "")' | tr -d '"' | sed s/\&/\&amp\;/
    )"
    if [[ "$org_task" ]]; then
        if [[ "$(echo "$org_task" | wc -m)" -gt $string_cutoff ]]; then
            json "$(printf '%.'"$string_cutoff"'s...' "$org_task")" "clocking" "$org_task" "clocking"
        else
            json "$org_task" "clocking" "$org_task" "clocking"
        fi
    else
        json "" "nothing" "" "nothing"
    fi
fi
