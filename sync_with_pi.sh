#!/usr/bin/env bash
# =============================================================================
# NES Completion Project — Bidirectional Wi-Fi Sync with Raspberry Pi 3B
# =============================================================================
# Usage:
#   ./sync_with_pi.sh                  # Pull saves/screenshots/progress from Pi & push code/ROMs
#   PI_HOST=pi@192.168.1.50 ./sync_with_pi.sh
# =============================================================================

set -euo pipefail

PI_HOST="${PI_HOST:-pi@retropie.local}"
PI_PROJECT_DIR="${PI_PROJECT_DIR:-/home/pi/nes-tracker}"
PI_ROM_DIR="${PI_ROM_DIR:-/home/pi/RetroPie/roms/nes}"

LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_ROMS_DIR="${LOCAL_DIR}/roms"
LOCAL_SAVES_BACKUP="${LOCAL_DIR}/backups/saves"
LOCAL_SCREENSHOTS="${LOCAL_DIR}/screenshots"

mkdir -p "${LOCAL_ROMS_DIR}" "${LOCAL_SAVES_BACKUP}" "${LOCAL_SCREENSHOTS}"

echo "=== [1/4] Pushing NES Tracker App & Dataset to ${PI_HOST}:${PI_PROJECT_DIR} ==="
ssh "${PI_HOST}" "mkdir -p '${PI_PROJECT_DIR}/screenshots'"
rsync -avz --exclude 'roms/' --exclude 'backups/' --exclude 'screenshots/' --exclude 'progress.json' \
  "${LOCAL_DIR}/" "${PI_HOST}:${PI_PROJECT_DIR}/"

if [ -n "$(ls -A "${LOCAL_ROMS_DIR}" 2>/dev/null || true)" ]; then
  echo "=== [2/4] Pushing Local NES ROMs (${LOCAL_ROMS_DIR}) to ${PI_HOST}:${PI_ROM_DIR} ==="
  rsync -avz --ignore-existing "${LOCAL_ROMS_DIR}/" "${PI_HOST}:${PI_ROM_DIR}/"
else
  echo "=== [2/4] No local ROMs in ${LOCAL_ROMS_DIR} to push (skipping) ==="
fi

echo "=== [3/4] Pulling Battery Saves (.srm) & Save States (.state*) from Pi to ${LOCAL_SAVES_BACKUP} ==="
rsync -avz --include='*/' --include='*.srm' --include='*.state*' --exclude='*' \
  "${PI_HOST}:${PI_ROM_DIR}/" "${LOCAL_SAVES_BACKUP}/" || true

echo "=== [4/4] Syncing Victory Screenshots & progress.json from Pi ==="
rsync -avz "${PI_HOST}:${PI_PROJECT_DIR}/screenshots/" "${LOCAL_SCREENSHOTS}/" || true
rsync -avz --update "${PI_HOST}:${PI_PROJECT_DIR}/progress.json" "${LOCAL_DIR}/progress.json" 2>/dev/null || true

if [ -f "${LOCAL_DIR}/progress.json" ]; then
  rsync -avz --update "${LOCAL_DIR}/progress.json" "${PI_HOST}:${PI_PROJECT_DIR}/progress.json" || true
fi

echo "✅ Sync complete! Saves backed up in: ${LOCAL_SAVES_BACKUP}"
echo "✅ Victory screenshots in:            ${LOCAL_SCREENSHOTS}"
