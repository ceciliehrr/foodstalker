#!/usr/bin/env bash
# Loads nvm and switches Node to match .nvmrc so npm scripts work in stale shells / IDE terminals.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PATH="$ROOT/node_modules/.bin:$PATH"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  if [[ -f .nvmrc ]]; then
    nvm install >/dev/null
    nvm use >/dev/null
  fi
fi

exec "$@"
