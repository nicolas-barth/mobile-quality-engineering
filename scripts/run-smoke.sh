#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=scripts/lib/run-suite.sh
source scripts/lib/run-suite.sh

run_suite_with_appium smoke
