# HeatingPi v3 — Setup, Deploy & Operations

v3 replaces the legacy macris/Node 12 app (still installed on the Pi under `/home/pi/heatingpi` for rollback) with:

- `server/` — Node 18 backend, REST API, relay control, temperature logging, monthly mail.
- `web/` — React frontend (Vite), built on the dev machine, served as static files by the server.
- `deploy/` — install/update/rollback scripts, systemd unit, config template.

## What runs on the Pi

| Item | Location |
|---|---|
| App | `/opt/heatingpi/{server,web,deploy}` (owner `pi`) |
| Node | `/opt/node-v18.20.8-linux-armv6l` (system `/usr/bin/node` 12 is untouched) |
| Config + secrets | `/etc/heatingpi/config.env` (root:pi, 640) — see `deploy/config.env.example` |
| Database | `/home/pi/heatingpi/_macris/test.sqlite3` (the legacy DB, same format) |
| DB backups | `test.sqlite3.bak-<timestamp>` next to it, 5 newest kept, one per install |
| Service | `heatingpi.service` (systemd, user `pi`, `MemoryMax=150M`, auto-restart) |
| Logs | journald, capped at 50 MB (`/etc/systemd/journald.conf.d/heatingpi.conf`) |
| HTTP | port 9000 on all interfaces (LAN + Tailscale) |
| HTTPS (public) | Tailscale Funnel: `https://heatingpi.<tailnet>.ts.net` → `127.0.0.1:9000` |

Why Node 18: it is the newest Node with an armv6l build that runs on Raspbian 11 bullseye
(Node 20/22 need `GLIBCXX_3.4.29+`, bullseye has 3.4.28). The only native module, `sqlite3@5.0.2`,
reuses the binary the legacy install compiled (`napi-v3-linux-arm`) — compiling on a Pi 1 takes ~1 h.

## SSH access

The Pi is in the Tailscale network: `ssh pi@heatingpi` (MagicDNS name or its 100.x Tailscale IP).
Credentials for scripted access are in the repo-root `.env` (git-ignored): `PI_HOST`, `PI_USER`,
`PI_PASSWORD`. `pi` has passwordless sudo. Prefer adding your SSH key (`ssh-copy-id pi@heatingpi`)
over using the password.

## Deploy / update

From the repo root on the dev machine (needs Node ≥ 18 and npm):

```bash
PI=pi@heatingpi ./deploy/deploy.sh
```

It runs the server tests, builds the web app, bundles server + JS dependencies + web build,
uploads it over SSH and runs `deploy/install-on-pi.sh` as root. The installer is idempotent:

1. installs Node 18 armv6l to `/opt` if missing,
2. copies the app to `/opt/heatingpi`,
3. puts the sqlite3 native binary in place (from the legacy install, else builds it),
4. creates `/etc/heatingpi/config.env` once (random `JWT_SECRET`), keeps it on later runs,
5. caps the journal, backs up the DB,
6. disables the legacy `@reboot` root-cron entry (commented with `#HEATINGPI-V3-DISABLED#`) and
   stops legacy processes started from `/home/pi/heatingpi`,
7. installs + restarts `heatingpi.service` and waits until the API answers,
8. with `ENABLE_FUNNEL=1`: `tailscale funnel --bg 9000`.

First install additionally passed the mail token and enabled Funnel:

```bash
PI=pi@heatingpi ENABLE_FUNNEL=1 FORWARD_EMAIL_API_TOKEN=<token> \
  MAIL_FROM='HeatingPi <no-reply@your-verified-domain>' DEFAULT_REPORT_EMAIL=<recipient> ./deploy/deploy.sh
```

`FORWARD_EMAIL_API_TOKEN` is a Forward Email API token (pre-encoded for Basic auth); `MAIL_FROM` must use a
domain verified in that account. All of them are written into `/etc/heatingpi/config.env` on the Pi only,
never into the repo. The installer also copies the legacy DB encryption keys from
`/home/pi/heatingpi/_macris/config/Config.js` into that file on the first run.

## HTTPS (Tailscale Funnel)

Funnel gives a public HTTPS URL with a Let's Encrypt certificate that Tailscale issues and renews.
No router port forwarding, no DNS record and no certbot are needed. The first request after enabling
can take ~30 s while the certificate is issued.

```bash
sudo tailscale funnel status          # show
sudo tailscale funnel --bg 9000       # enable
sudo tailscale funnel reset           # disable
```

Funnel must be allowed for the node in the tailnet policy (it was already allowed).
The old router port forward (external port → Pi:9000, plain HTTP) is no longer needed and should be
removed on the router.

## Monthly temperature mail + storage

- A reading is stored every minute (at second :01).
- On the 1st of each month all readings of the previous month are mailed as CSV (`;`-separated,
  decimal comma for Excel) to the address in **Settings → Monthly temperature report**
  (initially `DEFAULT_REPORT_EMAIL`) via the Forward Email API. Direct SMTP is impossible because the ISP
  blocks outbound port 25.
- Rows are deleted only after the API accepted the mail. A failed send is retried hourly.
- **Temperature → Download CSV** and **Send by e-mail now** also delete exactly the exported rows
  (download: after the browser received the file).
- Safety cap: rows older than `MAX_TEMPERATURE_AGE_DAYS` (180) are deleted even if mails fail.

## Users

No user UI; use the CLI on the Pi:

```bash
cd /opt/heatingpi/server
alias hpcli='HEATINGPI_CONFIG=/etc/heatingpi/config.env /opt/node-v18.20.8-linux-armv6l/bin/node src/cli.js'
hpcli list-users
hpcli set-password <email> '<new password>'
```

Commands: `list-users`, `add-user <email> <password> [name]`, `set-password <email> <password>`,
`remove-user <email>`. Passwords stay in the legacy format so a rollback keeps the same logins.
Logins are throttled (10 failures / 10 min, global).

## Day-to-day commands (on the Pi)

```bash
systemctl status heatingpi
journalctl -u heatingpi -f              # live log
sudo systemctl restart heatingpi
cat /sys/class/gpio/gpio{2,3,17,27,22,10,9,11}/value   # 0 = relay ON (active-low)
cat /sys/bus/w1/devices/28-*/w1_slave   # raw sensor
```

## Rollback to the legacy app

```bash
sudo bash /opt/heatingpi/deploy/rollback-to-legacy.sh
```

Stops/disables the service, disables Funnel, restores the legacy cron entry and starts the legacy
app. The DB format is unchanged, so the legacy app reads everything v3 wrote. (If a DB backup is
needed: `test.sqlite3.bak-*` next to the DB.)

## Local development

```bash
cd server && npm install && npm test
# simulated GPIO + sensor, separate DB copy:
DB_PATH=/tmp/dev.sqlite3 JWT_SECRET=$(printf 'x%.0s' {1..40}) SIMULATE=true PORT=9000 npm start
cd web && npm install && npm run dev     # http://localhost:5173, proxies /api to :9000
```
