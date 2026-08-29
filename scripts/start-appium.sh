#!/usr/bin/env bash
set -euo pipefail

host="${APPIUM_HOST:-127.0.0.1}"
port="${APPIUM_PORT:-4723}"
log_file="appium.log"

if command -v lsof >/dev/null 2>&1 && lsof -i ":${port}" >/dev/null 2>&1; then
  echo "Port ${port} is already in use, Appium may already be running"
  exit 1
fi

echo "Starting Appium on ${host}:${port}, logging to ${log_file}"

npx --no-install appium server \
  --address "${host}" \
  --port "${port}" \
  --log "${log_file}" \
  --log-level info \
  --allow-insecure uiautomator2:adb_shell &

appium_pid=$!

cleanup() {
  echo "Stopping Appium (pid ${appium_pid})"
  kill "${appium_pid}" 2>/dev/null || true
  wait "${appium_pid}" 2>/dev/null || true
}
trap cleanup INT TERM

wait "${appium_pid}"
