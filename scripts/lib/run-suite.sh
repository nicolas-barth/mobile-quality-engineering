run_suite_with_appium() {
  local suite_name="$1"

  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi

  local android_app_path="${ANDROID_APP_PATH:-./app/android/mda-2.2.0-25.apk}"
  local appium_host="${APPIUM_HOST:-127.0.0.1}"
  local appium_port="${APPIUM_PORT:-4723}"

  echo "Validating local environment"
  if ! bash scripts/check-environment.sh; then
    echo "Environment check reported issues, review the output above before continuing"
  fi

  if ! command -v adb >/dev/null 2>&1; then
    echo "adb is required to run the ${suite_name} suite and was not found"
    exit 1
  fi

  local device_count
  device_count=$(adb devices | tail -n +2 | grep -c "device$" || true)
  if [ "${device_count}" -eq 0 ]; then
    echo "No connected Android device or running emulator was found"
    exit 1
  fi

  if [ ! -f "${android_app_path}" ]; then
    echo "APK not found at ${android_app_path}, preparing it now"
    bash scripts/prepare-android-app.sh
  fi

  local appium_started_here=0
  local appium_pid=0
  if ! curl -fsS "http://${appium_host}:${appium_port}/status" >/dev/null 2>&1; then
    echo "Starting Appium on ${appium_host}:${appium_port}"
    bash scripts/start-appium.sh &
    appium_pid=$!
    appium_started_here=1

    for _ in $(seq 1 30); do
      if curl -fsS "http://${appium_host}:${appium_port}/status" >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done

    if ! curl -fsS "http://${appium_host}:${appium_port}/status" >/dev/null 2>&1; then
      echo "Appium did not become ready on ${appium_host}:${appium_port}"
      kill "${appium_pid}" 2>/dev/null || true
      exit 1
    fi
  else
    echo "Appium already running on ${appium_host}:${appium_port}"
  fi

  cleanup() {
    if [ "${appium_started_here}" -eq 1 ]; then
      echo "Stopping Appium (pid ${appium_pid})"
      kill "${appium_pid}" 2>/dev/null || true
      wait "${appium_pid}" 2>/dev/null || true
    fi
  }
  trap cleanup EXIT

  set +e
  npx wdio run wdio.conf.ts --suite "${suite_name}"
  local test_exit_code=$?
  set -e

  npx allure generate allure-results --clean -o reports/allure-report || true

  exit "${test_exit_code}"
}
