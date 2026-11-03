#!/bin/bash
# Builds HeatingPi v3 on the dev machine and installs it on the Pi over SSH.
#   PI=pi@heatingpi ./deploy/deploy.sh                       # update
#   PI=pi@heatingpi ENABLE_FUNNEL=1 FORWARD_EMAIL_API_TOKEN=... MAIL_FROM='HeatingPi <no-reply@example.com>' \
#     DEFAULT_REPORT_EMAIL=someone@example.com ./deploy/deploy.sh                      # first install
# Everything is built here (React app, JS deps); the Pi only receives finished files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PI="${PI:-pi@heatingpi}"
SSH="${SSH:-ssh}"
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

echo "==> Testing server"
(cd "$ROOT/server" && npm ci --silent && env -u FORWARD_EMAIL_API_TOKEN -u MAIL_FROM -u DEFAULT_REPORT_EMAIL npm test --silent)

echo "==> Building web"
(cd "$ROOT/web" && npm ci --silent && npm run build --silent)

echo "==> Staging release"
mkdir -p "$STAGE/heatingpi/server" "$STAGE/heatingpi/web"
cp -r "$ROOT/server/src" "$ROOT/server/package.json" "$ROOT/server/package-lock.json" "$STAGE/heatingpi/server/"
# JS-only deps (no install scripts); the native sqlite3 binary is provided on the Pi.
(cd "$STAGE/heatingpi/server" && npm ci --omit=dev --ignore-scripts --silent)
rm -rf "$STAGE/heatingpi/server/node_modules/sqlite3/lib/binding"
cp -r "$ROOT/web/dist/." "$STAGE/heatingpi/web/"
cp -r "$ROOT/deploy" "$STAGE/heatingpi/deploy"
tar -C "$STAGE" -czf "$STAGE/heatingpi.tgz" heatingpi

echo "==> Uploading to $PI"
$SSH "$PI" 'rm -rf /tmp/heatingpi-release && mkdir -p /tmp/heatingpi-release && tar -xzf - -C /tmp/heatingpi-release' <"$STAGE/heatingpi.tgz"

echo "==> Installing"
$SSH "$PI" "sudo ENABLE_FUNNEL='${ENABLE_FUNNEL:-0}' FORWARD_EMAIL_API_TOKEN='${FORWARD_EMAIL_API_TOKEN:-}' MAIL_FROM='${MAIL_FROM:-}' DEFAULT_REPORT_EMAIL='${DEFAULT_REPORT_EMAIL:-}' bash /tmp/heatingpi-release/heatingpi/deploy/install-on-pi.sh"
