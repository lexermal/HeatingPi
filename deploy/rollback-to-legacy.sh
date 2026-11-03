#!/bin/bash
# Switches the Pi back to the legacy (macris/Node 12) app. Run as root on the Pi.
# The DB format is unchanged, so the legacy app reads everything v3 wrote.
set -euo pipefail
[ "$EUID" -eq 0 ] || { echo "Run as root (sudo)."; exit 1; }

systemctl disable --now heatingpi.service || true
tailscale funnel reset || true
crontab -l | sed -E 's|^#HEATINGPI-V3-DISABLED# ||' | crontab -
echo "Legacy cron entry restored. Starting the legacy app now (it also starts on every reboot)."
cd /home/pi/heatingpi && nohup /usr/local/bin/yarn prod >>/var/log/HeatingPi.log 2>&1 &
echo "Done. The legacy app needs ~1-2 minutes to come up on port 9000."
