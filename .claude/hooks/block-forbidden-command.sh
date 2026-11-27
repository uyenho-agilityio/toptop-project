#!/usr/bin/env bash
# PreToolUse (Bash). Blocks pushes to the protected branches.
# Secret files (reading, changing, git add) are guarded by protect-secrets.sh.
# Exit 2 blocks the call; exit 0 allows it.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

protected_re='^main$'
deny() { echo "BLOCKED (block-forbidden-command): $1" >&2; exit 2; }

# Each command in a chain (&&, ||, ;, |) is checked on its own.
segments=$(printf '%s' "$cmd" | sed -E 's/&&|\|\||;|\|/\n/g')

while IFS= read -r seg; do
  read -ra t <<< "$seg"
  for ((i = 0; i < ${#t[@]}; i++)); do
    [ "${t[i]}" = git ] || continue
    sub=${t[i+1]:-}

    if [ "$sub" = push ]; then
      for tok in "${t[@]:i+2}"; do
        case "$tok" in --all|--mirror) deny "git push --all / --mirror is not allowed" ;; esac
      done
      current=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
      positional=0
      pushed_any=0
      for tok in "${t[@]:i+2}"; do
        case "$tok" in -*) continue ;; esac
        positional=$((positional + 1))
        [ "$positional" -eq 1 ] && continue          # first positional is the remote
        pushed_any=1
        src=${tok%%:*}
        dst=${tok#*:}
        [ "$dst" = "$tok" ] && dst=$src               # no colon: destination is the same name
        dst=${dst#refs/heads/}
        [[ $dst =~ $protected_re ]] && deny "push to protected branch '$dst' (use a PR into main)"
        if [ "$dst" = HEAD ] && [[ $current =~ $protected_re ]]; then
          deny "push of HEAD while on protected branch '$current'"
        fi
      done
      if [ "$pushed_any" -eq 0 ] && [[ $current =~ $protected_re ]]; then
        deny "bare git push while on protected branch '$current'"
      fi
    fi
  done
done <<< "$segments"

exit 0
