#!/usr/bin/env bash
set -euo pipefail

max_lines="${1:-200}"
output_file="${2:-logcat.txt}"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is required to collect logcat and was not found"
  exit 1
fi

device_count=$(adb devices | tail -n +2 | grep -c "device$" || true)
if [ "${device_count}" -eq 0 ]; then
  echo "No connected Android device or running emulator was found"
  exit 1
fi

echo "Collecting the last ${max_lines} logcat lines into ${output_file}"
adb logcat -d -t "${max_lines}" > "${output_file}"
