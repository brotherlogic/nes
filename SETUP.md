# Raspberry Pi 3B + 7" Touchscreen Setup Guide (`SETUP.md`)

This guide walks through setting up your **Raspberry Pi 3 Model B v1.2** with the **Official 7" DSI Touchscreen Stand** so that:
- **Samsung Frame TV (`HDMI` / `/dev/fb0`):** Displays **EmulationStation** and **RetroArch** NES games at 1080p @ 60Hz.
- **7" Touchscreen (`DSI` / `/dev/fb1`):** Displays the **NES Completion Tracker & TV Control Deck** in full-screen kiosk mode (`800×480`).

---

## Step 1: Flash RetroPie & Enable Wi-Fi + SSH

1. Flash **RetroPie 4.8 (Raspberry Pi 2/3)** onto a microSD card using **Raspberry Pi Imager** (`Emulation and game OS` → `RetroPie` → `RetroPie 4.8 (RPi 2/3)`).
2. Before ejecting the microSD card from your Linux PC, open the `boot` partition and:
   - Create an empty `ssh` file:
     ```bash
     touch /run/media/$USER/boot/ssh
     ```
   - Create `/run/media/$USER/boot/wpa_supplicant.conf` with your Wi-Fi credentials:
     ```ini
     ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
     update_config=1
     country=US

     network={
         ssid="YOUR_WIFI_SSID"
         psk="YOUR_WIFI_PASSWORD"
     }
     ```
   - Append these lines to `/run/media/$USER/boot/config.txt` so the Pi boots EmulationStation onto the **HDMI TV** instead of the 7" Touchscreen, while keeping the 7" Touchscreen active on `/dev/fb1`:
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

---

## Step 2: Push the Tracker Repo from This Linux PC to the Pi

Insert the microSD card into the Pi 3B, connect the HDMI cable to the Samsung One Connect Box, and power on the Pi.

From this Linux PC (`/var/home/simon/projects/nes`), copy your SSH key and push the project files to `/home/pi/nes-tracker`:
```bash
ssh-copy-id pi@retropie.local
# Default RetroPie password is: raspberry

cd /var/home/simon/projects/nes
./sync_with_pi.sh
```

---

## Step 3: Run the Automated Touchscreen Setup on the Pi

SSH into the Raspberry Pi and run the included setup script [`setup_pi_touchscreen.sh`](./setup_pi_touchscreen.sh):
```bash
ssh pi@retropie.local
cd /home/pi/nes-tracker
sudo ./setup_pi_touchscreen.sh
sudo reboot
```

### What `setup_pi_touchscreen.sh` Configures for You
1. **`/boot/config.txt` Dual-Framebuffer Split:** Ensures `/dev/fb0` is routed to HDMI (`1920×1080 @ 60Hz` for EmulationStation/RetroArch) and `/dev/fb1` is routed to the 7" DSI Touchscreen (`800×480`).
2. **Minimal X11 + Chromium Kiosk on `/dev/fb1`:** Installs `xserver-xorg`, `openbox`, `chromium-browser`, and `unclutter`, and writes `/etc/X11/xorg.conf.d/99-touchscreen-fb1.conf` so X11 runs exclusively on the 7" Touchscreen and ignores your USB NES controller (`MatchIsJoystick "on"` → `Option "Ignore" "on"`).
3. **RetroArch UDP Control Bridge (`127.0.0.1:55355`) & `crt-pi` Shader:** Enables `network_cmd_enable = "true"` and 1-frame Run-Ahead in `/opt/retropie/configs/nes/retroarch.cfg` so the 7" Touchscreen buttons (**📸 Capture End Screen & Complete!**, **💾 Save State**, **📂 Load State**, **🔄 Reset NES**, **⏹ Quit to TV Menu**, **▶ TV**) control the game on your TV.
4. **Systemd Auto-Start Services:** Enables and starts:
   - `nes-tracker-server.service` — runs `pi_server.py` on port `8765`
   - `nes-touch-kiosk.service` — launches Chromium in `--kiosk` mode on the 7" Touchscreen pointing to `http://127.0.0.1:8765`

---

## Step 4: Troubleshooting & Touchscreen Orientation

### 1. The 7" Touchscreen Stand Is Upside-Down
Many Official 7" Raspberry Pi Touchscreen stands mount the screen rotated 180° so the power/HDMI cables exit from the bottom.
- To flip both the **7" LCD image and touch coordinates** 180°, edit `/boot/config.txt` on the Pi and uncomment:
  ```ini
  lcd_rotate=2
  ```
  Then run `sudo reboot`.

### 2. Checking or Restarting the Touchscreen Services
If you want to restart the touchscreen UI or check its logs over SSH without rebooting:
```bash
# Check status of the Python backend server & Kiosk display
sudo systemctl status nes-tracker-server.service
sudo systemctl status nes-touch-kiosk.service

# Restart the Touchscreen Kiosk browser
sudo systemctl restart nes-touch-kiosk.service
```

### 3. Adjusting 7" Touchscreen Brightness (Optional)
If the 7" Touchscreen is too bright next to the couch in a dim room, you can dim the backlight from `255` (max) down to `80`–`120` over SSH:
```bash
echo 100 | sudo tee /sys/class/backlight/rpi_backlight/brightness
```
