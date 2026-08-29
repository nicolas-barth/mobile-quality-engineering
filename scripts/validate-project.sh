#!/usr/bin/env bash
set -euo pipefail

if [ ! -d node_modules ]; then
  echo "Installing dependencies"
  npm ci
fi

echo "Running lint"
npm run lint

echo "Running format check"
npm run format:check

echo "Running typecheck"
npm run typecheck

echo "Validating required environment variables are documented"
required_vars=(
  ANDROID_HOME
  JAVA_HOME
  ANDROID_DEVICE_NAME
  ANDROID_PLATFORM_VERSION
  ANDROID_APP_PATH
  ANDROID_APP_PACKAGE
  ANDROID_APP_ACTIVITY
  APPIUM_HOST
  APPIUM_PORT
)

missing_vars=0
for var in "${required_vars[@]}"; do
  if ! grep -q "^${var}=" .env.example; then
    echo "Missing ${var} in .env.example"
    missing_vars=1
  fi
done

if [ "${missing_vars}" -ne 0 ]; then
  echo "Environment variable documentation is incomplete"
  exit 1
fi

echo "Project validation passed"
