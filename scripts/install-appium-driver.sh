#!/usr/bin/env bash
set -euo pipefail

driver_name="uiautomator2"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required but was not found"
  exit 1
fi

if npx --no-install appium driver list --installed 2>&1 | grep -q "${driver_name}"; then
  echo "Appium driver '${driver_name}' is already installed"
  npx --no-install appium driver list --installed
  exit 0
fi

echo "Installing Appium driver '${driver_name}'"
npx --no-install appium driver install "${driver_name}"

if npx --no-install appium driver list --installed 2>&1 | grep -q "${driver_name}"; then
  echo "Appium driver '${driver_name}' installed successfully"
  exit 0
fi

echo "Failed to verify installation of Appium driver '${driver_name}'"
exit 1
