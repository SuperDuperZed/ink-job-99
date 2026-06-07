# INK JOB '99

> **THE MONEY PRINTING ARCADE GAME** — An 8-bit browser game with original sprites, chiptune audio, and late 90s web aesthetic.

![banner](https://img.shields.io/badge/ink--job-99-8bit-green?style=for-the-badge)
![release](https://img.shields.io/badge/released-1999-orange?style=for-the-badge)
![no deps](https://img.shields.io/badge/dependencies-NONE-blue?style=for-the-badge)

## Play

**[Play INK JOB '99 →](https://superduperzed.github.io/ink-job-99/)**

Best experienced with sound on. Works on desktop and mobile.

## How to Play

You are **INKY** — a rogue money printer. Catch falling bills, avoid hazards, and survive federal raids.

| Control | Action |
|---------|--------|
| ← → or A/D | Move left/right |
| P / Esc | Pause |
| Enter | Start / Next level |
| Touch | Tap left/right half |

## Game Elements

### Bills (catch these!)
- **$1** — Slow, 10 pts
- **$5** — Medium, 50 pts
- **$20** — Fast, 200 pts
- **$100** — Very fast, 1000 pts

### Obstacles (avoid these!)
- **Ink Splat** — Loses a life
- **Paper Jam** — Loses a life
- **Shredded Bill** — Loses a life

### Power-Ups
- **Magnet** — Attracts nearby bills for 8s
- **Shield** — Blocks one hit
- **2x Double** — Double points for 10s

### Combos
Catch consecutive bills without missing to build your combo multiplier. Every 5 consecutive catches increases the multiplier by 0.5x.

### Fed Raids
Starting at Level 5, federal agents raid the press. Avoid them or it's game over instantly.

## Tech

- Pure TypeScript, zero dependencies
- HTML5 Canvas at 320x240 virtual resolution
- All sprites are hand-crafted pixel art drawn programmatically
- Chiptune audio via Web Audio API oscillators
- CRT scanline effect via CSS
- High scores saved to localStorage

## Build

```bash
bun install
bun run build  # compiles src/game.ts → game.js
```

Open `index.html` in a browser.

## License

MIT — but the money you print isn't real.
