#!/bin/bash
# Installs / updates HeatingPi v3 on the Raspberry Pi. Run as root from the unpacked release:
#   sudo FORWARD_EMAIL_API_TOKEN=... ENABLE_FUNNEL=1 bash install-on-pi.sh
# Idempotent: safe to run again for every update.
set -euo pipefail

RELEASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR=/opt/heatingpi
NODE_VERSION=v18.20.8
NODE_DIR=/opt/node-$NODE_VERSION-linux-armv6l
NODE=$NODE_DIR/bin/node
CONFIG=/etc/heatingpi/config.env
LEGACY_DIR=/home/pi/heatingpi
LEGACY_DB=$LEGACY_DIR/_macris/test.sqlite3
LEGACY_SQLITE_BINDING=$LEGACY_DIR/_macris/node_modules/sqlite3/lib/binding/napi-v3-linux-arm

[ "$EUID" -eq 0 ] || { echo "Run as root (sudo)."; exit 1; }
log() { echo "==> $*"; }

# 1. Node 18 — the newest Node whose armv6l build runs on Raspbian bullseye (Node 20+ needs a
#    newer libstdc++). Installed side by side; the system /usr/bin/node (12) is not touched.
if [ ! -x "$NODE" ]; then
  log "Installing Node $NODE_VERSION (armv6l)"
  tmp=$(mktemp -d)
  wget -q -O "$tmp/node.tar.xz" "https://unofficial-builds.nodejs.org/download/release/$NODE_VERSION/node-$NODE_VERSION-linux-armv6l.tar.xz"
  tar -xJf "$tmp/node.tar.xz" -C /opt
  rm -rf "$tmp"
fi
"$NODE" -v

# 2. App files
log "Copying app to $APP_DIR"
mkdir -p "$APP_DIR"
rsync -a --delete --exclude 'server/node_modules/sqlite3/lib/binding/' "$RELEASE_DIR/server/" "$APP_DIR/server/"
rsync -a --delete "$RELEASE_DIR/web/" "$APP_DIR/web/"
rsync -a --delete "$RELEASE_DIR/deploy/" "$APP_DIR/deploy/"

# 3. Native sqlite3 binding. Compiling it on a Pi 1 takes ~1 h, so the binary the legacy app
#    already built is reused (napi-v3 is ABI-stable across Node versions).
BINDING_DIR=$APP_DIR/server/node_modules/sqlite3/lib/binding/napi-v3-linux-arm
if [ ! -f "$BINDING_DIR/node_sqlite3.node" ]; then
  if [ -f "$LEGACY_SQLITE_BINDING/node_sqlite3.node" ]; then
    log "Reusing compiled sqlite3 binding from the legacy install"
    mkdir -p "$BINDING_DIR"
    cp "$LEGACY_SQLITE_BINDING/node_sqlite3.node" "$BINDING_DIR/"
  else
    log "Building sqlite3 from source (slow on a Pi 1, ~1 h)"
    (cd "$APP_DIR/server" && PATH="$NODE_DIR/bin:$PATH" npm rebuild sqlite3 --build-from-source)
  fi
fi
(cd "$APP_DIR/server" && "$NODE" -e "require('sqlite3'); console.log('sqlite3 OK')")
chown -R pi:pi "$APP_DIR"

# 4. Config (created once; existing values are kept)
mkdir -p /etc/heatingpi
if [ ! -f "$CONFIG" ]; then
  log "Creating $CONFIG"
  sed -e "s|^JWT_SECRET=.*|JWT_SECRET=$(head -c 48 /dev/urandom | base64 | tr -d '/+=\n')|" \
    "$RELEASE_DIR/deploy/config.env.example" >"$CONFIG"
fi
# set_config KEY VALUE — replaces or appends a line in config.env
set_config() {
  local tmp
  tmp=$(mktemp)
  grep -v "^$1=" "$CONFIG" >"$tmp" || true
  printf '%s=%s\n' "$1" "$2" >>"$tmp"
  cat "$tmp" >"$CONFIG"
  rm -f "$tmp"
}
config_value() { grep -E "^$1=" "$CONFIG" | tail -1 | cut -d= -f2-; }

# Values passed by deploy.sh (only applied when given)
for key in FORWARD_EMAIL_API_TOKEN MAIL_FROM DEFAULT_REPORT_EMAIL; do
  [ -n "${!key:-}" ] && set_config "$key" "${!key}"
done

# DB encryption keys: must match the legacy install, never regenerate them for an existing DB.
if [ -z "$(config_value DB_ENCRYPTION_SALT)" ]; then
  LEGACY_CONFIG=$LEGACY_DIR/_macris/config/Config.js
  if [ -f "$LEGACY_CONFIG" ]; then
    log "Copying DB encryption keys from the legacy config"
    set_config DB_ENCRYPTION_SALT "$(grep -oE 'DB_ENCRYPTION_SALT="[^"]+"' "$LEGACY_CONFIG" | cut -d'"' -f2)"
    set_config DB_ENCRYPTION_PASSWORD "$(grep -oE 'DB_ENCRYPTION_PASSWORD="[^"]+"' "$LEGACY_CONFIG" | cut -d'"' -f2)"
  elif [ ! -f "$(config_value DB_PATH)" ]; then
    log "No legacy install and no DB: generating new DB encryption keys"
    set_config DB_ENCRYPTION_SALT "$(head -c 45 /dev/urandom | base64 | tr -d '/+=\n')"
    set_config DB_ENCRYPTION_PASSWORD "$(head -c 45 /dev/urandom | base64 | tr -d '/+=\n')"
  else
    echo "DB exists but DB_ENCRYPTION_SALT/PASSWORD are unknown. Set them in $CONFIG."; exit 1
  fi
fi
chown root:pi "$CONFIG"
chmod 640 "$CONFIG"

# 5. Cap the journal size
install -D -m 644 "$RELEASE_DIR/deploy/journald-heatingpi.conf" /etc/systemd/journald.conf.d/heatingpi.conf
systemctl restart systemd-journald

# 6. DB backup before every (re)start
if [ -f "$LEGACY_DB" ]; then
  cp -p "$LEGACY_DB" "$LEGACY_DB.bak-$(date +%Y%m%d-%H%M%S)"
  # keep the 5 newest backups
  ls -1t "$LEGACY_DB".bak-* 2>/dev/null | tail -n +6 | xargs -r rm -f
fi

# 7. Stop the legacy app (root crontab @reboot "yarn prod") — only processes running from its dir.
if crontab -l 2>/dev/null | grep -qE '^@reboot .*heatingpi.*yarn prod'; then
  log "Disabling legacy @reboot cron entry"
  crontab -l | sed -E 's|^(@reboot .*heatingpi.*yarn prod.*)$|#HEATINGPI-V3-DISABLED# \1|' | crontab -
fi
for pid in $(pgrep -f 'yarn prod|node Server.js|yarn --cwd _macris' || true); do
  if readlink "/proc/$pid/cwd" 2>/dev/null | grep -q "^$LEGACY_DIR"; then
    log "Stopping legacy process $pid ($(tr '\0' ' ' </proc/$pid/cmdline))"
    kill "$pid" 2>/dev/null || true
  fi
done
sleep 2

# 8. systemd service
log "Installing systemd service"
install -m 644 "$RELEASE_DIR/deploy/heatingpi.service" /etc/systemd/system/heatingpi.service
systemctl daemon-reload
systemctl enable heatingpi.service >/dev/null
systemctl restart heatingpi.service

port=$(grep -E '^PORT=' "$CONFIG" | cut -d= -f2)
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${port:-9000}/api/me" || true)
  [ "$code" = "401" ] && break
  sleep 1
done
[ "$code" = "401" ] || { echo "Service did not come up:"; journalctl -u heatingpi -n 30 --no-pager; exit 1; }
log "HeatingPi is running on port ${port:-9000}"

# 9. Public HTTPS via Tailscale Funnel (Let's Encrypt cert managed by Tailscale)
if [ "${ENABLE_FUNNEL:-0}" = "1" ]; then
  log "Enabling Tailscale Funnel -> localhost:${port:-9000}"
  tailscale funnel --bg "${port:-9000}"
  tailscale funnel status
fi

log "Done."
