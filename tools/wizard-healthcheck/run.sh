#!/usr/bin/env bash
# Wizard healthcheck runner — bundles the real frontend pipeline with esbuild
# and runs it against the deployed backend.
#
# Usage:
#   bash tools/wizard-healthcheck/run.sh                 # full 12-config matrix
#   BIMA_TEST_FILTER=MN-biji-25k-30m bash tools/wizard-healthcheck/run.sh
#   BIMA_TEST_PARALLEL=3 BIMA_TEST_RUNS=2 bash tools/wizard-healthcheck/run.sh
# Exit code: 0 = all pass, 1 = at least one failure, 2 = harness crash.
set -uo pipefail

# Native esbuild.exe cannot read MSYS '/c/...' paths — force a C:/... path.
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 2
REPO="$(pwd -W 2>/dev/null || pwd)"
cd "$REPO" || exit 2
OUT_DIR="$REPO/tools/wizard-healthcheck"
BUNDLE="$OUT_DIR/dist/main.mjs"

mkdir -p "$OUT_DIR/dist" "$OUT_DIR/reports"

# import.meta.env is Vite-only; bimaClient.ts reads it, so define it away.
npx esbuild "$OUT_DIR/main.ts" \
  --bundle --platform=node --format=esm \
  --define:import.meta.env='{}' \
  --outfile="$BUNDLE" --log-level=warning || exit 2

export BIMA_TEST_OUT="${BIMA_TEST_OUT:-$OUT_DIR/reports/$(date +%Y%m%d-%H%M%S).json}"
node "$BUNDLE"
code=$?
echo "healthcheck exit=$code report=$BIMA_TEST_OUT"
exit $code
