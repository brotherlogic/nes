# NES Completion Project — Definitive Game List & Tracker

This repository contains the **definitive, auditable catalog of every official licensed NES release** across North America, Europe (PAL), and Australia, classified according to strict completion criteria for beating every completable English-language NES game.

---

## Executive Summary & Target Numbers

| Category | Count | Description |
| :--- | :---: | :--- |
| **Included (Core Target List)** | **549** | Official licensed English NES games playable with a standard controller that have a definitive end-of-game screen or credits sequence. |
| **Borderline (Toggleable Soft Endings)** | **24** | Looping/arcade/sports titles with an end-of-cycle celebration, podium, or finite stage cycle before looping (e.g., *Excitebike*, *Mach Rider*, *Spelunker*, *R.C. Pro-Am*). |
| **Excluded** | **136** | Endless score loops, exhibition-only sports, single-session game shows/board games, required peripherals (Zapper/Power Pad/R.O.B./Miracle Piano), educational/preschool titles, open-ended sandboxes, multicarts, and French-only *Les Chevaliers du Zodiaque*. |
| **Total Unique Licensed Releases** | **709** | Complete accounting of the licensed Western NES library (equivalent to **712 physical cartridges** when counting the *Stadium Events* and *Namco Pac-Man* NA label variants and the PAL *Mario Bros. Classic Series* re-release). |

> **How the "677" North American Collector Set Reconciles to 709 Unique Entries:**
> - **674** unique standalone North American licensed releases + **5** official North American licensed multicarts (*Super Mario Bros./Duck Hunt*, *Super Mario Bros./Duck Hunt/World Class Track Meet*, *Super Spike V'Ball/Nintendo World Cup*, *Donkey Kong Classics*, *Sesame Street: A-B-C & 1-2-3*) = **679** North American entries (or **675** when excluding the 4 pack-in/2-in-1 multicarts, plus the **2** physical cartridge variants *Stadium Events* [identical ROM to *World Class Track Meet*] and 1993 *Namco Pac-Man* [identical ROM to 1988 licensed *Tengen Pac-Man*] = **677**).
> - **30** PAL/Australian-exclusive Included games + **5** PAL-exclusive Excluded entries (*Devil World*, *Dropzone*, *Elite*, *Les Chevaliers du Zodiaque*, *Mario Bros. Classic Series*, *3-in-1 SMB/Tetris/World Cup*) = **35** PAL-only entries (`674 + 5 + 35 = 709` unique rows).

---

## Project Rules & Qualification Criteria

1. **Release Scope:** Official Nintendo-licensed NES releases only (North America, Europe/PAL, and Australia). Unlicensed releases, Famicom/FDS-only releases, and modern homebrew are out of scope.
2. **Regional Deduplication & Language:** Includes all North American licensed games plus all English-language PAL and Australian exclusives (such as *Mr. Gimmick*, *Ufouria: The Saga*, *Rainbow Islands: Bubble Bobble 2*, *New Ghostbusters II*, *Noah's Ark*, *Over Horizon*, *Super Turrican*, *Hammerin' Harry*, *Aladdin*, *The Lion King*, *Beauty and the Beast*, *Asterix*, *The Smurfs*, *Aussie Rules Footy*, *International Cricket*, etc.). Regional renames (e.g., *Contra* / *Probotector*, *Ninja Gaiden* / *Shadow Warriors*, *Fire 'n Ice* / *Solomon's Key 2*) are deduplicated into single entries with both titles searchable. French-only PAL exclusive *Les Chevaliers du Zodiaque: La Légende d'Or* is excluded.
3. **Standard Controller Only:** Any game that strictly requires the **Zapper** light gun, **Power Pad** mat, **R.O.B.**, or **Miracle Piano** keyboard is excluded. Games where the Zapper or Power Glove is optional and a standard controller works (*Operation Wolf*, *Mechanized Attack*, *The Lone Ranger*, *Laser Invasion*, *The Adventures of Bayou Billy*, *Day Dreamin' Davey*, *Super Glove Ball*, *Bad Street Brawler*, *Track & Field II*) are **included**.
4. **Looping & Arcade Games:**
   - **Included:** Games that display a victory/congratulations sequence or credits after completing all unique stages, even if they subsequently loop into a harder quest (e.g., *Super Mario Bros.*, *Kung Fu*, *Castlevania*, *Gradius*, *1942*).
   - **Borderline (Toggleable):** Games with a brief end-of-cycle milestone/podium before looping or a finite track/stage cycle with no stop screen (*Excitebike*, *Mach Rider*, *Spelunker*, *R.C. Pro-Am*, *Commando*, *Tiger-Heli*, *Xenophobe*, *Track & Field*, *Lunar Pool*, etc.).
   - **Excluded:** Pure endless score-attack loops with no end-of-cycle victory sequence (*Donkey Kong*, *Pac-Man*, *Galaga*, *Mario Bros.*, *Pinball*, *Millipede*, *BurgerTime*, *Wrecking Crew*, *Lode Runner*, etc.).
5. **Sports, Racing, Tabletop, Game Shows & Casino:**
   - **Included:** Only titles featuring a multi-match **Tournament, Season, Pennant, League, or Campaign Ladder** that culminates in an official Championship / ending screen (e.g., *Tecmo Bowl*, *Tecmo Super Bowl*, *Blades of Steel*, *Mike Tyson's Punch-Out!!*, *NES Open Tournament Golf*, *Casino Kid 1 & 2*, *Vegas Dream*, *Othello*, *Anticipation*, *Battleship*).
   - **Excluded:** Single-match exhibition sports (*Baseball*, *Ice Hockey*, *Double Dribble*, *Soccer*, *Tennis*, *Golf*, etc.) and single-episode TV game shows / single-match board games (*Jeopardy!*, *Wheel of Fortune*, *Family Feud*, *Monopoly*, *The Chessmaster*, *Caesars Palace*).
6. **Puzzle Games:** Includes both linear stage-clear puzzle games (*Adventures of Lolo 1–3*, *Solomon's Key*, *Fire 'n Ice*, *Wario's Woods*, *Kickle Cubicle*, *Lemmings*) and action/drop puzzle games that reward clearing a specific mode/level milestone with an official ending sequence or credits (*Tetris* Type-B 9-5, *Dr. Mario* Level 20, *Yoshi* Type-B High 9, *Yoshi's Cookie* Round 10-10, *Palamedes* Tournament, *Hatris* Final Sale, *Pipe Dream* Level 36).
7. **Educational, Preschool & Utility Titles:** All preschool and educational titles (*Sesame Street*, *Fisher-Price*, *Mickey's Numberland/Letterland*, *Mario Is Missing!*, *Mario's Time Machine*, *Where in Time Is Carmen Sandiego?*, *Donkey Kong Jr. Math*) and non-game utilities (*Videomation*, *Color a Dinosaur*, *Taboo: The Sixth Sense*, *Tiny Toon Cartoon Workshop*) are excluded.
8. **True Endings:** Where a game cuts off early on Practice/Easy difficulty or requires a second loop for the real ending (e.g., *Ghosts 'n Goblins* Loop 2, *Double Dragon II* Supreme Master, *Little Samson* Normal, *Mr. Gimmick* all 6 treasures, *Rainbow Islands* all 7 Giant Diamonds), the true ending requirement is documented in `win_condition`.

---

## Breakdown of the 549 Included Games by Region

| Region | Included Games |
| :--- | :---: |
| **North America + PAL (Released in Both)** | 245 |
| **North America Exclusive (NTSC)** | 275 |
| **PAL Exclusive (Europe)** | 27 |
| **PAL Exclusive (Australia)** | 2 |
| **Total Core Completable List** | **549** |

## Breakdown of the 549 Included Games by Genre

| Genre | Count |
| :--- | :---: |
| Action / Platformer | 172 |
| Sports (Tournament / Season) | 62 |
| Shoot 'Em Up | 38 |
| Action / Adventure | 26 |
| Action / RPG | 19 |
| RPG | 18 |
| Racing (Championship / Campaign) | 18 |
| Puzzle | 15 |
| Beat 'Em Up | 14 |
| Run 'n' Gun | 13 |
| Strategy / Simulation | 13 |
| Adventure / Point-and-Click | 8 |
| Simulation / Flight | 7 |
| Action / Beat 'Em Up | 6 |
| Puzzle / Platformer | 6 |
| Action / Shoot 'Em Up | 5 |
| Arcade Platformer | 5 |
| Action / Shooter | 4 |
| Arcade / Breakout | 4 |
| Arcade Action | 4 |
| Gallery Shooter | 4 |
| Racing / Action | 4 |
| Action / Hack & Slash | 3 |
| Action / Stealth | 3 |
| Arcade / Puzzle | 3 |
| Puzzle / Action | 3 |
| Racing / Vehicular Combat | 3 |
| Simulation / Action | 3 |
| Strategy / Action | 3 |
| Tabletop / Casino (Campaign) | 3 |
| Action / Arcade | 2 |
| Action / Espionage | 2 |
| Action / Minigames | 2 |
| Action / Survival | 2 |
| Action / Top-Down | 2 |
| Beat 'Em Up / Action | 2 |
| Puzzle / Picture Search | 2 |
| Run 'n' Gun / Driving | 2 |
| Run 'n' Gun / Platformer | 2 |
| Simulation / Strategy | 2 |
| Sports / Action | 2 |
| Tabletop / Board (Campaign) | 2 |
| Action / Board-Strategy | 1 |
| Action / Detective | 1 |
| Action / Driving | 1 |
| Action / Fighting | 1 |
| Action / Flight / Shooter | 1 |
| Action / Grav-Shooter | 1 |
| Action / Hybrid | 1 |
| Action / Platformer / Driving | 1 |
| Action / Puzzle | 1 |
| Action / Run 'n' Gun | 1 |
| Action / Sports | 1 |
| Action / Tactical | 1 |
| Adventure / Action | 1 |
| Arcade / Action | 1 |
| Arcade / Racing | 1 |
| Arcade Dungeon | 1 |
| Arcade Puzzle | 1 |
| ArcadeMaze / Action | 1 |
| Arena Shooter | 1 |
| Beat 'Em Up / RPG | 1 |
| Beat 'Em Up / Run 'n' Gun | 1 |
| Fighting | 1 |
| Pinball / RPG | 1 |
| Puzzle / Isometric | 1 |
| Racing / Shoot 'Em Up | 1 |
| Run 'n' Gun / Adventure | 1 |
| Run 'n' Gun / Tank | 1 |
| Shoot 'Em Up / Action | 1 |
| Shoot 'Em Up / Flight | 1 |
| Shoot 'Em Up / Simulation | 1 |
| Simulation / Space Shooter | 1 |
| Sports / Boxing | 1 |
| Sports / Fighting | 1 |
| Strategy / Board (Campaign) | 1 |
| Strategy / RPG | 1 |
| Strategy / Turn-Based | 1 |

---

## Breakdown of the 136 Excluded Games by Reason

| Exclusion Category | Count |
| :--- | :---: |
| Endless Arcade / Score Loop | 40 |
| Exhibition-Only Sports / Racing | 26 |
| Single-Session Game Show / Board / Casino | 24 |
| Educational / Preschool / Non-Game Utility | 18 |
| Peripheral Required (Zapper) | 9 |
| Peripheral Required (Power Pad) | 6 |
| Multi-cart Compilation | 5 |
| Open-Ended Sandbox / Simulation | 3 |
| Non-English / Regional Re-release | 2 |
| Peripheral Required (R.O.B.) | 2 |
| Peripheral Required (Miracle Piano) | 1 |

---

## Repository Files & Local Web Tracker

- [`HARDWARE.md`](./HARDWARE.md) — **Complete Hardware, OS & Samsung Frame TV Setup Guide** (Raspberry Pi 3 Model B v1.2 + Official 7" Touchscreen Stand companion kiosk + Wired USB NES Controller + Samsung Frame One Connect Box low-lag Game Mode + `crt-pi` shader + 1-frame Run-Ahead).
- [`index.html`](./index.html) / [`app.js`](./app.js) / [`styles.css`](./styles.css) / [`data.js`](./data.js) — **Interactive NES Completion Tracker & Touchscreen Control Deck**. Open `index.html` directly in any browser or serve it on the Raspberry Pi via [`pi_server.py`](./pi_server.py) (`http://retropie.local:8765`).
- [`pi_server.py`](./pi_server.py) — **Raspberry Pi 3B Companion Server**. Serves the tracker UI to the 7" Touchscreen and local Wi-Fi, bridges touchscreen buttons (`SAVE_STATE`, `LOAD_STATE`, `RESET`, `PAUSE_TOGGLE`, `QUIT`, `SCREENSHOT`) to RetroArch over UDP (`127.0.0.1:55355`), launches ROMs on the TV, and captures victory end-screen screenshots.
- [`sync_with_pi.sh`](./sync_with_pi.sh) — **Bidirectional Wi-Fi Sync & Backup Script**. Pushes ROMs and tracker updates to the Pi and pulls battery saves (`*.srm`), save states (`*.state*`), captured victory screenshots (`screenshots/*.png`), and `progress.json` back to this Linux machine.
- [`nes_games.json`](./nes_games.json) — Complete structured JSON dataset of all 709 licensed NES releases with win conditions and exclusion reasons.
- [`nes_games.csv`](./nes_games.csv) — Complete CSV spreadsheet of all 709 licensed NES releases.
- [`NES_COMPLETION_GUIDE.md`](./NES_COMPLETION_GUIDE.md) — Full Markdown checklist of all 549 Included games, 24 Borderline games, and 136 Excluded games with every game's specific win condition.
# nes
