# NES Completion Project — Quick Setup Guide

This guide covers what to run on **this Linux machine (Workstation / Server)** and what to run on the **Raspberry Pi 3B + 7" Touchscreen Device**.

- **Pi Touchscreen Setup Details:** [`SETUP.md`](./SETUP.md)
- **TV & Hardware Wiring Guide:** [`HARDWARE.md`](./HARDWARE.md)
- **Full Game List & Win Conditions (Release Order):** [`NES_COMPLETION_GUIDE.md`](./NES_COMPLETION_GUIDE.md)

---

## 1. What to Run on This Machine (Linux Workstation / Server)

### Run the Tracker Locally
```bash
cd /var/home/simon/projects/nes
./pi_server.py
```
Then open **`http://localhost:8765`** in your browser (or open [`index.html`](./index.html) directly).

### Push ROMs / Sync Progress & Saves with the Raspberry Pi
1. Drop your `.nes` or `.zip` ROM files into `/var/home/simon/projects/nes/roms/`.
2. Copy your SSH key to the Pi once:
   ```bash
   ssh-copy-id pi@retropie.local
   ```
3. Sync tracker code, ROMs, battery saves (`*.srm`), save states (`*.state*`), victory screenshots (`screenshots/*.png`), and `progress.json`:
   ```bash
   cd /var/home/simon/projects/nes
   ./sync_with_pi.sh
   ```

---

## 2. What to Run on the Raspberry Pi 3B + 7" Touchscreen Device

After running `./sync_with_pi.sh` from your Linux machine (which copies this repo to `/home/pi/nes-tracker` on the Pi), SSH into the Pi and run the automated touchscreen setup script (see [`SETUP.md`](./SETUP.md) for full details):

```bash
ssh pi@retropie.local
cd /home/pi/nes-tracker
sudo ./setup_pi_touchscreen.sh
sudo reboot
```

Once rebooted:
- **Samsung Frame TV (`HDMI` / `/dev/fb0`):** Runs **EmulationStation & RetroArch** at 1080p @ 60Hz.
- **7" Touchscreen (`DSI` / `/dev/fb1`):** Boots directly into the **NES Completion Tracker & TV Control Deck** (`http://127.0.0.1:8765`).
