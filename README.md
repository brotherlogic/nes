# NES Completion Project — Quick Setup Guide

This guide covers exactly what to run on **this Linux machine (Workstation / Server)** and what to run on the **Raspberry Pi 3B + 7" Touchscreen Device**.

*(For the game lists and win conditions see [`NES_COMPLETION_GUIDE.md`](./NES_COMPLETION_GUIDE.md); for TV settings and wiring details see [`HARDWARE.md`](./HARDWARE.md).)*

---

## 1. What to Run on This Machine (Linux Workstation / Server)

All project files live in `/var/home/simon/projects/nes`.

### Option A: Preview / Use the Tracker Locally on This Machine
Run the companion server locally:
```bash
cd /var/home/simon/projects/nes
./pi_server.py
```
Then open **`http://localhost:8765`** in your browser (or open [`index.html`](./index.html) directly).

### Option B: Push Code & ROMs / Sync Progress & Saves with the Raspberry Pi
1. Place your `.nes` or `.zip` ROM files in `/var/home/simon/projects/nes/roms/`.
2. Set up passwordless SSH to the Raspberry Pi once:
   ```bash
   ssh-copy-id pi@retropie.local
   ```
3. Run the sync script anytime to push tracker files/ROMs to the Pi and pull back battery saves (`*.srm`), save states (`*.state*`), victory screenshots (`screenshots/*.png`), and `progress.json`:
   ```bash
   cd /var/home/simon/projects/nes
   ./sync_with_pi.sh
   ```
   *(If your Pi has a different hostname or IP, run `PI_HOST=pi@192.168.1.XX ./sync_with_pi.sh`.)*

---

## 2. What to Run on the Raspberry Pi 3B + 7" Touchscreen Device

The Raspberry Pi 3B runs **RetroPie** and drives two screens simultaneously:
- **HDMI Out (`/dev/fb0` → Samsung Frame TV):** EmulationStation + RetroArch (1080p @ 60Hz)
- **7" DSI Touchscreen (`/dev/fb1` → 800×480 Stand):** Chromium Kiosk displaying the NES Tracker & TV Control Deck (`http://127.0.0.1:8765`)

### Step 1: Boot & RetroArch Config on the Pi
1. Add these lines to `/boot/config.txt` on the Pi so HDMI is the primary display for games and the 7" Touchscreen is the secondary framebuffer (`/dev/fb1`):
   ```ini
   display_default_lcd=0
   max_framebuffers=2
   hdmi_force_hotplug=1
   hdmi_drive=2
   hdmi_group=1
   hdmi_mode=16
   disable_overscan=1
   gpu_mem=256
   ```
2. Add these lines to `/opt/retropie/configs/nes/retroarch.cfg` on the Pi so the 7" Touchscreen buttons can control RetroArch and capture victory screenshots:
   ```ini
   network_cmd_enable = "true"
   network_cmd_port = "55355"
   screenshot_directory = "/home/pi/.config/retroarch/screenshots"
   aspect_ratio_index = "0"
   video_shader_enable = "true"
   video_shader = "/opt/retropie/emulators/retroarch/shader/crt-pi.glslp"
   run_ahead_enabled = "true"
   run_ahead_frames = "1"
   run_ahead_secondary_instance = "true"
   ```

### Step 2: Install & Run the Companion Server + Touchscreen Kiosk on the Pi
After running `./sync_with_pi.sh` from your Linux machine (which copies this repo to `/home/pi/nes-tracker` on the Pi), SSH into the Pi (`ssh pi@retropie.local`) and run:

```bash
# 1. Install minimal X11 + Chromium for the 7" Touchscreen
sudo apt-get update
sudo apt-get install -y --no-install-recommends xserver-xorg xinit openbox chromium-browser unclutter xinput

# 2. Pin X11 to the 7" Touchscreen (/dev/fb1) and ignore the USB NES controller in X11
sudo mkdir -p /etc/X11/xorg.conf.d
sudo tee /etc/X11/xorg.conf.d/99-touchscreen-fb1.conf > /dev/null << 'EOF'
Section "Device"
    Identifier "TouchscreenFB1"
    Driver "fbdev"
    Option "fbdev" "/dev/fb1"
EndSection

Section "InputClass"
    Identifier "IgnoreJoysticksInX11"
    MatchIsJoystick "on"
    Option "Ignore" "on"
EndSection
EOF

# 3. Create the Kiosk startup script
cat << 'EOF' > /home/pi/nes-tracker/start_kiosk.sh
#!/usr/bin/env bash
xset -dpms
xset s off
xset s noblank
unclutter -idle 1 -root &
openbox-session &
exec chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --low-end-device-mode \
  --disk-cache-dir=/tmp/chromium-cache \
  "http://127.0.0.1:8765"
EOF
chmod +x /home/pi/nes-tracker/start_kiosk.sh /home/pi/nes-tracker/pi_server.py

# 4. Enable systemd services so both start automatically on boot
sudo tee /etc/systemd/system/nes-tracker-server.service > /dev/null << 'EOF'
[Unit]
Description=NES Completion Tracker & RetroArch Companion Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/nes-tracker
ExecStart=/usr/bin/python3 /home/pi/nes-tracker/pi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/nes-touch-kiosk.service > /dev/null << 'EOF'
[Unit]
Description=NES 7-Inch Touchscreen Kiosk on /dev/fb1
After=nes-tracker-server.service

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/startx /home/pi/nes-tracker/start_kiosk.sh -- -nocursor
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now nes-tracker-server.service
sudo systemctl enable --now nes-touch-kiosk.service
```

Once enabled, the Pi boots straight into **EmulationStation on the TV** and **the NES Tracker + Control Deck on the 7" Touchscreen** (also accessible from any browser on your Wi-Fi at `http://retropie.local:8765`).
