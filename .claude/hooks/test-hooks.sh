#!/usr/bin/env bash
# Runs sample tool calls against each hook and checks the result.
# Each case pipes a sample tool call into the hook and checks the result:
#   block = exit 2, allow = exit 0 with no decision, ask = exit 0 with permissionDecision "ask".
# Run by hand from the repo root: .claude/hooks/test-hooks.sh   (needs jq and git)
set -uo pipefail

HOOKS_DIR=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0; skip=0
OUT=""; CODE=0

run() { # hook json dir
  # Unset CLAUDE_PROJECT_DIR so hooks resolve paths from the case's dir, not the real project.
  OUT=$(cd "$3" && env -u CLAUDE_PROJECT_DIR "$HOOKS_DIR/$1" 2>&1 <<< "$2"); CODE=$?
}

check() { # name expected hook json dir
  run "$3" "$4" "$5"
  local ok=0
  case "$2" in
    block) [ "$CODE" -eq 2 ] && ok=1 ;;
    allow) [ "$CODE" -eq 0 ] && [[ $OUT != *permissionDecision* ]] && ok=1 ;;
    ask)   [ "$CODE" -eq 0 ] && [[ $OUT == *'"permissionDecision":"ask"'* ]] && ok=1 ;;
  esac
  if [ "$ok" -eq 1 ]; then
    pass=$((pass + 1)); printf 'PASS  %-24s %-6s %s\n' "$3" "$2" "$1"
  else
    fail=$((fail + 1)); printf 'FAIL  %-24s %-6s %s  (exit %s)\n      %s\n' "$3" "$2" "$1" "$CODE" "$OUT"
  fi
}

skipped() { # name hook reason
  skip=$((skip + 1)); printf 'SKIP  %-24s %s\n      %s\n' "$2" "$1" "$3"
}

bash_json() { jq -cn --arg c "$1" '{tool_name:"Bash",tool_input:{command:$c}}'; }
file_json() { jq -cn --arg t "$1" --arg p "$2" '{tool_name:$t,tool_input:{file_path:$p}}'; }
merge_json() { jq -cn '{tool_name:"mcp__github__merge_pull_request",tool_input:{pull_number:6}}'; }

# --- fixtures -------------------------------------------------------------------------------
mkdir -p "$TMP/on-base" "$TMP/feature"
git init -q -b main "$TMP/on-base"
git -C "$TMP/on-base" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "chore: base"
git -C "$TMP/on-base" update-ref refs/remotes/origin/main HEAD

git init -q -b feat/t-04-source-label "$TMP/feature"
git -C "$TMP/feature" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "chore: base"
git -C "$TMP/feature" update-ref refs/remotes/origin/main HEAD
git -C "$TMP/feature" -c user.name=test -c user.email=test@test commit -q --allow-empty -m "feat: step"
git -C "$TMP/feature" branch main HEAD

printf 'TRUNCATE orders;\n' > "$TMP/wipe.sql"
mkdir -p "$TMP/drizzle"
printf 'create table business (id uuid);\n' > "$TMP/drizzle/0000_init.sql"

PLAIN="$TMP"

# --- block-forbidden-command.sh -------------------------------------------------------------
H=block-forbidden-command.sh
check "git push to main"                        block $H "$(bash_json 'git push origin main')" "$PLAIN"
check "git push HEAD while on main"             block $H "$(bash_json 'git push origin HEAD')" "$TMP/on-base"
check "bare git push while on main"             block $H "$(bash_json 'git push')" "$TMP/on-base"
check "chained force push to main"              block $H "$(bash_json 'cd x && git push --force origin main')" "$PLAIN"
check "git push --all"                          block $H "$(bash_json 'git push origin --all')" "$PLAIN"
check "git add -f .env.local"                   block $H "$(bash_json 'git add -f .env.local')" "$PLAIN"
check "git add .dev.vars"                       block $H "$(bash_json 'git add .dev.vars')" "$PLAIN"
check "git add playwright/.auth/user.json"      block $H "$(bash_json 'git add playwright/.auth/user.json')" "$PLAIN"
check "git add .env.example"                    allow $H "$(bash_json 'git add .env.example')" "$PLAIN"
check "git add .dev.vars.example"               allow $H "$(bash_json 'git add .dev.vars.example')" "$PLAIN"
check "git push to a feature branch"            allow $H "$(bash_json 'git push -u origin feat/t-01-data-model')" "$TMP/feature"

# --- block-destructive-db.sh ----------------------------------------------------------------
H=block-destructive-db.sh
check "drizzle-kit drop"                        block $H "$(bash_json 'pnpm drizzle-kit drop')" "$PLAIN"
check "drizzle-kit push --force"                block $H "$(bash_json 'pnpm drizzle-kit push --force')" "$PLAIN"
check "neonctl branches delete"                 block $H "$(bash_json 'neonctl branches delete main')" "$PLAIN"
check "psql DROP TABLE"                         block $H "$(bash_json 'psql "$DB_URL" -c "DROP TABLE orders"')" "$PLAIN"
check "psql -f wipe.sql (TRUNCATE)"             block $H "$(bash_json 'psql "$DB_URL" -f wipe.sql')" "$TMP"
check "psql DELETE FROM without WHERE"         block $H "$(bash_json 'psql "$DB_URL" -c "DELETE FROM orders"')" "$PLAIN"
check "psql DELETE FROM with WHERE"             allow $H "$(bash_json 'psql "$DB_URL" -c "DELETE FROM orders WHERE id = 1"')" "$PLAIN"
check "drizzle-kit generate"                    allow $H "$(bash_json 'pnpm drizzle-kit generate')" "$PLAIN"
check "drizzle-kit push"                        allow $H "$(bash_json 'pnpm drizzle-kit push')" "$PLAIN"

# --- protect-secrets.sh ---------------------------------------------------------------------
H=protect-secrets.sh
check "Read .env.local"                         block $H "$(file_json Read .env.local)" "$PLAIN"
check "Read .dev.vars"                          block $H "$(file_json Read .dev.vars)" "$PLAIN"
check "Bash cat .env.local"                     block $H "$(bash_json 'cat .env.local')" "$PLAIN"
check "Bash cat .dev.vars"                      block $H "$(bash_json 'cat .dev.vars')" "$PLAIN"
check "Bash grep KEY .env.production.local"     block $H "$(bash_json 'grep KEY .env.production.local')" "$PLAIN"
check "Bash cat playwright/.auth/user.json"     block $H "$(bash_json 'cat playwright/.auth/user.json')" "$PLAIN"
check "Read .env.example"                       allow $H "$(file_json Read .env.example)" "$PLAIN"
check "Edit .env.example"                       allow $H "$(file_json Edit .env.example)" "$PLAIN"
check "Edit .dev.vars.example"                  allow $H "$(file_json Edit .dev.vars.example)" "$PLAIN"
check "Bash cat .dev.vars.example"              allow $H "$(bash_json 'cat .dev.vars.example')" "$PLAIN"

# --- protect-migrations.sh ------------------------------------------------------------------
H=protect-migrations.sh
check "Edit existing 0000_init.sql"            block $H "$(file_json Edit "$TMP/drizzle/0000_init.sql")" "$PLAIN"
check "Write new 0001 migration"               allow $H "$(file_json Write "$TMP/drizzle/0001_add_index.sql")" "$PLAIN"
check "Edit src schema file"                   allow $H "$(file_json Edit "$TMP/src/db/schema.ts")" "$PLAIN"

# --- approve-merge.sh -----------------------------------------------------------------------
H=approve-merge.sh
check "merge_pull_request asks"                ask   $H "$(merge_json)" "$PLAIN"

# --- check-commit-message.sh ----------------------------------------------------------------
H=check-commit-message.sh
check "one-line docs commit"                   allow $H "$(bash_json 'git commit -m "docs: add M1 intent and spec"')" "$PLAIN"
check "commit with a body paragraph"           block $H "$(bash_json 'git commit -m "docs: add x" -m "body text"')" "$PLAIN"
check "commit with Co-Authored-By trailer"     block $H "$(bash_json "$(printf 'git commit -m "docs: add x\n\nCo-Authored-By: Someone <a@b.c>"')")" "$PLAIN"
check "subject without <type>:"                block $H "$(bash_json 'git commit -m "add some stuff"')" "$PLAIN"
check "subject over 72 characters"             block $H "$(bash_json "git commit -m \"feat: $(printf 'x%.0s' $(seq 1 80))\"")" "$PLAIN"
check "git commit without -m"                  block $H "$(bash_json 'git commit --amend --no-edit')" "$PLAIN"

# --- protect-approved-docs.sh ---------------------------------------------------------------
H=protect-approved-docs.sh
check "Edit docs/spec/m1-foundation.md"        ask   $H "$(file_json Edit docs/spec/m1-foundation.md)" "$PLAIN"
check "Edit docs/intent/m1-foundation.md"      ask   $H "$(file_json Edit docs/intent/m1-foundation.md)" "$PLAIN"
check "Edit a ticket file"                     allow $H "$(file_json Edit docs/tickets/T-01.md)" "$PLAIN"
check "Edit README.md"                         allow $H "$(file_json Edit README.md)" "$PLAIN"

# --- check-branch-base.sh -------------------------------------------------------------------
H=check-branch-base.sh
check "new branch from origin/main"            allow $H "$(bash_json 'git switch -c feat/t-04-source-label origin/main')" "$TMP/feature"
check "new branch from a feature branch"       block $H "$(bash_json 'git switch -c feat/t-05-formatting')" "$TMP/feature"
check "worktree from main (not origin/main)"   block $H "$(bash_json 'git worktree add -b x ../x main')" "$TMP/feature"
check "worktree from origin/main"              allow $H "$(bash_json 'git worktree add -b x ../x origin/main')" "$TMP/feature"

# --- format-on-edit.sh ----------------------------------------------------------------------
H=format-on-edit.sh
printf 'const a = {b:1}\n' > "$TMP/sample.ts"
printf '# Title\n|a|b|\n' > "$TMP/sample.md"
check "Edit a .md file (skipped)"              allow $H "$(file_json Edit "$TMP/sample.md")" "$PLAIN"
check "Edit a .ts file, no Prettier yet"       allow $H "$(file_json Edit "$TMP/sample.ts")" "$PLAIN"
if [ "$(cat "$TMP/sample.ts")" = 'const a = {b:1}' ]; then
  pass=$((pass + 1)); printf 'PASS  %-24s %-6s %s\n' "$H" "untouched" ".ts file left as written (no Prettier)"
else
  fail=$((fail + 1)); printf 'FAIL  %-24s %-6s .ts file changed without Prettier\n' "$H" "untouched"
fi
PRETTIER="$(cd "$HOOKS_DIR/../.." && pwd)/node_modules/.bin/prettier"
if [ -x "$PRETTIER" ]; then
  mkdir -p "$TMP/formatted/node_modules/.bin"
  # A wrapper, not a symlink: the pnpm shim finds Prettier relative to its own folder.
  printf '#!/usr/bin/env bash\nexec "%s" "$@"\n' "$PRETTIER" > "$TMP/formatted/node_modules/.bin/prettier"
  chmod +x "$TMP/formatted/node_modules/.bin/prettier"
  printf 'const a = {b:1}\n' > "$TMP/formatted/sample.ts"
  check "Edit a .ts file, with Prettier"         allow $H "$(file_json Edit "$TMP/formatted/sample.ts")" "$TMP/formatted"
  if [ "$(cat "$TMP/formatted/sample.ts")" = 'const a = { b: 1 };' ]; then
    pass=$((pass + 1)); printf 'PASS  %-24s %-6s %s\n' "$H" "format" ".ts file formatted by Prettier"
  else
    fail=$((fail + 1)); printf 'FAIL  %-24s %-6s .ts file not formatted: %s\n' "$H" "format" "$(cat "$TMP/formatted/sample.ts")"
  fi
else
  skipped "Prettier runs on a .ts edit" "$H" "needs node_modules/.bin/prettier (run pnpm install)"
fi

echo
echo "Result: $pass passed, $fail failed, $skip skipped"
[ "$fail" -eq 0 ]
