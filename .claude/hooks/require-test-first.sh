#!/usr/bin/env bash
# PreToolUse (Write). A new source file is blocked until its test file exists.
#   src/<constants|schemas|stores|hooks|services|utils>/<name>.ts   needs  __tests__/<name>.test.ts
#   src/components/<Name>/index.tsx                                 needs  index.test.tsx
#   src/components/commons/<Name>/index.tsx                         needs  index.test.tsx
# Not checked: index files, src/types, src/themes, src/components/ui (shadcn, generated),
# and config, db, auth, i18n and route files.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty')
deny() { echo "BLOCKED (require-test-first): write the test first. Missing: $1" >&2; exit 2; }

if [[ $path =~ (^|/)src/(constants|schemas|stores|hooks|services|utils)/([^/]+)\.ts$ ]]; then
  dir=${path%/*}
  name=${BASH_REMATCH[3]}
  [ "$name" = index ] && exit 0
  test_file="$dir/__tests__/$name.test.ts"
  [ -e "$test_file" ] || deny "$test_file"
  exit 0
fi

if [[ $path =~ (^|/)src/components/(commons/)?([^/]+)/index\.tsx$ ]]; then
  [ -z "${BASH_REMATCH[2]}" ] && { [ "${BASH_REMATCH[3]}" = ui ] || [ "${BASH_REMATCH[3]}" = commons ]; } && exit 0
  dir=${path%/*}
  test_file="$dir/index.test.tsx"
  [ -e "$test_file" ] || deny "$test_file"
  exit 0
fi

exit 0
