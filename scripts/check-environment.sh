#!/usr/bin/env bash
set -euo pipefail

status=0

report_ok() {
  echo "[OK] $1"
}

report_fail() {
  echo "[MISSING] $1"
  status=1
}

check_command() {
  local label="$1"
  local binary="$2"
  local version_flag="${3:---version}"
  if command -v "$binary" >/dev/null 2>&1; then
    report_ok "$label ($("$binary" "$version_flag" 2>&1 | head -n 1))"
  else
    report_fail "$label"
  fi
}

check_env_var() {
  local name="$1"
  if [ -n "${!name:-}" ]; then
    report_ok "$name is set (${!name})"
  else
    report_fail "$name is not set"
  fi
}

echo "Checking Node.js toolchain"
check_command "Node.js" node
check_command "npm" npm

echo
echo "Checking Java toolchain"
check_command "Java" java -version

echo
echo "Checking Android SDK"
check_env_var ANDROID_HOME
check_env_var JAVA_HOME

if [ -n "${ANDROID_HOME:-}" ]; then
  if [ -x "${ANDROID_HOME}/platform-tools/adb" ] || command -v adb >/dev/null 2>&1; then
    report_ok "adb"
  else
    report_fail "adb (expected in \$ANDROID_HOME/platform-tools)"
  fi

  if [ -x "${ANDROID_HOME}/emulator/emulator" ] || command -v emulator >/dev/null 2>&1; then
    report_ok "Android emulator binary"
  else
    report_fail "Android emulator binary (expected in \$ANDROID_HOME/emulator)"
  fi
else
  report_fail "adb (cannot locate without ANDROID_HOME)"
  report_fail "Android emulator binary (cannot locate without ANDROID_HOME)"
fi

echo
echo "Checking Appium"
if npx --no-install appium --version >/dev/null 2>&1; then
  report_ok "Appium ($(npx --no-install appium --version 2>&1 | tail -n 1))"
else
  report_fail "Appium (run npm ci first)"
fi

if npx --no-install appium driver list --installed 2>&1 | grep -q uiautomator2; then
  report_ok "UiAutomator2 driver"
else
  report_fail "UiAutomator2 driver (run npm run appium:install-driver)"
fi

echo
echo "Checking connected Android devices"
if command -v adb >/dev/null 2>&1; then
  device_count=$(adb devices | tail -n +2 | grep -c "device$" || true)
  if [ "${device_count}" -gt 0 ]; then
    report_ok "${device_count} device(s) connected"
  else
    report_fail "No connected device or running emulator found"
  fi
else
  report_fail "Cannot list devices without adb"
fi

echo
if [ "${status}" -eq 0 ]; then
  echo "Environment check passed"
else
  echo "Environment check failed, see [MISSING] entries above"
fi

exit "${status}"
