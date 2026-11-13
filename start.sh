#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf 'Vui lòng cài Node.js LTS và npm trước.\n'
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
