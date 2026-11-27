#!/usr/bin/env bash
# PreToolUse (Edit|Write). Changes to the approved intent and spec docs (docs/intent, docs/spec) ask
# first. Ticket files (docs/tickets) stay editable.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty')

if [[ $path =~ (^|/)docs/(intent|spec)/ ]]; then
  jq -cn --arg p "$path" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:("Approved doc " + $p + " (intent or spec). Confirm this change first.")}}'
  exit 0
fi

exit 0
