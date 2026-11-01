#!/usr/bin/env bash
# =============================================================================
# Automated Setup Script for Raspberry Pi 3B + Official 7" DSI Touchscreen
# =============================================================================
# Run this script ON the Raspberry Pi after syncing the repo to /home/pi/nes-tracker:
#   cd /home/pi/nes-tracker && sudo ./setup_pi_touchscreen.sh
# =============================================================================

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo ./setup_pi_touchscreen.sh"
  exit 1
fi

PI_USER="${SUDO_USER:-pi}"
TRACKER_DIR="/home/${PI_USER}/nes-tracker"
BOOT_CONFIG="/boot/config.txt"
[ -f "/boot/firmware/config.txt" ] && BOOT_CONFIG="/boot/firmware/config.txt"
RETROARCH_NES_CFG="/opt/retropie/configs/nes/retroarch.cfg"

echo "=== [1/5] Configuring ${BOOT_CONFIG} for Dual Display (HDMI TV + 7\" Touchscreen) ==="
if ! grep -q "display_default_lcd=0" "${BOOT_CONFIG}"; then
  cat << 'EOF' >> "${BOOT_CONFIG}"

# --- NES Completion Project: Dual Display (HDMI = Frame TV, DSI = 7" Touchscreen) ---
display_default_lcd=0
max_framebuffers=2
hdmi_force_hotplug=1
hdmi_drive=2
hdmi_group=1
hdmi_mode=16
disable_overscan=1
gpu_mem=256
# Uncomment lcd_rotate=2 below if your 7" touchscreen stand is upside-down:
# lcd_rotate=2
EOF
  echo "  -> Added dual-display HDMI + DSI config to ${BOOT_CONFIG}"
else
  echo "  -> ${BOOT_CONFIG} already contains display_default_lcd=0"
fi

echo "=== [2/5] Installing Minimal X11 & Chromium Kiosk Packages ==="
apt-get update
apt-get install -y --no-install-recommends \
  xserver-xorg xinit openbox chromium-browser unclutter xinput python3

echo "=== [3/5] Pinning X11 to 7\" Touchscreen (/dev/fb1) & Ignoring NES Controller in X11 ==="
mkdir -p /etc/X11/xorg.conf.d
cat << 'EOF' > /etc/X11/xorg.conf.d/99-touchscreen-fb1.conf
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

# Allow non-root Xorg to start from systemd service
if [ -f /etc/X11/Xwrapper.config ]; then
  sed -i 's/allowed_users=.*/allowed_users=anybody/' /etc/X11/Xwrapper.config
else
  echo "allowed_users=anybody" > /etc/X11/Xwrapper.config
fi

echo "=== [4/5] Configuring RetroArch NES UDP Network Commands & CRT Shader ==="
if [ -f "${RETROARCH_NES_CFG}" ] && ! grep -q "network_cmd_enable" "${RETROARCH_NES_CFG}"; then
  sed -i '1i # --- NES Tracker Touchscreen UDP & Shader Config ---\nnetwork_cmd_enable = "true"\nnetwork_cmd_port = "55355"\nscreenshot_directory = "/home/'"${PI_USER}"'/.config/retroarch/screenshots"\naspect_ratio_index = "0"\nvideo_shader_enable = "true"\nvideo_shader = "/opt/retropie/emulators/retroarch/shader/crt-pi.glslp"\nrun_ahead_enabled = "true"\nrun_ahead_frames = "1"\nrun_ahead_secondary_instance = "true"\n' "${RETROARCH_NES_CFG}"
  mkdir -p "/home/${PI_USER}/.config/retroarch/screenshots"
  chown -R "${PI_USER}:${PI_USER}" "/home/${PI_USER}/.config"
fi

echo "=== [5/5] Creating Kiosk Script & Enabling Systemd Services ==="
cat << 'EOF' > "${TRACKER_DIR}/start_kiosk.sh"
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

chmod +x "${TRACKER_DIR}/start_kiosk.sh" "${TRACKER_DIR}/pi_server.py"
chown -R "${PI_USER}:${PI_USER}" "${TRACKER_DIR}"

cat << EOF > /etc/systemd/system/nes-tracker-server.service
[Unit]
Description=NES Completion Tracker & RetroArch Companion Server
After=network.target

[Service]
Type=simple
User=${PI_USER}
WorkingDirectory=${TRACKER_DIR}
ExecStart=/usr/bin/python3 ${TRACKER_DIR}/pi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

cat << EOF > /etc/systemd/system/nes-touch-kiosk.service
[Unit]
Description=NES 7-Inch Touchscreen Kiosk on /dev/fb1
After=nes-tracker-server.service

[Service]
Type=simple
User=${PI_USER}
ExecStart=/usr/bin/startx ${TRACKER_DIR}/start_kiosk.sh -- -nocursor
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nes-tracker-server.service nes-touch-kiosk.service
systemctl restart nes-tracker-server.service

echo "============================================================================="
echo "✅ Setup complete! Reboot the Raspberry Pi now so dual-display takes effect:"
echo "   sudo reboot"
echo "============================================================================="
