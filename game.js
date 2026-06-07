// src/game.ts
var W = 320;
var H = 240;
var PLAYER_SPEED = 140;
var BASE_BILL_SPEED = 45;
var BASE_SPAWN_RATE = 1.8;
var MAX_LIVES = 3;
var INVINCIBLE_TIME = 1.5;
var C = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#E42217",
  dkRed: "#8B0000",
  skin: "#FFCC99",
  dkSkin: "#CC9966",
  blue: "#1E3A8A",
  ltBlue: "#3B82F6",
  green: "#00B341",
  dkGreen: "#004D00",
  ltGreen: "#7CFC00",
  gold: "#FFD700",
  orange: "#FF8C00",
  brown: "#8B4513",
  gray: "#808080",
  ltGray: "#C0C0C0",
  dkGray: "#404040",
  cyan: "#00CED1",
  purple: "#6B21A8",
  pink: "#FF69B4",
  mint: "#98FF98",
  teal: "#0D9488",
  navy: "#0F172A",
  slate: "#1E293B",
  bill1: "#A8D5A2",
  bill5: "#66BB6A",
  bill20: "#2E7D32",
  bill100: "#1B5E20",
  billGold: "#FFC107"
};
var spriteCache = new Map;
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}
function getSprite(name) {
  if (spriteCache.has(name))
    return spriteCache.get(name);
  const s = buildSprite(name);
  spriteCache.set(name, s);
  return s;
}
function buildSprite(name) {
  switch (name) {
    case "player idle":
      return drawPlayer(0);
    case "player left":
      return drawPlayer(-1);
    case "player right":
      return drawPlayer(1);
    case "player catch":
      return drawPlayerCatch();
    case "bill 1":
      return drawBill(C.bill1, "1", 12, 7);
    case "bill 5":
      return drawBill(C.bill5, "5", 12, 7);
    case "bill 20":
      return drawBill(C.bill20, "20", 14, 8);
    case "bill 100":
      return drawBill(C.bill100, "100", 16, 9);
    case "ink splat":
      return drawInkSplat();
    case "paper jam":
      return drawPaperJam();
    case "shredded":
      return drawShredded();
    case "magnet":
      return drawMagnet();
    case "shield":
      return drawShield();
    case "double":
      return drawDouble();
    case "fed left":
      return drawFed(-1);
    case "fed right":
      return drawFed(1);
    case "star":
      return drawStar();
    case "sparkle":
      return drawSparkle();
    default: {
      const [c] = makeCanvas(8, 8);
      return c;
    }
  }
}
function drawPlayer(dir) {
  const [c, ctx] = makeCanvas(16, 16);
  ctx.fillStyle = C.red;
  ctx.fillRect(3, 0, 10, 2);
  ctx.fillRect(2, 2, 12, 1);
  ctx.fillStyle = C.dkRed;
  ctx.fillRect(1, 3, 14, 1);
  ctx.fillStyle = C.skin;
  ctx.fillRect(3, 4, 10, 5);
  ctx.fillStyle = C.black;
  ctx.fillRect(4, 5, 2, 2);
  ctx.fillRect(10, 5, 2, 2);
  ctx.fillStyle = C.white;
  ctx.fillRect(4, 5, 1, 1);
  ctx.fillRect(10, 5, 1, 1);
  ctx.fillStyle = C.dkSkin;
  ctx.fillRect(6, 8, 4, 1);
  ctx.fillStyle = C.blue;
  ctx.fillRect(3, 9, 10, 4);
  ctx.fillStyle = C.brown;
  ctx.fillRect(3, 9, 10, 1);
  ctx.fillStyle = C.gold;
  ctx.fillRect(7, 9, 2, 1);
  ctx.fillStyle = C.ltBlue;
  ctx.fillRect(6, 10, 4, 2);
  ctx.fillStyle = C.skin;
  if (dir === 0) {
    ctx.fillRect(1, 10, 2, 3);
    ctx.fillRect(13, 10, 2, 3);
  } else if (dir === -1) {
    ctx.fillRect(0, 9, 2, 4);
    ctx.fillRect(13, 10, 2, 3);
  } else {
    ctx.fillRect(1, 10, 2, 3);
    ctx.fillRect(14, 9, 2, 4);
  }
  ctx.fillStyle = C.dkSkin;
  if (dir === -1) {
    ctx.fillRect(0, 13, 2, 1);
  } else if (dir === 1) {
    ctx.fillRect(14, 13, 2, 1);
  } else {
    ctx.fillRect(1, 13, 2, 1);
    ctx.fillRect(13, 13, 2, 1);
  }
  ctx.fillStyle = C.blue;
  ctx.fillRect(4, 13, 3, 2);
  ctx.fillRect(9, 13, 3, 2);
  ctx.fillStyle = C.brown;
  ctx.fillRect(3, 15, 5, 1);
  ctx.fillRect(8, 15, 5, 1);
  return c;
}
function drawPlayerCatch() {
  const [c, ctx] = makeCanvas(16, 16);
  ctx.fillStyle = C.red;
  ctx.fillRect(3, 0, 10, 2);
  ctx.fillRect(2, 2, 12, 1);
  ctx.fillStyle = C.dkRed;
  ctx.fillRect(1, 3, 14, 1);
  ctx.fillStyle = C.skin;
  ctx.fillRect(3, 4, 10, 5);
  ctx.fillStyle = C.black;
  ctx.fillRect(4, 4, 2, 2);
  ctx.fillRect(10, 4, 2, 2);
  ctx.fillStyle = C.white;
  ctx.fillRect(5, 4, 1, 1);
  ctx.fillRect(11, 4, 1, 1);
  ctx.fillStyle = C.dkSkin;
  ctx.fillRect(6, 8, 4, 1);
  ctx.fillStyle = C.black;
  ctx.fillRect(7, 8, 2, 1);
  ctx.fillStyle = C.blue;
  ctx.fillRect(3, 9, 10, 4);
  ctx.fillStyle = C.brown;
  ctx.fillRect(3, 9, 10, 1);
  ctx.fillStyle = C.gold;
  ctx.fillRect(7, 9, 2, 1);
  ctx.fillStyle = C.skin;
  ctx.fillRect(0, 7, 2, 3);
  ctx.fillRect(14, 7, 2, 3);
  ctx.fillStyle = C.dkSkin;
  ctx.fillRect(0, 6, 2, 1);
  ctx.fillRect(14, 6, 2, 1);
  ctx.fillStyle = C.blue;
  ctx.fillRect(4, 13, 3, 2);
  ctx.fillRect(9, 13, 3, 2);
  ctx.fillStyle = C.brown;
  ctx.fillRect(3, 15, 5, 1);
  ctx.fillRect(8, 15, 5, 1);
  return c;
}
function drawBill(bg, text, w, h) {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = C.dkGreen;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = C.dkGreen + "40";
  for (let y = 2;y < h - 2; y += 2) {
    ctx.fillRect(2, y, w - 4, 1);
  }
  ctx.fillStyle = C.dkGreen;
  ctx.font = `bold ${h - 3}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 1);
  if (text === "100") {
    ctx.fillStyle = C.billGold;
    ctx.fillRect(w - 3, 1, 2, h - 2);
    ctx.fillRect(1, h - 3, w - 2, 2);
  }
  return c;
}
function drawInkSplat() {
  const [c, ctx] = makeCanvas(10, 10);
  ctx.fillStyle = C.black;
  ctx.fillRect(3, 3, 4, 4);
  ctx.fillRect(1, 2, 2, 3);
  ctx.fillRect(7, 2, 2, 3);
  ctx.fillRect(2, 0, 2, 2);
  ctx.fillRect(6, 0, 2, 2);
  ctx.fillRect(2, 7, 2, 2);
  ctx.fillRect(6, 7, 2, 2);
  ctx.fillRect(4, 8, 2, 2);
  ctx.fillRect(5, 7, 1, 3);
  ctx.fillStyle = C.dkGray;
  ctx.fillRect(3, 3, 1, 1);
  return c;
}
function drawPaperJam() {
  const [c, ctx] = makeCanvas(12, 10);
  ctx.fillStyle = C.ltGray;
  ctx.fillRect(2, 1, 8, 8);
  ctx.fillStyle = C.white;
  ctx.fillRect(3, 2, 6, 6);
  ctx.fillStyle = C.gray;
  ctx.fillRect(4, 3, 4, 1);
  ctx.fillRect(3, 5, 5, 1);
  ctx.fillRect(5, 7, 3, 1);
  ctx.fillStyle = C.ltGray;
  ctx.fillRect(8, 1, 2, 2);
  ctx.fillStyle = C.gray;
  ctx.fillRect(9, 1, 1, 1);
  ctx.fillStyle = C.red;
  ctx.fillRect(5, 4, 2, 2);
  return c;
}
function drawShredded() {
  const [c, ctx] = makeCanvas(12, 10);
  for (let i = 0;i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? C.bill20 : C.dkGreen;
    ctx.fillRect(i * 2 + 1, 1 + i % 3, 1, 8 - i % 2);
  }
  ctx.fillStyle = C.red;
  ctx.fillRect(3, 2, 1, 1);
  ctx.fillRect(8, 5, 1, 1);
  ctx.fillStyle = C.gold;
  ctx.fillRect(6, 7, 1, 1);
  return c;
}
function drawMagnet() {
  const [c, ctx] = makeCanvas(10, 12);
  ctx.fillStyle = C.red;
  ctx.fillRect(1, 0, 3, 8);
  ctx.fillRect(6, 0, 3, 8);
  ctx.fillStyle = C.blue;
  ctx.fillRect(1, 0, 3, 3);
  ctx.fillRect(6, 0, 3, 3);
  ctx.fillStyle = C.gray;
  ctx.fillRect(3, 6, 4, 2);
  ctx.fillStyle = C.red;
  ctx.fillRect(1, 7, 3, 2);
  ctx.fillStyle = C.blue;
  ctx.fillRect(6, 7, 3, 2);
  ctx.fillStyle = C.gold;
  ctx.fillRect(4, 9, 1, 1);
  ctx.fillRect(5, 10, 1, 1);
  ctx.fillRect(3, 11, 1, 1);
  return c;
}
function drawShield() {
  const [c, ctx] = makeCanvas(12, 12);
  ctx.fillStyle = C.cyan;
  ctx.fillRect(3, 0, 6, 1);
  ctx.fillRect(2, 1, 8, 1);
  ctx.fillRect(1, 2, 10, 2);
  ctx.fillRect(2, 4, 8, 2);
  ctx.fillRect(3, 6, 6, 2);
  ctx.fillRect(4, 8, 4, 2);
  ctx.fillRect(5, 10, 2, 1);
  ctx.fillStyle = C.white;
  ctx.fillRect(4, 2, 4, 2);
  ctx.fillStyle = C.cyan;
  ctx.fillRect(5, 3, 2, 1);
  return c;
}
function drawDouble() {
  const [c, ctx] = makeCanvas(12, 10);
  ctx.fillStyle = C.gold;
  ctx.fillRect(1, 0, 10, 1);
  ctx.fillRect(0, 1, 12, 8);
  ctx.fillRect(1, 9, 10, 1);
  ctx.fillStyle = C.orange;
  ctx.fillRect(1, 1, 10, 1);
  ctx.fillRect(1, 8, 10, 1);
  ctx.fillStyle = C.white;
  ctx.font = "bold 6px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("2x", 6, 5);
  return c;
}
function drawFed(dir) {
  const [c, ctx] = makeCanvas(16, 16);
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(3, 7, 10, 6);
  ctx.fillStyle = C.skin;
  ctx.fillRect(4, 2, 8, 5);
  ctx.fillStyle = C.black;
  ctx.fillRect(4, 3, 3, 2);
  ctx.fillRect(9, 3, 3, 2);
  ctx.fillRect(7, 4, 2, 1);
  ctx.fillStyle = C.gray;
  if (dir === -1) {
    ctx.fillRect(1, 3, 3, 1);
    ctx.fillRect(1, 3, 1, 4);
  } else {
    ctx.fillRect(12, 3, 3, 1);
    ctx.fillRect(14, 3, 1, 4);
  }
  ctx.fillStyle = C.dkSkin;
  ctx.fillRect(6, 6, 4, 1);
  ctx.fillStyle = C.red;
  ctx.fillRect(7, 7, 2, 5);
  ctx.fillRect(6, 7, 4, 1);
  ctx.fillStyle = C.brown;
  if (dir === -1) {
    ctx.fillRect(0, 9, 3, 5);
    ctx.fillStyle = C.gold;
    ctx.fillRect(1, 11, 1, 1);
  } else {
    ctx.fillRect(13, 9, 3, 5);
    ctx.fillStyle = C.gold;
    ctx.fillRect(14, 11, 1, 1);
  }
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(4, 13, 3, 3);
  ctx.fillRect(9, 13, 3, 3);
  ctx.fillStyle = C.black;
  ctx.fillRect(3, 15, 5, 1);
  ctx.fillRect(8, 15, 5, 1);
  ctx.fillStyle = C.gold;
  ctx.fillRect(5, 7, 1, 1);
  return c;
}
function drawStar() {
  const [c, ctx] = makeCanvas(5, 5);
  ctx.fillStyle = C.gold;
  ctx.fillRect(2, 0, 1, 1);
  ctx.fillRect(1, 1, 3, 1);
  ctx.fillRect(0, 2, 5, 1);
  ctx.fillRect(1, 3, 3, 1);
  ctx.fillRect(2, 4, 1, 1);
  return c;
}
function drawSparkle() {
  const [c, ctx] = makeCanvas(3, 3);
  ctx.fillStyle = C.white;
  ctx.fillRect(1, 0, 1, 3);
  ctx.fillRect(0, 1, 3, 1);
  return c;
}
var audioCtx = null;
function ensureAudio() {
  if (!audioCtx)
    audioCtx = new AudioContext;
  if (audioCtx.state === "suspended")
    audioCtx.resume();
  return audioCtx;
}
function playNote(freq, dur, type = "square", vol = 0.15, delay = 0) {
  try {
    const ctx = ensureAudio();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch {}
}
function sfx(name) {
  switch (name) {
    case "collect":
      playNote(523, 0.08, "square", 0.12);
      playNote(659, 0.08, "square", 0.12, 0.05);
      playNote(784, 0.12, "square", 0.1, 0.1);
      break;
    case "collect big":
      playNote(523, 0.08, "square", 0.15);
      playNote(659, 0.08, "square", 0.15, 0.06);
      playNote(784, 0.08, "square", 0.15, 0.12);
      playNote(1047, 0.15, "square", 0.12, 0.18);
      break;
    case "hit":
      playNote(200, 0.15, "sawtooth", 0.2);
      playNote(100, 0.3, "sawtooth", 0.15, 0.1);
      break;
    case "powerup":
      playNote(440, 0.1, "square", 0.1);
      playNote(554, 0.1, "square", 0.1, 0.08);
      playNote(659, 0.1, "square", 0.1, 0.16);
      playNote(880, 0.2, "square", 0.12, 0.24);
      break;
    case "level up":
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => playNote(f, 0.15, "square", 0.1, i * 0.12));
      break;
    case "game over":
      [392, 349, 330, 262].forEach((f, i) => playNote(f, 0.3, "square", 0.12, i * 0.25));
      break;
    case "fed":
      playNote(150, 0.4, "sawtooth", 0.15);
      playNote(120, 0.5, "sawtooth", 0.12, 0.2);
      break;
    case "start":
      playNote(262, 0.1, "square", 0.1);
      playNote(330, 0.1, "square", 0.1, 0.1);
      playNote(392, 0.1, "square", 0.1, 0.2);
      playNote(523, 0.2, "square", 0.12, 0.3);
      break;
    case "combo":
      playNote(784, 0.06, "square", 0.08);
      playNote(988, 0.06, "square", 0.08, 0.04);
      playNote(1175, 0.1, "square", 0.1, 0.08);
      break;
  }
}
var bgmInterval = null;
var BGM_NOTES = [
  262,
  330,
  392,
  523,
  0,
  392,
  330,
  262,
  294,
  349,
  440,
  587,
  0,
  440,
  349,
  294,
  330,
  392,
  494,
  659,
  0,
  494,
  392,
  330,
  262,
  392,
  523,
  659,
  523,
  392,
  262,
  0
];
var bgmIdx = 0;
function startBGM() {
  stopBGM();
  bgmIdx = 0;
  bgmInterval = setInterval(() => {
    const freq = BGM_NOTES[bgmIdx % BGM_NOTES.length];
    if (freq > 0)
      playNote(freq, 0.14, "triangle", 0.04);
    bgmIdx++;
  }, 180);
}
function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}
var keys = new Set;
var touchDir = 0;
document.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key))
    e.preventDefault();
});
document.addEventListener("keyup", (e) => keys.delete(e.key));
function setupTouch(canvas) {
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      touchDir = x < rect.width / 2 ? -1 : 1;
    }
  }, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (e.touches.length === 0)
      touchDir = 0;
  }, { passive: false });
}
function isLeft() {
  return keys.has("ArrowLeft") || keys.has("a") || keys.has("A") || touchDir === -1;
}
function isRight() {
  return keys.has("ArrowRight") || keys.has("d") || keys.has("D") || touchDir === 1;
}
function isAction() {
  return keys.has(" ") || keys.has("Enter");
}
function isPause() {
  return keys.has("p") || keys.has("P") || keys.has("Escape");
}
function consumeAction() {
  if (isAction()) {
    keys.delete(" ");
    keys.delete("Enter");
    return true;
  }
  return false;
}
var particles = [];
function spawnStarBurst(x, y, color, count = 6) {
  for (let i = 0;i < count; i++) {
    const angle = Math.PI * 2 * i / count + Math.random() * 0.5;
    const speed = 30 + Math.random() * 50;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.6,
      color,
      size: 2 + Math.random() * 2,
      type: Math.random() > 0.5 ? "star" : "sparkle"
    });
  }
}
function spawnTextParticle(x, y, text, color) {
  particles.push({
    x,
    y,
    vx: 0,
    vy: -40,
    life: 1,
    maxLife: 1,
    color,
    size: 0,
    type: "text",
    text
  });
}
function updateParticles(dt) {
  for (let i = particles.length - 1;i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
    p.life -= dt;
    if (p.life <= 0)
      particles.splice(i, 1);
  }
}
function drawParticles(ctx) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    if (p.type === "text") {
      ctx.fillStyle = p.color;
      ctx.font = "bold 7px monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.type === "star") {
      ctx.drawImage(getSprite("star"), p.x - 2, p.y - 2);
    } else {
      ctx.drawImage(getSprite("sparkle"), p.x - 1, p.y - 1);
    }
  }
  ctx.globalAlpha = 1;
}
function newGame() {
  return {
    state: "title",
    score: 0,
    highScore: parseInt(localStorage.getItem("inkjob99_hi") || "0"),
    lives: MAX_LIVES,
    level: 1,
    combo: 0,
    maxCombo: 0,
    billsCollected: 0,
    billsMissed: 0,
    playerX: W / 2 - 8,
    playerY: H - 24,
    playerDir: 0,
    catching: false,
    catchTimer: 0,
    invincible: 0,
    shieldActive: false,
    magnetActive: 0,
    doubleActive: 0,
    spawnTimer: 0.5,
    powerUpTimer: 8 + Math.random() * 5,
    entities: [],
    fedActive: false,
    fedWarning: 0,
    feds: [],
    shake: 0,
    flash: 0,
    flashColor: C.white,
    levelTimer: 0,
    levelDuration: 30,
    stateTimer: 0,
    titleBlink: 0,
    pressOffset: 0,
    beltOffset: 0,
    levelScore: 0,
    levelCombo: 0,
    levelBills: 0
  };
}
function startLevel(g) {
  g.state = "playing";
  g.entities = [];
  g.feds = [];
  g.fedActive = false;
  g.fedWarning = 0;
  g.spawnTimer = 0.5;
  g.powerUpTimer = 8 + Math.random() * 8;
  g.levelTimer = 0;
  g.levelDuration = 25 + g.level * 3;
  g.levelScore = 0;
  g.levelCombo = 0;
  g.levelBills = 0;
  g.playerX = W / 2 - 8;
  g.shieldActive = false;
  g.magnetActive = 0;
  g.doubleActive = 0;
  startBGM();
}
function spawnBill(g) {
  const lvl = g.level;
  const r = Math.random();
  let denom;
  let points, speed, w, h;
  if (lvl >= 8 && r < 0.08) {
    denom = 100;
    points = 1000;
    speed = BASE_BILL_SPEED + lvl * 8;
    w = 16;
    h = 9;
  } else if (lvl >= 3 && r < 0.2) {
    denom = 20;
    points = 200;
    speed = BASE_BILL_SPEED + lvl * 6;
    w = 14;
    h = 8;
  } else if (r < 0.45) {
    denom = 5;
    points = 50;
    speed = BASE_BILL_SPEED + lvl * 4;
    w = 12;
    h = 7;
  } else {
    denom = 1;
    points = 10;
    speed = BASE_BILL_SPEED + lvl * 3;
    w = 12;
    h = 7;
  }
  const x = 8 + Math.random() * (W - w - 16);
  g.entities.push({
    type: "bill",
    denom,
    x,
    y: -h - Math.random() * 20,
    speed,
    w,
    h,
    points,
    rotation: Math.random() * 0.3 - 0.15
  });
}
function spawnObstacle(g) {
  const lvl = g.level;
  if (lvl < 2)
    return;
  const r = Math.random();
  let kind;
  let w, h, speed;
  if (r < 0.4) {
    kind = "ink";
    w = 10;
    h = 10;
    speed = BASE_BILL_SPEED + lvl * 5;
  } else if (r < 0.7) {
    kind = "jam";
    w = 12;
    h = 10;
    speed = BASE_BILL_SPEED + lvl * 3;
  } else {
    kind = "shred";
    w = 12;
    h = 10;
    speed = BASE_BILL_SPEED + lvl * 6;
  }
  g.entities.push({
    type: "obstacle",
    kind,
    x: 8 + Math.random() * (W - w - 16),
    y: -h - Math.random() * 30,
    speed,
    w,
    h
  });
}
function spawnPowerUp(g) {
  const kinds = ["magnet", "shield", "double"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  g.entities.push({
    type: "powerup",
    kind,
    x: 8 + Math.random() * (W - 20),
    y: -12,
    speed: BASE_BILL_SPEED + g.level * 2,
    w: 12,
    h: 12
  });
}
function triggerFedRaid(g) {
  g.fedWarning = 2;
  sfx("fed");
}
function updateGame(g, dt) {
  g.titleBlink += dt;
  g.pressOffset += dt * 60;
  g.beltOffset += dt * 30;
  if (g.shake > 0)
    g.shake = Math.max(0, g.shake - dt * 8);
  if (g.flash > 0)
    g.flash = Math.max(0, g.flash - dt * 4);
  if (g.state === "title") {
    if (consumeAction()) {
      sfx("start");
      Object.assign(g, newGame());
      g.state = "playing";
      g.level = 1;
      startLevel(g);
    }
    return;
  }
  if (g.state === "gameOver") {
    if (consumeAction()) {
      Object.assign(g, newGame());
      g.state = "title";
    }
    return;
  }
  if (g.state === "levelClear") {
    g.stateTimer += dt;
    if (g.stateTimer > 3 || consumeAction()) {
      g.level++;
      startLevel(g);
    }
    return;
  }
  if (g.state === "paused") {
    if (consumeAction() || isPause()) {
      g.state = "playing";
      startBGM();
    }
    return;
  }
  if (isPause()) {
    g.state = "paused";
    stopBGM();
    return;
  }
  g.playerDir = 0;
  if (isLeft()) {
    g.playerX -= PLAYER_SPEED * dt;
    g.playerDir = -1;
  }
  if (isRight()) {
    g.playerX += PLAYER_SPEED * dt;
    g.playerDir = 1;
  }
  g.playerX = Math.max(0, Math.min(W - 16, g.playerX));
  if (g.catching) {
    g.catchTimer -= dt;
    if (g.catchTimer <= 0)
      g.catching = false;
  }
  if (g.invincible > 0)
    g.invincible -= dt;
  if (g.magnetActive > 0)
    g.magnetActive -= dt;
  if (g.doubleActive > 0)
    g.doubleActive -= dt;
  g.levelTimer += dt;
  const spawnRate = Math.max(0.4, BASE_SPAWN_RATE - g.level * 0.12);
  g.spawnTimer -= dt;
  if (g.spawnTimer <= 0) {
    spawnBill(g);
    if (g.level >= 2 && Math.random() < 0.15 + g.level * 0.03)
      spawnObstacle(g);
    g.spawnTimer = spawnRate + (Math.random() - 0.5) * 0.3;
  }
  g.powerUpTimer -= dt;
  if (g.powerUpTimer <= 0) {
    spawnPowerUp(g);
    g.powerUpTimer = 10 + Math.random() * 10;
  }
  if (g.level >= 5 && !g.fedActive && g.levelTimer > g.levelDuration * 0.6 && g.fedWarning <= 0) {
    triggerFedRaid(g);
  }
  if (g.fedWarning > 0) {
    g.fedWarning -= dt;
    if (g.fedWarning <= 0 && !g.fedActive) {
      g.fedActive = true;
      const fedSpeed = 60 + g.level * 5;
      g.feds.push({ type: "fed", x: -20, y: H - 40, speed: fedSpeed, dir: 1, w: 16, h: 16, active: true }, { type: "fed", x: W + 20, y: H - 50, speed: fedSpeed * 0.8, dir: -1, w: 16, h: 16, active: true });
    }
  }
  for (let i = g.entities.length - 1;i >= 0; i--) {
    const e = g.entities[i];
    e.y += e.speed * dt;
    if (e.type === "bill" && g.magnetActive > 0) {
      const dx = g.playerX + 8 - (e.x + e.w / 2);
      const dy = g.playerY + 8 - (e.y + e.h / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60 && dist > 1) {
        e.x += dx / dist * 80 * dt;
        e.y += dy / dist * 80 * dt;
      }
    }
    if (rectsOverlap(g.playerX + 2, g.playerY + 2, 12, 12, e.x, e.y, e.w, e.h)) {
      if (e.type === "bill") {
        g.catching = true;
        g.catchTimer = 0.15;
        const mult = g.doubleActive > 0 ? 2 : 1;
        const comboMult = 1 + Math.floor(g.combo / 5) * 0.5;
        const pts = Math.floor(e.points * mult * comboMult);
        g.score += pts;
        g.levelScore += pts;
        g.combo++;
        g.billsCollected++;
        g.levelBills++;
        if (g.combo > g.maxCombo)
          g.maxCombo = g.combo;
        if (g.combo >= 5 && g.combo % 5 === 0)
          sfx("combo");
        else if (e.denom >= 20)
          sfx("collect big");
        else
          sfx("collect");
        spawnStarBurst(e.x + e.w / 2, e.y + e.h / 2, e.denom >= 20 ? C.gold : C.green, e.denom >= 20 ? 10 : 5);
        spawnTextParticle(e.x + e.w / 2, e.y, `+${pts}`, g.combo >= 5 ? C.gold : C.white);
        g.entities.splice(i, 1);
        continue;
      } else if (e.type === "obstacle") {
        if (g.invincible <= 0) {
          if (g.shieldActive) {
            g.shieldActive = false;
            sfx("hit");
            g.shake = 3;
            spawnStarBurst(e.x + e.w / 2, e.y + e.h / 2, C.cyan, 8);
          } else {
            g.lives--;
            g.combo = 0;
            g.invincible = INVINCIBLE_TIME;
            sfx("hit");
            g.shake = 5;
            g.flash = 1;
            g.flashColor = C.red;
            spawnStarBurst(g.playerX + 8, g.playerY + 8, C.red, 12);
            if (g.lives <= 0) {
              g.state = "gameOver";
              stopBGM();
              sfx("game over");
              if (g.score > g.highScore) {
                g.highScore = g.score;
                localStorage.setItem("inkjob99_hi", String(g.score));
              }
            }
          }
          g.entities.splice(i, 1);
          continue;
        }
      } else if (e.type === "powerup") {
        sfx("powerup");
        if (e.kind === "magnet")
          g.magnetActive = 8;
        else if (e.kind === "shield")
          g.shieldActive = true;
        else if (e.kind === "double")
          g.doubleActive = 10;
        spawnStarBurst(e.x + e.w / 2, e.y + e.h / 2, C.cyan, 10);
        spawnTextParticle(e.x + e.w / 2, e.y, e.kind.toUpperCase() + "!", C.cyan);
        g.entities.splice(i, 1);
        continue;
      }
    }
    if (e.y > H + 10) {
      if (e.type === "bill") {
        g.combo = 0;
        g.billsMissed++;
      }
      g.entities.splice(i, 1);
    }
  }
  for (const fed of g.feds) {
    fed.x += fed.speed * fed.dir * dt;
    if (fed.dir === 1 && fed.x > W + 30)
      fed.x = -30;
    if (fed.dir === -1 && fed.x < -30)
      fed.x = W + 30;
    if (g.invincible <= 0 && rectsOverlap(g.playerX, g.playerY, 16, 16, fed.x, fed.y, 16, 16)) {
      g.lives = 0;
      g.state = "gameOver";
      stopBGM();
      sfx("game over");
      g.shake = 8;
      g.flash = 1;
      g.flashColor = C.red;
      if (g.score > g.highScore) {
        g.highScore = g.score;
        localStorage.setItem("inkjob99_hi", String(g.score));
      }
    }
  }
  if (g.levelTimer >= g.levelDuration && !g.fedActive) {
    g.state = "levelClear";
    g.stateTimer = 0;
    stopBGM();
    sfx("level up");
  }
  if (g.fedActive && g.feds.length > 0 && g.levelTimer >= g.levelDuration) {
    g.feds = [];
    g.fedActive = false;
  }
  updateParticles(dt);
}
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function renderGame(ctx, g) {
  ctx.save();
  if (g.shake > 0) {
    ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
  }
  drawBackground(ctx, g);
  if (g.flash > 0) {
    ctx.globalAlpha = g.flash * 0.3;
    ctx.fillStyle = g.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  if (g.state === "title") {
    drawTitleScreen(ctx, g);
    ctx.restore();
    return;
  }
  for (const e of g.entities) {
    if (e.type === "bill") {
      const sprite = getSprite(`bill ${e.denom}`);
      ctx.drawImage(sprite, Math.floor(e.x), Math.floor(e.y));
    } else if (e.type === "obstacle") {
      let sprite;
      if (e.kind === "ink")
        sprite = getSprite("ink splat");
      else if (e.kind === "jam")
        sprite = getSprite("paper jam");
      else
        sprite = getSprite("shredded");
      const wobble = Math.sin(Date.now() / 100 + e.x) * 2;
      ctx.drawImage(sprite, Math.floor(e.x) + wobble, Math.floor(e.y));
    } else if (e.type === "powerup") {
      let sprite;
      if (e.kind === "magnet")
        sprite = getSprite("magnet");
      else if (e.kind === "shield")
        sprite = getSprite("shield");
      else
        sprite = getSprite("double");
      const float = Math.sin(Date.now() / 200) * 2;
      ctx.drawImage(sprite, Math.floor(e.x), Math.floor(e.y) + float);
      ctx.globalAlpha = 0.2 + Math.sin(Date.now() / 150) * 0.15;
      ctx.fillStyle = C.cyan;
      ctx.fillRect(Math.floor(e.x) - 1, Math.floor(e.y) + float - 1, e.w + 2, e.h + 2);
      ctx.globalAlpha = 1;
    }
  }
  for (const fed of g.feds) {
    const sprite = getSprite(fed.dir === 1 ? "fed right" : "fed left");
    ctx.drawImage(sprite, Math.floor(fed.x), Math.floor(fed.y));
  }
  if (g.fedWarning > 0 && Math.floor(g.fedWarning * 6) % 2 === 0) {
    ctx.fillStyle = C.red;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("!! FED RAID !!", W / 2, 50);
    ctx.font = "7px monospace";
    ctx.fillText("HIDE! HIDE!", W / 2, 62);
  }
  if (g.invincible <= 0 || Math.floor(g.invincible * 10) % 2 === 0) {
    let sprite;
    if (g.catching)
      sprite = getSprite("player catch");
    else if (g.playerDir === -1)
      sprite = getSprite("player left");
    else if (g.playerDir === 1)
      sprite = getSprite("player right");
    else
      sprite = getSprite("player idle");
    ctx.drawImage(sprite, Math.floor(g.playerX), Math.floor(g.playerY));
    if (g.shieldActive) {
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.15;
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(g.playerX + 8, g.playerY + 8, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  drawParticles(ctx);
  drawHUD(ctx, g);
  if (g.state === "levelClear")
    drawLevelClear(ctx, g);
  if (g.state === "gameOver")
    drawGameOver(ctx, g);
  if (g.state === "paused")
    drawPaused(ctx, g);
  ctx.restore();
}
function drawBackground(ctx, g) {
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.slate;
  for (let y = 0;y < H; y += 16) {
    for (let x = 0;x < W; x += 16) {
      if ((x / 16 + y / 16) % 2 === 0) {
        ctx.fillRect(x, y, 16, 16);
      }
    }
  }
  ctx.fillStyle = C.dkGray;
  ctx.fillRect(0, 0, W, 28);
  ctx.fillStyle = C.gray;
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, 26, W, 2);
  ctx.fillStyle = C.ltGray;
  ctx.fillRect(10, 6, 40, 18);
  ctx.fillRect(60, 6, 40, 18);
  ctx.fillRect(110, 6, 40, 18);
  ctx.fillRect(160, 6, 40, 18);
  ctx.fillRect(210, 6, 40, 18);
  ctx.fillRect(260, 6, 40, 18);
  ctx.fillStyle = "#0a0a0a";
  for (let i = 0;i < 6; i++) {
    const px = 20 + i * 50;
    ctx.fillRect(px, 18, 20, 8);
    ctx.fillStyle = C.dkGray;
    for (let b = 0;b < 3; b++) {
      const bx = px + (g.beltOffset + b * 8) % 24;
      if (bx >= px && bx < px + 20) {
        ctx.fillRect(bx, 22, 4, 2);
      }
    }
    ctx.fillStyle = "#0a0a0a";
  }
  const rollerOff = g.pressOffset % 8;
  ctx.fillStyle = C.ltGray;
  for (let i = 0;i < 6; i++) {
    const px = 25 + i * 50;
    ctx.fillRect(px + (rollerOff > 4 ? 2 : 0), 6, 6, 4);
  }
  ctx.fillStyle = C.dkGray;
  ctx.fillRect(0, 28, 2, H - 28);
  ctx.fillRect(W - 2, 28, 2, H - 28);
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = C.green;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}
function drawTitleScreen(ctx, g) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, W, H);
  const yOff = Math.sin(g.titleBlink * 2) * 3;
  ctx.fillStyle = C.dkGreen;
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText("INK JOB", W / 2 + 2, 62 + yOff + 2);
  ctx.font = "bold 28px monospace";
  ctx.fillText("'99", W / 2 + 2, 92 + yOff + 2);
  ctx.fillStyle = C.green;
  ctx.font = "bold 22px monospace";
  ctx.fillText("INK JOB", W / 2, 62 + yOff);
  ctx.fillStyle = C.gold;
  ctx.font = "bold 28px monospace";
  ctx.fillText("'99", W / 2, 92 + yOff);
  ctx.fillStyle = C.ltGray;
  ctx.font = "7px monospace";
  ctx.fillText("THE MONEY PRINTING ARCADE GAME", W / 2, 108);
  for (let i = 0;i < 5; i++) {
    const bx = 40 + i * 60;
    const by = 120 + Math.sin(g.titleBlink * 3 + i) * 5;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(getSprite(`bill ${[1, 5, 20, 100, 5][i]}`), bx, by);
    ctx.globalAlpha = 1;
  }
  if (Math.floor(g.titleBlink * 2.5) % 2 === 0) {
    ctx.fillStyle = C.white;
    ctx.font = "bold 8px monospace";
    ctx.fillText("PRESS ENTER OR TAP TO START", W / 2, 165);
  }
  ctx.fillStyle = C.gold;
  ctx.font = "7px monospace";
  ctx.fillText(`HIGH SCORE: ${String(g.highScore).padStart(8, "0")}`, W / 2, 185);
  ctx.fillStyle = C.gray;
  ctx.font = "6px monospace";
  ctx.fillText("MADE BY SUPERDUPERZED", W / 2, 205);
  ctx.fillText("BEST PLAYED WITH SOUND ON", W / 2, 215);
  ctx.fillStyle = C.ltGray;
  ctx.font = "6px monospace";
  ctx.fillText("ARROWS/WASD: MOVE  |  P: PAUSE", W / 2, 228);
}
function drawHUD(ctx, g) {
  ctx.fillStyle = C.white;
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE`, 8, 42);
  ctx.fillStyle = C.gold;
  ctx.fillText(`${String(g.score).padStart(8, "0")}`, 8, 52);
  ctx.fillStyle = C.white;
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL ${g.level}`, W / 2, 42);
  const prog = Math.min(1, g.levelTimer / g.levelDuration);
  ctx.fillStyle = C.dkGray;
  ctx.fillRect(W / 2 - 40, 45, 80, 4);
  ctx.fillStyle = prog >= 0.8 ? C.gold : C.green;
  ctx.fillRect(W / 2 - 40, 45, Math.floor(80 * prog), 4);
  ctx.textAlign = "right";
  for (let i = 0;i < MAX_LIVES; i++) {
    ctx.fillStyle = i < g.lives ? C.red : C.dkGray;
    ctx.fillRect(W - 10 - i * 12, 36, 8, 8);
    if (i < g.lives) {
      ctx.fillStyle = C.dkRed;
      ctx.fillRect(W - 8 - i * 12, 38, 4, 4);
    }
  }
  if (g.combo >= 3) {
    ctx.fillStyle = g.combo >= 10 ? C.gold : C.orange;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`x${g.combo}`, 8, 66);
  }
  let puY = g.combo >= 3 ? 76 : 66;
  if (g.magnetActive > 0) {
    ctx.drawImage(getSprite("magnet"), 8, puY);
    ctx.fillStyle = C.gold;
    ctx.font = "6px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.ceil(g.magnetActive)}s`, 22, puY + 7);
    puY += 14;
  }
  if (g.shieldActive) {
    ctx.drawImage(getSprite("shield"), 8, puY);
    ctx.fillStyle = C.cyan;
    ctx.font = "6px monospace";
    ctx.fillText("ON", 22, puY + 7);
    puY += 14;
  }
  if (g.doubleActive > 0) {
    ctx.drawImage(getSprite("double"), 8, puY);
    ctx.fillStyle = C.gold;
    ctx.font = "6px monospace";
    ctx.fillText(`${Math.ceil(g.doubleActive)}s`, 22, puY + 7);
  }
}
function drawLevelClear(ctx, g) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.gold;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL ${g.level} CLEAR!`, W / 2, 80);
  ctx.fillStyle = C.white;
  ctx.font = "8px monospace";
  ctx.fillText(`SCORE: +${g.levelScore}`, W / 2, 105);
  ctx.fillText(`BILLS CAUGHT: ${g.levelBills}`, W / 2, 120);
  ctx.fillText(`MAX COMBO: x${g.maxCombo}`, W / 2, 135);
  ctx.fillStyle = C.green;
  ctx.font = "7px monospace";
  ctx.fillText(`TOTAL: ${String(g.score).padStart(8, "0")}`, W / 2, 155);
  if (Math.floor(g.stateTimer * 3) % 2 === 0) {
    ctx.fillStyle = C.white;
    ctx.font = "bold 7px monospace";
    ctx.fillText("PRESS ENTER FOR NEXT LEVEL", W / 2, 180);
  }
}
function drawGameOver(ctx, g) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.red;
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", W / 2, 70);
  ctx.fillStyle = C.white;
  ctx.font = "8px monospace";
  ctx.fillText(`FINAL SCORE: ${String(g.score).padStart(8, "0")}`, W / 2, 100);
  ctx.fillText(`LEVEL REACHED: ${g.level}`, W / 2, 115);
  ctx.fillText(`BILLS COLLECTED: ${g.billsCollected}`, W / 2, 130);
  ctx.fillText(`BEST COMBO: x${g.maxCombo}`, W / 2, 145);
  if (g.score >= g.highScore && g.score > 0) {
    ctx.fillStyle = C.gold;
    ctx.font = "bold 8px monospace";
    ctx.fillText("NEW HIGH SCORE!", W / 2, 165);
  } else {
    ctx.fillStyle = C.gray;
    ctx.font = "7px monospace";
    ctx.fillText(`HIGH SCORE: ${String(g.highScore).padStart(8, "0")}`, W / 2, 165);
  }
  if (Math.floor(g.titleBlink * 2.5) % 2 === 0) {
    ctx.fillStyle = C.white;
    ctx.font = "bold 7px monospace";
    ctx.fillText("PRESS ENTER TO CONTINUE", W / 2, 190);
  }
}
function drawPaused(ctx, g) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.white;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", W / 2, H / 2);
  ctx.font = "7px monospace";
  ctx.fillStyle = C.ltGray;
  ctx.fillText("PRESS P OR ENTER TO RESUME", W / 2, H / 2 + 16);
}
var canvas;
var ctx;
var game;
var lastTime = 0;
function init() {
  canvas = document.getElementById("game");
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const names = [
    "player idle",
    "player left",
    "player right",
    "player catch",
    "bill 1",
    "bill 5",
    "bill 20",
    "bill 100",
    "ink splat",
    "paper jam",
    "shredded",
    "magnet",
    "shield",
    "double",
    "fed left",
    "fed right",
    "star",
    "sparkle"
  ];
  for (const n of names)
    getSprite(n);
  game = newGame();
  setupTouch(canvas);
  lastTime = performance.now();
  requestAnimationFrame(loop);
}
function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 1 / 20);
  lastTime = time;
  updateGame(game, dt);
  renderGame(ctx, game);
  requestAnimationFrame(loop);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
