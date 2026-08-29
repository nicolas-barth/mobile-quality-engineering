#!/usr/bin/env bash
set -euo pipefail

repeat_count="${SMOKE_REPEAT_COUNT:-${1:-10}}"
results_dir="reports/stability"
log_dir="${results_dir}/logs"
runs_file="${results_dir}/runs.jsonl"

mkdir -p "${log_dir}"
: > "${runs_file}"

for attempt in $(seq 1 "${repeat_count}"); do
  echo "Stability run ${attempt} of ${repeat_count}"
  log_file="${log_dir}/run-${attempt}.log"
  start_epoch=$(date +%s)
  set +e
  npx wdio run wdio.conf.ts --suite smoke > "${log_file}" 2>&1
  exit_code=$?
  set -e
  end_epoch=$(date +%s)
  duration_seconds=$((end_epoch - start_epoch))
  passed="false"
  if [ "${exit_code}" -eq 0 ]; then
    passed="true"
  fi
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '{"execution":%d,"passed":%s,"exitCode":%d,"durationSeconds":%d,"timestamp":"%s"}\n' \
    "${attempt}" "${passed}" "${exit_code}" "${duration_seconds}" "${timestamp}" >> "${runs_file}"
done

npx tsx scripts/stability-summarize.ts "${runs_file}" "${log_dir}"
