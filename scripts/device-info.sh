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
  echo "adb is required to report device information and was not found"
  exit 1
fi

device_count=$(adb devices | tail -n +2 | grep -c "device$" || true)
if [ "${device_count}" -eq 0 ]; then
  echo "No connected Android device or running emulator was found"
  exit 1
fi

echo "Model: $(adb shell getprop ro.product.model | tr -d '\r')"
echo "Android version: $(adb shell getprop ro.build.version.release | tr -d '\r')"
echo "SDK level: $(adb shell getprop ro.build.version.sdk | tr -d '\r')"

if adb shell pm list packages | grep -q "${android_app_package}"; then
  version_name=$(adb shell dumpsys package "${android_app_package}" | grep versionName | head -n 1 | tr -d '\r')
  echo "Application installed: yes (${version_name})"
else
  echo "Application installed: no"
fi
