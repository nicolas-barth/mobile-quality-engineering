#!/usr/bin/env bash
set -euo pipefail

app_version="${MDA_APK_VERSION:-2.2.0}"
build_number="${MDA_APK_BUILD:-25}"
target_dir="app/android"
target_file="mda-${app_version}-${build_number}.apk"
target_path="${target_dir}/${target_file}"
download_url="${MDA_APK_URL:-https://github.com/saucelabs/my-demo-app-android/releases/download/${app_version}/${target_file}}"

mkdir -p "${target_dir}"

if [ -f "${target_path}" ]; then
  echo "APK already present at ${target_path}, skipping acquisition"
  echo "${target_path}"
  exit 0
fi

if [ -n "${MDA_LOCAL_APK:-}" ]; then
  if [ ! -f "${MDA_LOCAL_APK}" ]; then
    echo "MDA_LOCAL_APK is set to '${MDA_LOCAL_APK}' but the file does not exist"
    exit 1
  fi
  echo "Copying local APK from ${MDA_LOCAL_APK}"
  cp "${MDA_LOCAL_APK}" "${target_path}"
else
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to download the APK and was not found"
    exit 1
  fi

  echo "Downloading Sauce Labs My Demo App Android ${app_version} from ${download_url}"
  if ! curl -fsSL -o "${target_path}.tmp" "${download_url}"; then
    rm -f "${target_path}.tmp"
    echo "Failed to download the APK from ${download_url}"
    echo "Provide a prebuilt APK via MDA_LOCAL_APK or see docs/system-under-test.md for build instructions"
    exit 1
  fi
  mv "${target_path}.tmp" "${target_path}"
fi

if [ ! -s "${target_path}" ]; then
  echo "Downloaded file at ${target_path} is empty"
  exit 1
fi

cat > "${target_dir}/VERSION.txt" <<EOF
version=${app_version}
build=${build_number}
file=${target_file}
source=${download_url}
prepared_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "APK ready at ${target_path}"
echo "${target_path}"
