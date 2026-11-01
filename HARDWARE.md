# NES Completion Project — Hardware, OS & Samsung Frame TV Setup Guide

This guide covers the complete hardware, operating system, dual-display, emulator, and Wi-Fi backup configuration for playing all **549+ completable NES games** on your **Samsung Frame TV** using your **Raspberry Pi 3 Model B v1.2** (mounted in its **7" Touchscreen Stand**) and a **wired USB NES controller**.

---

## 1. System Architecture & Physical Connections

Putting the **Raspberry Pi 3 Model B v1.2 + 7" Touchscreen Stand** on a coffee or side table next to the couch gives you a dual-screen setup:
- **Samsung Frame TV (via One Connect Box over HDMI):** Displays the **EmulationStation** controller menu and **RetroArch** NES gameplay at a locked **1080p @ 60Hz** with the `crt-pi` CRT shader.
- **7" Touchscreen Stand (800×480 DSI ribbon):** Displays your interactive **NES Completion Tracker** (`index.html` served by `pi_server.py`), allowing you to:
  - Read the active game's exact true-ending win condition while you play
  - Tap **▶ TV** (or **🎲 Pick Random Game**) to launch any game directly on the Samsung Frame TV
  - Tap **📸 Capture End Screen & Complete!** the moment you reach a game's victory screen to snap a PNG screenshot from the TV, mark the game completed, and log the date
  - Tap thumb-friendly **💾 Save State**, **📂 Load State**, **⏸ Pause**, **🔄 Reset NES**, **⏹ Quit to TV Menu**, and **⏻ Safe Shutdown Pi** buttons without needing extra buttons on your 2-button NES controller

```
  [ Couch / Coffee Table ]                                  [ Media Console / Wall ]
┌──────────────────────────────────────────┐              ┌──────────────────────────┐
│ Raspberry Pi 3 Model B v1.2              │              │ Samsung One Connect Box  │
│  ├── 7" DSI Touchscreen (800x480)        │              │  ├── HDMI In (Game Mode) │
│  │    └── NES Tracker + Touch Controls   │  10–15ft     │  └── One Invisible Cable │
│  ├── USB-A ──► Wired USB NES Controller  │  HDMI Cable  │           │              │
│  ├── Micro-USB ──► 5.1V / 2.5A+ PSU      │ ───────────► │           ▼              │
│  └── Full-Size HDMI Out ─────────────────┼─────────────►│   Samsung Frame 4K TV    │
└──────────────────────────────────────────┘              └──────────────────────────┘
                     ▲
                     │ Wi-Fi (rsync via ./sync_with_pi.sh)
                     ▼
┌──────────────────────────────────────────┐
│ Linux Workstation (/var/home/simon/...)  │
│  └── Backups of .srm, .state, PNGs, JSON │
└──────────────────────────────────────────┘
```

### Checklist of Physical Parts & Cables
1. **Board & Display:** Raspberry Pi 3 Model B v1.2 mounted to the Official Raspberry Pi 7" Touchscreen Display (connected via the flat DSI ribbon cable and either the 5V/GND GPIO jumper wires or short USB power jumper).
2. **Power Supply (Critical):** Use an official or high-quality **5.1V / 2.5A (or 3.0A) Micro-USB power supply**.
   - *Why:* Powering both the Pi 3B and the 7" Touchscreen backlight draws ~1.8A–2.2A under load. Phone chargers rated at 5.0V / 1.5A will cause voltage droop (the yellow lightning bolt icon in the corner) and CPU throttling from 1.2GHz down to 600MHz, causing audio crackle.
3. **HDMI Cable:** A **10–15ft (3m–5m) High-Speed HDMI cable** (full-size HDMI Male to HDMI Male) running from the Pi 3B's HDMI port to an available HDMI port on the **Samsung One Connect Box** (use HDMI 1, 2, or 3; leave HDMI 4 / eARC free if you use an external soundbar).
4. **Storage:** A **16GB or 32GB Class 10 / A1 microSD card** (SanDisk Ultra/Extreme or Samsung EVO Endurance recommended).
5. **Controller:** Your **Wired USB NES Controller** plugged directly into one of the four USB-A ports on the Pi 3B.

---

## 2. Samsung Frame TV & One Connect Box Configuration

Samsung Frame TVs perform heavy image processing in *Art*, *Movie*, and *Standard* modes (~75–110ms of input lag), which makes timing-critical NES games like *Mike Tyson's Punch-Out!!*, *Battletoads*, and *Ghosts 'n Goblins* feel sluggish. Enabling **Game Mode** drops the Frame TV's input lag to **~9–13ms**.

### Step-by-Step Samsung Frame TV Settings
1. **Plug the Pi's HDMI cable into the One Connect Box** (e.g., `HDMI 2`) and power on the Pi.
2. **Label the Input as a Game Console:**
   - On the Samsung remote, press **Home** → navigate to **Connected Devices** → highlight the Pi's HDMI port → press **Down** → select **Edit** → choose **Game Console** as the device icon.
3. **Turn On Game Mode:**
   - Go to **Settings (⚙️) → All Settings → Connection → Game Mode Settings → Game Mode** and set it to **On** (or **Auto**).
4. **Disable Frame Interpolation (Game Motion Plus):**
   - Inside **Game Mode Settings → Game Motion Plus Settings**, set **Game Motion Plus = Off** (or set both *Blur Reduction* and *Judder Reduction* to `0`). Motion interpolation adds latency and creates artifacts around 60fps 2D sprites.
5. **Picture Settings for Crisp 2D Pixel Art:**
   - **Settings → Picture → Expert Settings:**
     - **Sharpness:** `0` (neutral on Samsung TVs; higher values add artificial white halos around pixel edges)
     - **Contrast Enhancer:** `Off`
     - **Color Tone:** `Warm1` or `Standard`
     - **Picture Size Settings:** `16:9 Standard` with **Fit to Screen = On** (prevents overscan from cropping out the bottom HUD in NES games).

---

## 3. Operating System Installation (RetroPie on Raspberry Pi 3B)

We recommend **RetroPie 4.8 (Raspberry Pi 2/3 image)**, which is built on minimal Raspberry Pi OS Lite. It boots rapidly, uses only ~140MB of your Pi 3B's 1GB RAM, and supports driving **EmulationStation/RetroArch on HDMI** while running our **Python Companion Server + Kiosk Browser on the 7" Touchscreen**.

### Step 1: Flash the microSD Card from Your Linux PC
1. Download the official **RetroPie 4.8 for Raspberry Pi 2/3** image (`retropie-buster-4.8-rpi2_rpi3.img.gz`) from [retropie.org.uk/download](https://retropie.org.uk/download/), or use **Raspberry Pi Imager** (`sudo dnf install rpi-imager` or `flatpak install flathub org.raspberrypi.rpi-imager`):
   - **Choose Device:** `Raspberry Pi 3`
   - **Choose OS:** `Emulation and game OS` → `RetroPie` → `RetroPie 4.8 (RPi 2/3)`
   - **Choose Storage:** Your microSD card.

### Step 2: Pre-Configure Dual-Display Routing (`HDMI` + `7" Touchscreen`), Wi-Fi & SSH
Before removing the microSD card from your Linux PC, mount the `boot` partition (`FAT32`) and make three edits so the Pi boots onto your **Samsung Frame TV** (instead of trapping EmulationStation on the 7" screen) and connects to Wi-Fi automatically:

1. **Enable SSH:** Create an empty file named `ssh` in the root of the `boot` partition:
   ```bash
   touch /run/media/$USER/boot/ssh
   ```
2. **Configure Wi-Fi:** Create `/run/media/$USER/boot/wpa_supplicant.conf`:
   ```ini
   ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
   update_config=1
   country=US

   network={
       ssid="YOUR_WIFI_SSID"
       psk="YOUR_WIFI_PASSWORD"
   }
   ```
   *(Adjust `country=GB`, `AU`, `CA`, etc. to match your local Wi-Fi regulatory domain.)*
3. **Configure `/run/media/$USER/boot/config.txt` for Simultaneous HDMI (TV) + 7" Touchscreen:**
   Append these lines to the bottom of `config.txt` on the `boot` partition:
   ```ini
   # --- Dual Display: Route Primary Video (RetroArch/EmulationStation) to Samsung Frame TV ---
   display_default_lcd=0
   max_framebuffers=2

   # --- Force Clean 1080p @ 60Hz Output & HDMI Audio to Samsung One Connect Box ---
   hdmi_force_hotplug=1
   hdmi_drive=2
   hdmi_group=1
   hdmi_mode=16
   disable_overscan=1

   # --- If your 7" Touchscreen is mounted upside-down in its stand, uncomment below ---
   # lcd_rotate=2

   # --- Allocate 256MB to VideoCore IV GPU for smooth CRT shaders & EmulationStation ---
   gpu_mem=256
   ```
   > **Why `display_default_lcd=0` and `max_framebuffers=2` matter:**
   > When the Official 7" DSI Touchscreen is connected, the Pi 3B's firmware defaults to making the 7" LCD `/dev/fb0` (Primary) and ignores HDMI unless `display_default_lcd=0` is set. With `display_default_lcd=0` and `max_framebuffers=2`, the **Samsung Frame TV becomes `/dev/fb0` (`1920x1080@60Hz`)** for EmulationStation and RetroArch, while the **7" Touchscreen becomes `/dev/fb1` (`800x480`)** for your NES Completion Tracker!

---

## 4. Setting Up the 7" Touchscreen Companion Kiosk & Server

Once you insert the microSD card into the Pi 3B and power it on, verify you can reach it from this Linux PC:
```bash
ssh pi@retropie.local
# Default password is: raspberry
```

### Step 1: Set Up Passwordless SSH & Push the NES Tracker Project
From your Linux PC in `/var/home/simon/projects/nes`:
```bash
ssh-copy-id pi@retropie.local
chmod +x /var/home/simon/projects/nes/pi_server.py /var/home/simon/projects/nes/sync_with_pi.sh
/var/home/simon/projects/nes/sync_with_pi.sh
```
This copies `index.html`, `app.js`, `styles.css`, `data.js`, `nes_games.json`, and `pi_server.py` into `/home/pi/nes-tracker` on your Raspberry Pi.

### Step 2: Install the Lightweight Touchscreen Kiosk & Systemd Services on the Pi
SSH into the Pi (`ssh pi@retropie.local`) and install a minimal X11 server + Chromium for `/dev/fb1` (the 7" Touchscreen):
```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends xserver-xorg xinit openbox chromium-browser unclutter xinput
```

Tell Xorg to run exclusively on the **7" DSI Touchscreen (`/dev/fb1`)** and ignore the USB NES controller so X11 never steals controller inputs from RetroArch:
```bash
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
```

Now create two systemd services on the Pi—one for `pi_server.py` (port `8765`) and one to launch the Kiosk UI on the 7" Touchscreen at boot:
```bash
# 1. NES Companion Server (serves Tracker UI + RetroArch UDP bridge on port 8765)
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

# 2. 7-Inch Touchscreen Kiosk Service (displays http://127.0.0.1:8765 on /dev/fb1)
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
chmod +x /home/pi/nes-tracker/start_kiosk.sh

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
> **Bonus:** Because `pi_server.py` listens on `0.0.0.0:8765`, you can also open `http://retropie.local:8765` on your phone, tablet, or laptop at any time—every check mark, note, or victory screenshot updates live across both the 7" Touchscreen and your browser!

---

## 5. RetroArch & NES Core Tuning (`lr-fceumm`)

For the Raspberry Pi 3 Model B v1.2, **`lr-fceumm`** (the default NES core in RetroPie) is the ideal choice: it handles every mapper across our 549+ game list, automatically switches between **NTSC (60Hz)** and **PAL (50Hz)** based on the ROM's region tag, and uses only ~35% of one CPU core—leaving plenty of headroom for **1-Frame Run-Ahead** and the **`crt-pi` CRT shader**.

### Optimal `/opt/retropie/configs/nes/retroarch.cfg` Settings
On your Raspberry Pi, append or set the following values in `/opt/retropie/configs/nes/retroarch.cfg` (before the `#include "/opt/retropie/configs/all/retroarch.cfg"` line):

```ini
# --- 1. Enable UDP Network Commands for the 7" Touchscreen Control Deck ---
network_cmd_enable = "true"
network_cmd_port = "55355"

# --- 2. 4:3 CRT TV Aspect Ratio & Pi 3 Optimized CRT Shader (crt-pi) ---
aspect_ratio_index = "0"
video_scale_integer = "false"
video_smooth = "false"
video_shader_enable = "true"
video_shader = "/opt/retropie/emulators/retroarch/shader/crt-pi.glslp"

# --- 3. Ultra-Low Input Lag (1-Frame Run-Ahead + Tight Swapchain) ---
run_ahead_enabled = "true"
run_ahead_frames = "1"
run_ahead_secondary_instance = "true"
video_max_swapchain_images = "2"
video_threaded = "false"

# --- 4. Save Screenshots Cleanly for Victory Proof ---
screenshot_directory = "/home/pi/.config/retroarch/screenshots"
savestate_auto_index = "false"
```

### How to Switch Between the CRT Shader and Razor-Sharp Pixels Anytime
- **Default (`crt-pi.glslp`):** Gives you authentic 4:3 CRT scanlines, subtle shadow-mask phosphor glow, and curvature at a locked 60fps on the Pi 3B.
- **To switch to razor-sharp square pixels on the fly:** Press `Select + X` (or tap **⏸ Pause** on the Touchscreen) or edit `retroarch.cfg` to set:
  ```ini
  video_shader_enable = "false"
  video_scale_integer = "true"
  ```

### NTSC (60Hz) vs. PAL Exclusive (50Hz) Timing Accuracy
Our 549 Included games consist of **519 North American (NTSC, 60Hz)** releases and **30 PAL/Australian Exclusives (50Hz)** (such as *Mr. Gimmick*, *Ufouria: The Saga*, *New Ghostbusters II*, *Aladdin*, *The Lion King*, *Asterix*, *Over Horizon*, *Super Turrican*, *Formula 1 Sensation*, and *Aussie Rules Footy*).
- Several PAL exclusives (most famously Sunsoft's *Mr. Gimmick* and *Ufouria*, and Codemasters/Infogrames PAL releases) were specifically programmed for **50Hz PAL timing** and will suffer audio pitch desync or status-bar raster glitches if forced to 60Hz.
- **`lr-fceumm` handles this automatically** as long as your ROM filenames retain their standard No-Intro region tags:
  - North American ROMs named `*(USA)*.nes` run automatically in **NTSC (60.10 Hz)** mode.
  - PAL/Australian Exclusive ROMs named `*(Europe)*.nes`, `*(PAL)*.nes`, or `*(Australia)*.nes` run automatically in **PAL (50.00 Hz)** mode!

---

## 6. Wired USB NES Controller Mapping & Safe Hotkeys

A classic 2-button USB NES controller only has **D-Pad, Select, Start, B, and A**. When EmulationStation first boots and asks you to hold a button to configure your controller:

1. Map **D-Pad Up, Down, Left, Right**, **Start**, **Select**, **A** (Right face button), and **B** (Left face button).
2. For all unmapped buttons (X, Y, L, R, L2, R2, L3, R3, Analog Sticks), **hold down any button for 2 seconds to skip** each one.
3. When asked for **Hotkey Enable** at the very end, press **Select**.

### Recommended 2-Button Controller Hotkey Combos (+ Touchscreen Equivalents)
Because many NES games use **Select** during gameplay (e.g., switching missiles in *Metroid* or pausing/sub-weapons in *Mega Man*), avoid mapping `Select + B` or `Select + A` if you tend to press Select while jumping/shooting—or use the **7" Touchscreen Deck** right beside you!

| Action | 7" Touchscreen Button | USB NES Controller Combo |
| :--- | :--- | :--- |
| **Capture Victory Screen & Mark Complete** | **📸 Capture End Screen & Complete!** | *(Touchscreen Exclusive)* |
| **Exit Game Back to TV Menu** | **⏹ Quit to TV Menu** | `Select + Start` *(press twice)* |
| **Save State (Current Slot)** | **💾 Save State** | `Select + Right` |
| **Load State (Current Slot)** | **📂 Load State** | `Select + Left` |
| **Change State Slot (+/-)** | **➖ Slot** / **➕ Slot** | `Select + Up` / `Select + Down` |
| **Soft-Reset NES Console** | **🔄 Reset NES** | `Select + B` |
| **Pause / Resume Game** | **⏸ Pause** | *(Touchscreen Deck)* |
| **Safely Power Off Raspberry Pi** | **⏻ Safe Shutdown Pi** | `Start` → *Quit* → *Shutdown System* |

> **Tip to prevent accidental `Select + Start` exits:** Add `quit_press_twice = "true"` to `/opt/retropie/configs/nes/retroarch.cfg` so RetroArch requires pressing `Select + Start` twice within 2 seconds to exit a game.

---

## 7. Loading ROMs & Backing Up Saves, Screenshots, and Progress

Because completing 549 NES games is a multi-year milestone, never rely solely on a single microSD card. We have included **[sync_with_pi.sh](file:///var/home/simon/projects/nes/sync_with_pi.sh)** in `/var/home/simon/projects/nes` to automate backups between your Raspberry Pi 3B and this Linux machine over Wi-Fi.

### How to Load Your NES ROMs
1. Place your `.nes` or `.zip` ROMs into `/var/home/simon/projects/nes/roms/` on this Linux PC (or copy them over Samba at `smb://retropie.local/roms/nes/`).
2. Run the sync script from this Linux PC:
   ```bash
   /var/home/simon/projects/nes/sync_with_pi.sh
   ```

### What `sync_with_pi.sh` Backs Up Automatically Every Time You Run It
1. **Pushes Tracker Updates & New ROMs** from `/var/home/simon/projects/nes/` to the Raspberry Pi (`pi@retropie.local`).
2. **Pulls Battery-Backed SRAM Saves (`*.srm`)** (for RPGs like *Final Fantasy*, *Dragon Warrior I–IV*, *The Legend of Zelda*, *Zelda II*, *Crystalis*, *Kirby's Adventure*, *StarTropics*, and Koei strategy games) and **Save States (`*.state*`)** into `/var/home/simon/projects/nes/backups/saves/`.
3. **Pulls Captured End-Screen Victory Screenshots (`screenshots/*.png`)** and syncs your master **`progress.json`** completion log so your Linux workstation always has an up-to-date backup of every game you have conquered.
