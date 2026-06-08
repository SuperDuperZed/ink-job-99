# INK JOB '99 RPG

> **GOTTA PRINT 'EM ALL** — A Pokemon-style RPG set in the criminal underworld of money printing. Pure TypeScript, zero dependencies, all original pixel art.

## Play

**[Play INK JOB '99 RPG →](https://superduperzed.github.io/ink-job-99/)**

Best experienced with sound on. Works on desktop and mobile.

## How to Play

Explore **Ink City**, battle rival printers, collect and level up 8 unique printer types, and defeat **Agent Sterling** to unlock the Federal Vault.

| Control | Action |
|---------|--------|
| Arrow keys | Move around the overworld |
| SPACE | Talk to NPCs / Confirm actions |
| ESC | Open menu |
| ENTER | Start game / Confirm (title screen) |

## Printer Types

Type advantages follow a 5-element cycle:

**Offset > Laser > Inkjet > Letterpress > Thermo > Offset**

Screen type deals boosted damage to all but takes extra from all.

| Printer | Type | Style |
|---------|------|-------|
| DripDrop | Inkjet | Fast, balanced starter |
| BoltPress | Offset | High HP, strong attacks |
| LaserMike | Laser | Glass cannon, fast |
| OldType | Letterpress | Tanky, slow |
| HeatWave | Thermo | Powerful but fragile |
| ScreenDoor | Screen | Tricky, boosted damage |
| DieHard | Laser | Armored endgame printer |
| GoldPress | Thermo | Legendary, found in the Federal Vault |

## Game World

- **Print Shop** — Starting area. Doc Plates heals your printers. Sal sells items.
- **Back Alley** — Random encounters, levels 2-5
- **Warehouse District** — Random encounters, levels 6-12. Rival Tony Two-Tone awaits.
- **The Docks** — High-level encounters, levels 10-18
- **Federal Building** — Locked until you beat the harbor boss. Legendary GoldPress sleeps inside.

## Tech

- Pure TypeScript, zero dependencies
- HTML5 Canvas at 320x240 virtual resolution
- All sprites are hand-crafted pixel art drawn programmatically (24x24 battle sprites, 16x16 overworld)
- Pokemon-style turn-based battle engine with type chart, STAB, PP management, XP/leveling
- Chiptune SFX via Web Audio API oscillators
- CRT scanline effect via CSS
- Save/load to localStorage
- Overworld with tile-based map, NPC interactions, shops, random encounters

## Build

```bash
bun install
bun run build  # compiles src/game.ts → game.js
```

Open `index.html` in a browser.
