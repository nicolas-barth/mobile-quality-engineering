#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

android_app_package="${ANDROID_APP_PACKAGE:-com.saucelabs.mydemoapp.android}"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is required to reset the application and was not found"
  exit 1
fi

device_count=$(adb devices | tail -n +2 | grep -c "device$" || true)
if [ "${device_count}" -eq 0 ]; then
  echo "No connected Android device or running emulator was found"
  exit 1
fi

echo "Clearing application data for ${android_app_package}"
adb shell pm clear "${android_app_package}"
