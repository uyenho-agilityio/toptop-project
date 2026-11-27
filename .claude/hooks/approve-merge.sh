#!/usr/bin/env bash
# PreToolUse (mcp__github__merge_pull_request|Bash). Every merge asks the user first (gate 3),
# whether it goes through the GitHub MCP tool or `gh pr merge`.
# The hook cannot read CI or review state itself; the prompt tells the user to check them.
set -uo pipefail

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')

ask() {
  jq -cn --arg pr "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:("Merge PR " + $pr + "? Check CI state and the review verdict on GitHub before approving (gate 3).")}}'
  exit 0
}

if [ "$tool" = Bash ]; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
  if [[ $cmd =~ gh[[:space:]]+pr[[:space:]]+merge([[:space:]]+([^[:space:]-][^[:space:]]*))? ]]; then
    ask "${BASH_REMATCH[2]:-of the current branch}"
  fi
  exit 0
fi

pr=$(printf '%s' "$input" | jq -r '.tool_input.pull_number // .tool_input.pullNumber // "unknown"')
ask "#$pr"
