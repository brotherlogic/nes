#!/usr/bin/env python3
"""
NES Completion Project — Raspberry Pi 3B Companion & Touchscreen Server
=======================================================================
Serves the NES Completion Tracker web app on http://0.0.0.0:8765 and provides
hardware control endpoints for the 7" Touchscreen Stand + Samsung Frame TV setup:

  - GET  /api/progress          -> Load shared progress.json from disk
  - POST /api/progress          -> Save shared progress.json to disk
  - POST /api/retroarch         -> Send UDP command to RetroArch (127.0.0.1:55355)
                                   (SAVE_STATE, LOAD_STATE, RESET, PAUSE_TOGGLE, QUIT, etc.)
  - POST /api/capture-victory   -> Trigger RetroArch SCREENSHOT, copy the latest PNG into
                                   ./screenshots/, and return its path for the completion log
  - POST /api/launch            -> Find matching ROM in ROM_DIR and launch it on HDMI (TV)
  - POST /api/shutdown          -> Safely shut down the Raspberry Pi (sudo shutdown -h now)
"""

import glob
import http.server
import json
import os
import re
import shutil
import socket
import subprocess
import time
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(BASE_DIR, "progress.json")
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")

# Configurable via environment variables on the Raspberry Pi
ROM_DIR = os.environ.get("NES_ROM_DIR", "/home/pi/RetroPie/roms/nes")
RETROARCH_SCREENSHOT_DIR = os.environ.get(
    "RETROARCH_SCREENSHOT_DIR",
    "/home/pi/.config/retroarch/screenshots"
)
RETROARCH_CONFIG = os.environ.get(
    "RETROARCH_CONFIG",
    "/opt/retropie/configs/nes/retroarch.cfg"
)
RETROARCH_CORE = os.environ.get(
    "RETROARCH_CORE",
    "/opt/retropie/libretrocores/lr-fceumm/fceumm_libretro.so"
)
UDP_HOST = os.environ.get("RETROARCH_UDP_HOST", "127.0.0.1")
UDP_PORT = int(os.environ.get("RETROARCH_UDP_PORT", "55355"))
PORT = int(os.environ.get("NES_TRACKER_PORT", "8765"))

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

ALLOWED_UDP_COMMANDS = {
    "SAVE_STATE",
    "LOAD_STATE",
    "STATE_SLOT_PLUS",
    "STATE_SLOT_MINUS",
    "PAUSE_TOGGLE",
    "MENU_TOGGLE",
    "RESET",
    "QUIT",
    "SCREENSHOT",
    "FAST_FORWARD",
    "MUTE",
}


def send_retroarch_udp(command: str) -> bool:
    """Send a UDP network command packet to RetroArch on localhost:55355."""
    cmd = command.strip().upper()
    if cmd not in ALLOWED_UDP_COMMANDS:
        raise ValueError(f"Unsupported RetroArch command: {cmd}")
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.sendto(f"{cmd}\n".encode("utf-8"), (UDP_HOST, UDP_PORT))
        return True
    finally:
        sock.close()


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return s or "game"


def normalize_for_match(name: str) -> str:
    # Strip region/revision tags like (USA), (Europe), [!], file extensions
    name = os.path.splitext(os.path.basename(name))[0]
    name = re.sub(r"\([^)]*\)|\[[^\]]*\]", "", name)
    name = re.sub(r"[^a-z0-9]+", "", name.lower())
    return name


def find_rom_for_title(title: str, alt_titles: str = "") -> str | None:
    """Fuzzy-match a game title (or its PAL/NA alternate title) to a ROM file in ROM_DIR."""
    if not os.path.isdir(ROM_DIR):
        return None

    candidates = []
    for ext in ("*.nes", "*.zip", "*.7z", "*.NES", "*.ZIP"):
        candidates.extend(glob.glob(os.path.join(ROM_DIR, "**", ext), recursive=True))

    if not candidates:
        return None

    search_names = [title] + [t.strip() for t in alt_titles.split(",") if t.strip()]
    norm_targets = [normalize_for_match(t) for t in search_names if normalize_for_match(t)]

    # 1. Exact normalized match
    for target in norm_targets:
        for path in candidates:
            if normalize_for_match(path) == target:
                return path

    # 2. Substring match
    for target in norm_targets:
        for path in candidates:
            norm_p = normalize_for_match(path)
            if target in norm_p or norm_p in target:
                return path

    return None


class TrackerRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_json(self, data: dict, status: int = 200):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def _read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/progress":
            if os.path.isfile(PROGRESS_FILE):
                try:
                    with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    return self._send_json({"ok": True, "data": data})
                except Exception as e:
                    return self._send_json({"ok": False, "error": str(e)}, 500)
            return self._send_json({"ok": True, "data": None})

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        # 1. Save progress.json to disk
        if parsed.path == "/api/progress":
            try:
                body = self._read_json_body()
                with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
                    json.dump(body, f, indent=2, ensure_ascii=False)
                return self._send_json({"ok": True})
            except Exception as e:
                return self._send_json({"ok": False, "error": str(e)}, 500)

        # 2. Send UDP command to RetroArch
        if parsed.path == "/api/retroarch":
            try:
                body = self._read_json_body()
                cmd = body.get("command", "")
                send_retroarch_udp(cmd)
                return self._send_json({"ok": True, "command": cmd})
            except Exception as e:
                return self._send_json({"ok": False, "error": str(e)}, 400)

        # 3. Capture Victory Screenshot from RetroArch + copy to ./screenshots/
        if parsed.path == "/api/capture-victory":
            try:
                body = self._read_json_body()
                title = body.get("title", "nes-game")
                send_retroarch_udp("SCREENSHOT")
                # Give RetroArch ~450ms to flush the PNG screenshot to disk
                time.sleep(0.45)

                shot_rel_url = None
                if os.path.isdir(RETROARCH_SCREENSHOT_DIR):
                    pngs = glob.glob(os.path.join(RETROARCH_SCREENSHOT_DIR, "**", "*.png"), recursive=True)
                    if pngs:
                        newest = max(pngs, key=os.path.getmtime)
                        ts = time.strftime("%Y%m%d-%H%M%S")
                        dest_name = f"{slugify(title)}-{ts}.png"
                        dest_path = os.path.join(SCREENSHOTS_DIR, dest_name)
                        shutil.copy2(newest, dest_path)
                        shot_rel_url = f"screenshots/{dest_name}"

                return self._send_json({
                    "ok": True,
                    "screenshot": shot_rel_url,
                    "date": time.strftime("%Y-%m-%d")
                })
            except Exception as e:
                return self._send_json({"ok": False, "error": str(e)}, 500)

        # 4. Launch ROM on TV via RetroArch
        if parsed.path == "/api/launch":
            try:
                body = self._read_json_body()
                title = body.get("title", "")
                alt_titles = body.get("alternate_titles", "")
                rom_path = find_rom_for_title(title, alt_titles)
                if not rom_path:
                    return self._send_json({
                        "ok": False,
                        "error": f"No matching ROM found for '{title}' in {ROM_DIR}"
                    }, 404)

                # Quit any currently running RetroArch instance cleanly first
                try:
                    send_retroarch_udp("QUIT")
                    time.sleep(0.3)
                except Exception:
                    pass

                cmd = [
                    "/opt/retropie/emulators/retroarch/bin/retroarch",
                    "-L", RETROARCH_CORE,
                    "--config", RETROARCH_CONFIG,
                    rom_path
                ]
                subprocess.Popen(
                    cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
                return self._send_json({
                    "ok": True,
                    "title": title,
                    "rom": os.path.basename(rom_path)
                })
            except Exception as e:
                return self._send_json({"ok": False, "error": str(e)}, 500)

        # 5. Safe Raspberry Pi Shutdown
        if parsed.path == "/api/shutdown":
            try:
                send_retroarch_udp("QUIT")
                time.sleep(0.4)
            except Exception:
                pass
            subprocess.Popen(["sudo", "shutdown", "-h", "now"])
            return self._send_json({"ok": True, "message": "Shutting down Raspberry Pi safely..."})

        return self._send_json({"ok": False, "error": "Not found"}, 404)


if __name__ == "__main__":
    print(f"Starting NES Completion Companion Server on http://0.0.0.0:{PORT}")
    print(f"  ROM Directory:        {ROM_DIR}")
    print(f"  Screenshots Saved To: {SCREENSHOTS_DIR}")
    print(f"  Progress File:        {PROGRESS_FILE}")
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), TrackerRequestHandler) as httpd:
        httpd.serve_forever()
