#!/usr/bin/env bash
# PreToolUse (Read|Edit|Write|Bash). The one place that guards secret files: local env files,
# Cloudflare .dev.vars and the saved Playwright sign-in state. Blocks reading, changing and
# staging them (git add), and any Bash command that names one. The .example files are allowed.
set -uo pipefail

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
deny() { echo "BLOCKED (protect-secrets): $1" >&2; exit 2; }

# The single list of secret files.
is_secret_path() {
  local p=$1 base
  base=${p##*/}
  [ "$base" = ".env.example" ] && return 1
  [[ $base =~ ^\.env(\..*)?$ ]] && return 0
  [ "$base" = ".dev.vars.example" ] && return 1
  [[ $base =~ ^\.dev\.vars(\..*)?$ ]] && return 0
  [[ $p == *playwright/.auth/* ]] && return 0
  return 1
}

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    # Split on whitespace, quotes, shell operators and redirections, then check each word.
    words=$(printf '%s' "$cmd" | tr "\"';|&<>()=" '          ')
    for w in $words; do
      is_secret_path "$w" && deny "command names the secret file '$w'"
    done
    ;;
  Read|Edit|Write)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
    is_secret_path "$path" && deny "'$path' is a local secret or sign-in file"
    ;;
esac

exit 0
