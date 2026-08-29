#!/usr/bin/env bash
set -euo pipefail

repeat_count="${1:-3}"
failures=0

for attempt in $(seq 1 "${repeat_count}"); do
  echo "Smoke run ${attempt} of ${repeat_count}"
  if ! npx wdio run wdio.conf.ts --suite smoke; then
    failures=$((failures + 1))
  fi
done

echo "${failures} of ${repeat_count} smoke runs failed"

if [ "${failures}" -gt 0 ]; then
  exit 1
fi
