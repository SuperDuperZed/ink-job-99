// ============================================================
//  INK JOB '99 RPG — Pokemon-style Money Printing Adventure
//  Pure TypeScript + HTML5 Canvas. Zero dependencies.
// ============================================================

// ─── Constants ──────────────────────────────────────────────

const W = 320, H = 240, TILE = 16, FPS = 60
const PLAYER_SPEED = 60

// ─── Color Palette ──────────────────────────────────────────

const C = {
  black:'#000',white:'#FFF',red:'#E42217',dkRed:'#8B0000',skin:'#FFCC99',
  dkSkin:'#CC9966',blue:'#1E3A8A',ltBlue:'#3B82F6',green:'#00B341',
  dkGreen:'#004D00',ltGreen:'#7CFC00',gold:'#FFD700',orange:'#FF8C00',
  brown:'#8B4513',ltBrown:'#D2691E',gray:'#808080',ltGray:'#C0C0C0',
  dkGray:'#404040',cyan:'#00CED1',purple:'#6B21A8',pink:'#FF69B4',
  mint:'#98FF98',teal:'#0D9488',navy:'#0F172A',slate:'#1E293B',
  cream:'#FFFDD0',wood:'#DEB887',dkBrown:'#5C3317',brick:'#CB4335',roof:'#654321',yellow:'#FFFF00',
  water:'#1A5276',grass1:'#228B22',grass2:'#2ECC71',path:'#C4A882',
  floor:'#F5DEB3',darkFloor:'#D2B48C',wallExt:'#696969',wallInt:'#A9A9A9',
  counter:'#8B7355',door:'#4A3728',fence:'#8B4513',
}

// ─── Types ───────────────────────────────────────────────────

type PrintType = 'offset'|'inkjet'|'laser'|'letterpress'|'thermo'|'screen'
type GameScreen = 'title'|'overworld'|'battle'|'dialog'|'menu'|'shop'|'party'|'gameOver'

interface MoveDef {
  name:string; type:PrintType; power:number; accuracy:number; pp:number;
  maxPp:number; effect?:string
}

interface PrinterDef {
  name:string; type:PrintType; baseHp:number; baseAtk:number;
  baseDef:number; baseSpd:number; moves:number[]; sprite:string;
}

interface Printer {
  defId:string; nickname:string; level:number; xp:number; xpNext:number;
  hp:number; maxHp:number; atk:number; def:number; spd:number;
  moves:{defId:number, pp:number}[]
}

interface Item {
  name:string; type:'heal'|'buff'|'capture'; power:number; price:number; desc:string
}

interface BattlePrinter {
  printer:Printer; side:'player'|'enemy';
  x:number; y:number; shakeX:number; flash:number
}

interface BattleState {
  player:BattlePrinter; enemy:BattlePrinter;
  phase:'intro'|'playerTurn'|'fightMenu'|'itemMenu'|'executePlayer'|
        'executeEnemy'|'hitPlayer'|'hitEnemy'|'fainted'|'won'|'ran'|'text'|'levelUp';
  textLines:string[]; textTimer:number; textCallback:()=>void;
  cursor:number; selectedMove:number;
  playerAction:null|{type:'move'|'item'|'run', id:number};
  turnCount:number;
}

interface Npc {
  id:string; x:number; y:number; dir:number;
  name:string; color:string; dialog:string[];
  isTrainer?:boolean; party?:Printer[]; defeated?:boolean;
  onInteract?:string; // 'heal'|'shop'|'give'|'battle'
  givePrinter?:string;
}

// ─── Type Chart ─────────────────────────────────────────────
// offset>laser>inkjet>letterpress>thermo>offset, screen neutral

const TYPE_CHART:Record<string,Record<string,number>> = {
  offset:     { laser:1.5, inkjet:0.7, thermo:0.7, letterpress:1, screen:1 },
  laser:      { inkjet:1.5, letterpress:0.7, offset:0.7, thermo:1, screen:1 },
  inkjet:     { letterpress:1.5, thermo:0.7, laser:0.7, offset:1, screen:1 },
  letterpress:{ thermo:1.5, offset:0.7, inkjet:0.7, laser:1, screen:1 },
  thermo:     { offset:1.5, laser:0.7, letterpress:0.7, inkjet:1, screen:1 },
  screen:     { inkjet:1.2, offset:1.2, laser:1.2, letterpress:1.2, thermo:1.2 },
}

// ─── Move Definitions ──────────────────────────────────────

const MOVES:Record<number,MoveDef> = {
  1:{name:'Ink Blast',   type:'inkjet',     power:40, accuracy:95, pp:25, maxPp:25},
  2:{name:'Nozzle Spray',type:'inkjet',     power:25, accuracy:100,pp:35, maxPp:35},
  3:{name:'Speed Print', type:'inkjet',     power:30, accuracy:100,pp:30, maxPp:30, effect:'speed'},
  4:{name:'Ink Flood',   type:'inkjet',     power:65, accuracy:80, pp:10, maxPp:10},
  5:{name:'Plate Slam',  type:'offset',     power:55, accuracy:85, pp:20, maxPp:20},
  6:{name:'Pressure Roll',type:'offset',     power:40, accuracy:95, pp:25, maxPp:25},
  7:{name:'Sheet Rip',   type:'offset',     power:70, accuracy:75, pp:10, maxPp:10},
  8:{name:'Perfect Reg', type:'offset',     power:50, accuracy:90, pp:15, maxPp:15},
  9:{name:'Laser Beam',  type:'laser',      power:50, accuracy:95, pp:20, maxPp:20},
  10:{name:'Precision Etch',type:'laser',   power:35, accuracy:100,pp:30, maxPp:30},
  11:{name:'Burn Through',type:'laser',     power:75, accuracy:70, pp:8,  maxPp:8},
  12:{name:'Focus Beam',  type:'laser',      power:45, accuracy:90, pp:15, maxPp:15},
  13:{name:'Letter Strike',type:'letterpress',power:45, accuracy:90,pp:20, maxPp:20},
  14:{name:'Heavy Press', type:'letterpress', power:60, accuracy:80, pp:15, maxPp:15},
  15:{name:'Impression',  type:'letterpress', power:35, accuracy:100,pp:30, maxPp:30},
  16:{name:'Emboss',      type:'letterpress', power:70, accuracy:75, pp:8,  maxPp:8},
  17:{name:'Heat Seal',   type:'thermo',     power:50, accuracy:90, pp:20, maxPp:20},
  18:{name:'Foil Stamp',  type:'thermo',     power:65, accuracy:80, pp:15, maxPp:15},
  19:{name:'Thermo Wave', type:'thermo',     power:80, accuracy:65, pp:5,  maxPp:5},
  20:{name:'Warm Up',     type:'thermo',     power:30, accuracy:100,pp:25, maxPp:25},
  21:{name:'Squeegee',    type:'screen',     power:40, accuracy:95, pp:25, maxPp:25},
  22:{name:'Mesh Push',   type:'screen',     power:35, accuracy:100,pp:30, maxPp:30},
  23:{name:'Color Layer', type:'screen',     power:55, accuracy:85, pp:15, maxPp:15},
  24:{name:'Screen Flood',type:'screen',     power:70, accuracy:70, pp:8,  maxPp:8},
}

// ─── Printer Definitions ────────────────────────────────────

const PRINTERS:Record<string,PrinterDef> = {
  dripdrop:  {name:'DripDrop',   type:'inkjet',     baseHp:45, baseAtk:12, baseDef:10, baseSpd:14, moves:[1,2,3], sprite:'inkjet'},
  boltpress: {name:'BoltPress',  type:'offset',     baseHp:55, baseAtk:15, baseDef:13, baseSpd:8,  moves:[5,6,8], sprite:'offset'},
  lasermike: {name:'LaserMike',  type:'laser',      baseHp:40, baseAtk:16, baseDef:8,  baseSpd:16, moves:[9,10,12],sprite:'laser'},
  oldtype:   {name:'OldType',    type:'letterpress', baseHp:60, baseAtk:14, baseDef:15, baseSpd:6,  moves:[13,14,15],sprite:'letterpress'},
  heatwave:  {name:'HeatWave',   type:'thermo',     baseHp:48, baseAtk:17, baseDef:9,  baseSpd:12, moves:[17,18,20],sprite:'thermo'},
  screendoor:{name:'ScreenDoor', type:'screen',     baseHp:42, baseAtk:13, baseDef:11, baseSpd:15, moves:[21,22,23],sprite:'screen'},
  diehard:   {name:'DieHard',    type:'laser',      baseHp:70, baseAtk:18, baseDef:16, baseSpd:10, moves:[9,11,12],sprite:'diehard'},
  goldpress: {name:'GoldPress',  type:'thermo',     baseHp:65, baseAtk:20, baseDef:14, baseSpd:13, moves:[18,19,17],sprite:'goldpress'},
}

// ─── Items ───────────────────────────────────────────────────

const ITEMS:Record<string,Item> = {
  inkRefill:  {name:'Ink Refill',    type:'heal', power:30,  price:50,  desc:'Restores 30 HP'},
  inkTank:    {name:'Ink Tank',      type:'heal', power:80,  price:150, desc:'Restores 80 HP'},
  freshPlate: {name:'Fresh Plate',    type:'heal', power:999, price:400, desc:'Fully restores HP'},
  speedOil:   {name:'Speed Oil',      type:'buff', power:2,   price:100, desc:'+2 SPD for battle'},
  atkInk:     {name:'Attack Ink',     type:'buff', power:2,   price:100, desc:'+2 ATK for battle'},
  defShield:  {name:'Defense Shield', type:'buff', power:2,   price:100, desc:'+2 DEF for battle'},
}

// ─── Map Data ────────────────────────────────────────────────
// Tile legend: .=grass R=road W=wall D=door T=tree ~=water
//   _=floor C=counter X=crate B=brick F=fence

const MAP_W = 40, MAP_H = 30
const MAP_DATA = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..........RRRRRRRR......WWWWWWWWWWWWWWTTTT',
  'T..........RR....RR......W............W.TTT',
  'T..WWWWWW...RR....RR......W..WWWWWW...W.W.TT',
  'T..W____W...RR....RR......W..W____W...D.W.TT',
  'T..W_CN_W...RR....RR......W..W_CN_W..._.W.TT',
  'T..W____W...RR....RR......W..W____W..._.W.TT',
  'T..WWWDWWWWWWWWWWWWW......WWWWWWWDWWWW.W.TT',
  'T..........RR...............T..........W.TT',
  'T....TT.....RR...............T..WWWWWWWWW.TT',
  'T....TT.....RR..TTTTTT.......TT.........TTTT',
  'T...........RR..T....T.......TT..WWWWWW...TT',
  'T...........RR..T....T.......TT..W__W.....TT',
  'TTTTT.......RR..TTTTTT.......TT..WCW.D....TT',
  'T...........RR..............TTTT..W__W.....TT',
  'T..WWWWWW...RR..............TT....WWWW.....TT',
  'T..W____W...RR....TTTTTT....TT...........TT',
  'T..W_CN_W...RR....T....T....TT..BBBBBBBBB.TT',
  'T..W____W...RR....T....T....TT..B_____B...TT',
  'T..WWWDWWWWWWWWWWWT....T....TT..B_____B...TT',
  'T...............TTTTT....T....TT..B_____B.DTT',
  'T...............T...............TT..WWWWWWW.TT',
  'T...TTTTTTTT...T...............TT..........TT',
  'T...T......T...TTTTTTTTTTTTTTTTTT..TTTTTT..TT',
  'T...T......T..........................T...TT',
  'T...TTTTTTTT........TTTTTTTT........TTTTTTTT',
  'T......................T....T.............TT',
  'T....~~WWWW~~..........T....T.............TT',
  'T....~~....~~..........TTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
]

// Encounter zones (x1,y1,x2,y2) → table of printer defs + level range
const ENCOUNTER_ZONES = [
  { x1:1,y1:9,x2:6,y2:14, table:['dripdrop','dripdrop','screendoor'], minLv:2, maxLv:5 },
  { x1:1,y1:15,x2:6,y2:18, table:['dripdrop','screendoor','oldtype'], minLv:4, maxLv:8 },
  { x1:18,y1:11,x2:26,y2:20,table:['boltpress','dripdrop','lasermike'], minLv:6, maxLv:12 },
  { x1:1,y1:22,x2:14,y2:27, table:['heatwave','oldtype','diehard'],  minLv:10,maxLv:18 },
  { x1:26,y1:0,x2:37,y2:9,  table:['diehard','goldpress'],          minLv:15,maxLv:22 },
]

// ─── NPC Data ────────────────────────────────────────────────

function makeNpcs(): Npc[] {
  return [
    {id:'doc',   x:17,y:5, dir:1, name:'Doc Plates', color:C.white,
     dialog:[
       'Welcome to the Print Shop!',
       'I can restore your printers to full health.',
       'Stay safe out there, kid.',
     ], onInteract:'heal'},
    {id:'sal',   x:17,y:4, dir:0, name:'Sal the Supplier', color:C.brown,
     dialog:[
       'Need supplies? I got everything.',
       'Ink, plates, shields — you name it.',
     ], onInteract:'shop'},
    {id:'tony',  x:14,y:13,dir:3, name:'Tony Two-Tone', color:C.red,
     dialog:[
       'Hey! Think you can beat me?',
       "Let's see what your printers can do!",
     ], isTrainer:true, onInteract:'battle',
     party:[makePrinter('boltpress',6)],
     defeated:false},
    {id:'frankie',x:24,y:17,dir:2, name:'Frankie Foil', color:C.purple,
     dialog:[
       'The warehouse district is rough.',
       'Keep your eyes peeled for feds.',
     ]},
    {id:'boss',  x:8,y:25, dir:0, name:'AGENT STERLING', color:C.navy,
     dialog:[
       'So you are the counterfeiter.',
       'I have been tracking you for months.',
       "Let's settle this — printer vs. printer!",
     ], isTrainer:true, onInteract:'battle',
     party:[makePrinter('diehard',20),makePrinter('goldpress',18)],
     defeated:false},
    {id:'guru',  x:5,y:12, dir:1, name:'Guru Gutenberg', color:C.gold,
     dialog:[
       'I hear there is a legendary printer...',
       'GoldPress — a machine of pure perfection.',
       'Some say it sleeps in the federal vault.',
       'Defeat Agent Sterling to open the door!',
     ]},
    {id:'sign1', x:11,y:8, dir:0, name:'Sign', color:C.ltGray,
     dialog:['BACK ALLEY — Watch your step.']},
    {id:'sign2', x:22,y:10,dir:0, name:'Sign', color:C.ltGray,
     dialog:['WAREHOUSE DISTRICT — Authorized only.']},
    {id:'sign3', x:7,y:21, dir:0, name:'Sign', color:C.ltGray,
     dialog:['THE DOCKS — Smuggler\'s paradise.']},
    {id:'guard', x:29,y:3, dir:3, name:'Guard', color:C.dkGray,
     dialog:['Federal Building. No entry without clearance.']},
  ]
}

// ─── Sprite System ──────────────────────────────────────────

const spriteCache = new Map<string, HTMLCanvasElement>()

function makeCvs(w:number,h:number):[HTMLCanvasElement,CanvasRenderingContext2D]{
  const c=document.createElement('canvas');c.width=w;c.height=h
  return [c,c.getContext('2d')!]
}

function getSprite(name:string):HTMLCanvasElement{
  if(spriteCache.has(name))return spriteCache.get(name)!
  const s=buildSprite(name);spriteCache.set(name,s);return s
}

function buildSprite(name:string):HTMLCanvasElement{
  switch(name){
    // Overworld player (top-down, 4 dirs)
    case 'player_down':  return drawOWPlayer(0)
    case 'player_up':    return drawOWPlayer(1)
    case 'player_left':  return drawOWPlayer(2)
    case 'player_right': return drawOWPlayer(3)
    // Battle sprites — printer types
    case 'inkjet':     return drawBattleInkjet()
    case 'offset':     return drawBattleOffset()
    case 'laser':      return drawBattleLaser()
    case 'letterpress':return drawBattleLetterpress()
    case 'thermo':     return drawBattleThermo()
    case 'screen':     return drawBattleScreen()
    case 'diehard':    return drawBattleDiehard()
    case 'goldpress':  return drawBattleGoldpress()
    // NPC generic
    case 'npc':        return drawNPCGeneric(C.blue)
    case 'npc_bad':    return drawNPCGeneric(C.navy)
    case 'star':       return drawStar8()
    case 'sparkle':    return drawSparkle()
    default:{const[c]=makeCvs(8,8);return c}
  }
}

function drawOWPlayer(dir:number):HTMLCanvasElement{
  const[c,ctx]=makeCvs(TILE,TILE)
  const hair=C.brown,shirt=C.red,pants=C.blue,shoe=C.dkGray
  // Hair
  ctx.fillStyle=hair
  if(dir===0){ctx.fillRect(4,1,8,4)} // facing down
  else if(dir===1){ctx.fillRect(4,1,8,2);ctx.fillRect(5,3,6,2)} // up — less hair
  else{ctx.fillRect(3,1,8,4);ctx.fillRect(dir===2?3:11,2,2,2)} // side
  // Face
  ctx.fillStyle=C.skin
  if(dir===0){ctx.fillRect(5,5,6,3)}
  else if(dir===1){ctx.fillRect(5,3,6,2)} // up — just neck
  else{ctx.fillRect(dir===2?3:7,4,6,4)}
  // Eyes
  if(dir===0){ctx.fillStyle=C.black;ctx.fillRect(6,6,2,1);ctx.fillRect(9,6,2,1)}
  else if(dir===2){ctx.fillStyle=C.black;ctx.fillRect(4,5,2,1)}
  else if(dir===3){ctx.fillStyle=C.black;ctx.fillRect(11,5,2,1)}
  // Body
  ctx.fillStyle=shirt;ctx.fillRect(4,8,8,4)
  // Arms
  ctx.fillStyle=C.skin
  if(dir===0){ctx.fillRect(2,9,2,3);ctx.fillRect(12,9,2,3)}
  else if(dir===2){ctx.fillRect(1,8,2,3);ctx.fillRect(13,9,2,3)}
  else if(dir===3){ctx.fillRect(1,9,2,3);ctx.fillRect(13,8,2,3)}
  else{ctx.fillRect(3,9,2,3);ctx.fillRect(11,9,2,3)}
  // Pants
  ctx.fillStyle=pants;ctx.fillRect(4,12,3,2);ctx.fillRect(9,12,3,2)
  // Shoes
  ctx.fillStyle=shoe;ctx.fillRect(3,14,4,1);ctx.fillRect(9,14,4,1)
  if(dir===2){ctx.fillRect(2,14,4,1)}
  else if(dir===3){ctx.fillRect(10,14,4,1)}
  return c
}

function drawNPCGeneric(color:string):HTMLCanvasElement{
  const[c,ctx]=makeCvs(TILE,TILE)
  ctx.fillStyle=color;ctx.fillRect(4,0,8,3)// hat
  ctx.fillStyle=C.skin;ctx.fillRect(5,3,6,4)// face
  ctx.fillStyle=C.black;ctx.fillRect(6,4,1,1);ctx.fillRect(9,4,1,1)// eyes
  ctx.fillStyle=color;ctx.fillRect(4,7,8,5)// body
  ctx.fillStyle=C.skin;ctx.fillRect(2,8,2,3);ctx.fillRect(12,8,2,3)// arms
  ctx.fillStyle=C.dkGray;ctx.fillRect(4,12,3,2);ctx.fillRect(9,12,3,2)// legs
  ctx.fillStyle=C.black;ctx.fillRect(3,14,4,1);ctx.fillRect(9,14,4,1)// shoes
  return c
}

// ─── Battle Sprites (24x24) ───

function drawBattleInkjet():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Body — compact inkjet printer
  ctx.fillStyle=C.ltGray;ctx.fillRect(3,8,18,12)
  ctx.fillStyle=C.white;ctx.fillRect(5,10,14,8)
  // Paper tray
  ctx.fillStyle=C.gray;ctx.fillRect(2,18,20,3);ctx.fillRect(4,20,16,2)
  // Carriage
  ctx.fillStyle=C.blue;ctx.fillRect(7,10,10,3)
  // Nozzles
  ctx.fillStyle=C.dkGreen
  for(let i=0;i<4;i++)ctx.fillRect(8+i*2,12,1,2)
  // Ink drops
  ctx.fillStyle=C.red;ctx.fillRect(10,9,1,2);ctx.fillStyle=C.blue;ctx.fillRect(13,9,1,2)
  // Control panel
  ctx.fillStyle=C.dkGray;ctx.fillRect(6,14,12,3)
  ctx.fillStyle=C.green;ctx.fillRect(7,15,2,1);ctx.fillStyle=C.red;ctx.fillRect(11,15,2,1)
  // Button
  ctx.fillStyle=C.gold;ctx.fillRect(16,15,1,1)
  // Paper
  ctx.fillStyle=C.white;ctx.fillRect(6,1,12,7)
  ctx.fillStyle=C.ltGray;ctx.fillRect(6,1,12,1)
  return c
}

function drawBattleOffset():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Large press body
  ctx.fillStyle=C.dkGray;ctx.fillRect(1,4,22,14)
  ctx.fillStyle=C.gray;ctx.fillRect(3,6,18,10)
  // Rollers
  ctx.fillStyle=C.ltGray
  ctx.fillRect(4,8,16,2);ctx.fillRect(4,12,16,2)
  // Roller details
  ctx.fillStyle=C.gray
  for(let i=0;i<8;i++){ctx.fillRect(4+i*2,8,1,2);ctx.fillRect(4+i*2,12,1,2)}
  // Ink plate
  ctx.fillStyle=C.green;ctx.fillRect(6,10,12,2)
  // Pressure gauge
  ctx.fillStyle=C.white;ctx.fillRect(18,5,4,4)
  ctx.fillStyle=C.red;ctx.fillRect(19,6,2,2)
  // Base
  ctx.fillStyle=C.dkGray;ctx.fillRect(2,18,20,4)
  // Paper in/out
  ctx.fillStyle=C.white;ctx.fillRect(0,10,2,8);ctx.fillRect(22,10,2,8)
  // Motor
  ctx.fillStyle=C.dkGray;ctx.fillRect(8,22,8,2)
  return c
}

function drawBattleLaser():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Sleek body
  ctx.fillStyle=C.navy;ctx.fillRect(4,6,16,12)
  ctx.fillStyle=C.ltBlue;ctx.fillRect(6,8,12,8)
  // Laser lens
  ctx.fillStyle=C.red;ctx.fillRect(10,3,4,4)
  ctx.fillStyle=C.orange;ctx.fillRect(11,4,2,2)
  // Laser beam slot
  ctx.fillStyle=C.dkGray;ctx.fillRect(8,6,8,2)
  // Scan lines
  ctx.fillStyle=C.cyan
  for(let i=0;i<3;i++)ctx.fillRect(7,10+i*2,10,1)
  // Paper output
  ctx.fillStyle=C.white;ctx.fillRect(2,18,20,3)
  ctx.fillStyle=C.ltGray;ctx.fillRect(2,18,20,1)
  // Control panel
  ctx.fillStyle=C.dkGray;ctx.fillRect(6,16,12,2)
  ctx.fillStyle=C.green;ctx.fillRect(7,17,1,1)
  ctx.fillStyle=C.gold;ctx.fillRect(16,17,1,1)
  // Vent
  ctx.fillStyle=C.gray;ctx.fillRect(5,0,14,3)
  for(let i=0;i<5;i++)ctx.fillRect(6+i*2,0,1,3)
  return c
}

function drawBattleLetterpress():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Heavy wooden frame
  ctx.fillStyle=C.brown;ctx.fillRect(1,2,22,18)
  ctx.fillStyle=C.wood;ctx.fillRect(3,4,18,14)
  // Type bed (letters)
  ctx.fillStyle=C.gray;ctx.fillRect(5,8,14,4)
  ctx.fillStyle=C.dkGray
  ctx.fillRect(6,9,2,2);ctx.fillRect(9,9,2,2);ctx.fillRect(12,9,2,2);ctx.fillRect(15,9,2,2)
  // Platen (top plate)
  ctx.fillStyle=C.ltGray;ctx.fillRect(4,5,16,3)
  ctx.fillStyle=C.gray;ctx.fillRect(5,6,14,1)
  // Handle/lever
  ctx.fillStyle=C.brown;ctx.fillRect(18,0,2,6);ctx.fillRect(14,0,6,2)
  ctx.fillStyle=C.dkGray;ctx.fillRect(19,0,2,2)
  // Ink disk
  ctx.fillStyle=C.dkGray;ctx.fillRect(6,13,3,3)
  ctx.fillStyle=C.black;ctx.fillRect(7,14,1,1)
  // Paper
  ctx.fillStyle=C.cream;ctx.fillRect(5,16,14,3)
  // Base
  ctx.fillStyle=C.dkBrown;ctx.fillRect(2,20,20,3)
  return c
}

function drawBattleThermo():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Heat plates
  ctx.fillStyle=C.orange;ctx.fillRect(2,4,20,3);ctx.fillRect(2,17,20,3)
  ctx.fillStyle=C.red;ctx.fillRect(2,8,20,2);ctx.fillRect(2,15,20,2)
  // Foil roll
  ctx.fillStyle=C.gold;ctx.fillRect(0,6,3,12)
  ctx.fillStyle=C.ltGray;ctx.fillRect(1,6,1,12)
  // Central roller
  ctx.fillStyle=C.dkGray;ctx.fillRect(6,10,12,4)
  ctx.fillStyle=C.gray;ctx.fillRect(7,11,10,2)
  // Heating element glow
  ctx.fillStyle=C.yellow;ctx.fillRect(4,5,1,1);ctx.fillRect(10,5,1,1);ctx.fillRect(16,5,1,1)
  // Control
  ctx.fillStyle=C.dkGray;ctx.fillRect(16,0,6,4)
  ctx.fillStyle=C.red;ctx.fillRect(17,1,2,1)
  ctx.fillStyle=C.green;ctx.fillRect(20,1,2,1)
  // Temp display
  ctx.fillStyle=C.cyan;ctx.fillRect(17,2,4,1)
  // Output
  ctx.fillStyle=C.gold;ctx.fillRect(21,6,3,12)
  ctx.fillStyle=C.orange;ctx.fillRect(22,7,1,10)
  return c
}

function drawBattleScreen():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Frame
  ctx.fillStyle=C.brown;ctx.fillRect(2,2,20,18)
  ctx.fillStyle=C.wood;ctx.fillRect(4,4,16,14)
  // Mesh screen
  ctx.fillStyle=C.ltGray;ctx.fillRect(5,6,14,10)
  ctx.fillStyle=C.gray
  for(let y=6;y<16;y+=2)ctx.fillRect(5,y,14,1)
  for(let x=5;x<19;x+=2)ctx.fillRect(x,6,1,10)
  // Squeegee
  ctx.fillStyle=C.dkGray;ctx.fillRect(6,8,12,2)
  ctx.fillStyle=C.ltGray;ctx.fillRect(6,9,12,1)
  // Ink
  ctx.fillStyle=C.purple;ctx.fillRect(8,7,8,1)
  // Handle
  ctx.fillStyle=C.brown;ctx.fillRect(17,8,4,4)
  // Base
  ctx.fillStyle=C.dkGray;ctx.fillRect(3,20,18,3)
  // Clamps
  ctx.fillStyle=C.gray;ctx.fillRect(2,4,2,2);ctx.fillRect(20,4,2,2)
  return c
}

function drawBattleDiehard():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Massive steel body
  ctx.fillStyle='#2C3E50';ctx.fillRect(1,2,22,16)
  ctx.fillStyle='#34495E';ctx.fillRect(3,4,18,12)
  // Armor plates
  ctx.fillStyle=C.gray;ctx.fillRect(4,5,16,2);ctx.fillRect(4,11,16,2)
  // Engraving laser
  ctx.fillStyle=C.red;ctx.fillRect(10,3,4,3)
  ctx.fillStyle=C.orange;ctx.fillRect(11,4,2,1)
  // Steel rollers
  ctx.fillStyle=C.ltGray;ctx.fillRect(5,7,14,2);ctx.fillRect(5,10,14,2)
  // Plate magazine
  ctx.fillStyle=C.dkGray;ctx.fillRect(2,14,6,4)
  ctx.fillStyle=C.gray;ctx.fillRect(3,15,4,2)
  // Heavy base
  ctx.fillStyle='#1a1a2e';ctx.fillRect(1,18,22,4)
  // Bolts
  ctx.fillStyle=C.dkGray
  ctx.fillRect(2,3,2,2);ctx.fillRect(20,3,2,2);ctx.fillRect(2,15,2,2);ctx.fillRect(20,15,2,2)
  return c
}

function drawBattleGoldpress():HTMLCanvasElement{
  const[c,ctx]=makeCvs(24,24)
  // Gold body
  ctx.fillStyle=C.gold;ctx.fillRect(2,2,20,16)
  ctx.fillStyle='#FFC107';ctx.fillRect(4,4,16,12)
  // Ornate pattern
  ctx.fillStyle=C.orange
  ctx.fillRect(5,5,14,1);ctx.fillRect(5,8,14,1);ctx.fillRect(5,11,14,1);ctx.fillRect(5,14,14,1)
  // Crown symbol
  ctx.fillStyle=C.white;ctx.fillRect(10,6,4,2)
  ctx.fillStyle=C.gold;ctx.fillRect(11,8,2,1)
  ctx.fillRect(9,9,6,1);ctx.fillRect(10,10,4,1);ctx.fillRect(11,11,2,1)
  // Foil output — rainbow
  ctx.fillStyle=C.red;ctx.fillRect(0,10,2,6)
  ctx.fillStyle=C.orange;ctx.fillRect(0,12,2,2)
  ctx.fillStyle=C.gold;ctx.fillRect(22,10,2,6)
  ctx.fillStyle=C.cyan;ctx.fillRect(22,12,2,2)
  // Gems
  ctx.fillStyle=C.red;ctx.fillRect(6,3,2,2);ctx.fillStyle=C.cyan;ctx.fillRect(16,3,2,2)
  // Base
  ctx.fillStyle=C.orange;ctx.fillRect(1,18,22,4)
  ctx.fillStyle=C.dkGray;ctx.fillRect(4,20,16,2)
  return c
}

function drawStar8():HTMLCanvasElement{
  const[c,ctx]=makeCvs(7,7)
  ctx.fillStyle=C.gold
  ctx.fillRect(3,0,1,1);ctx.fillRect(2,1,3,1)
  ctx.fillRect(0,2,7,1);ctx.fillRect(2,3,3,1)
  ctx.fillRect(1,4,5,1);ctx.fillRect(2,5,3,1);ctx.fillRect(3,6,1,1)
  return c
}
function drawSparkle():HTMLCanvasElement{
  const[c,ctx]=makeCvs(3,3)
  ctx.fillStyle=C.white;ctx.fillRect(1,0,1,3);ctx.fillRect(0,1,3,1)
  return c
}

// ─── Audio System ────────────────────────────────────────────

let audioCtx:AudioContext|null=null
function ensureAudio():AudioContext{
  if(!audioCtx)audioCtx=new AudioContext()
  if(audioCtx.state==='suspended')audioCtx.resume()
  return audioCtx
}
function playNote(freq:number,dur:number,type:OscillatorType='square',vol=0.12,delay=0){
  try{
    const ctx=ensureAudio(),t=ctx.currentTime+delay
    const o=ctx.createOscillator(),g=ctx.createGain()
    o.type=type;o.frequency.setValueAtTime(freq,t)
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur)
    o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+dur)
  }catch{}
}

function sfx(name:string){
  switch(name){
    case 'select': playNote(660,0.06,'square',0.08);break
    case 'confirm':playNote(523,0.06,'square',0.1);playNote(659,0.08,'square',0.08,0.04);break
    case 'hit':    playNote(200,0.12,'sawtooth',0.15);playNote(100,0.2,'sawtooth',0.1,0.08);break
    case 'crit':   playNote(300,0.1,'sawtooth',0.18);playNote(150,0.3,'sawtooth',0.15,0.08);break
    case 'heal':   playNote(440,0.1,'sine',0.1);playNote(554,0.1,'sine',0.1,0.1);playNote(659,0.15,'sine',0.08,0.2);break
    case 'levelup':[523,659,784,1047].forEach((f,i)=>playNote(f,0.12,'square',0.1,i*0.1));break
    case 'win':    [523,659,784,1047,784,1047,1318].forEach((f,i)=>playNote(f,0.1,'square',0.08,i*0.08));break
    case 'lose':   [392,349,330,262].forEach((f,i)=>playNote(f,0.25,'square',0.1,i*0.2));break
    case 'encounter':playNote(180,0.3,'sawtooth',0.15);playNote(220,0.3,'sawtooth',0.15,0.15);playNote(180,0.4,'sawtooth',0.18,0.3);break
    case 'start':  [262,330,392,523].forEach((f,i)=>playNote(f,0.08,'square',0.08,i*0.08));break
    case 'text':   playNote(440,0.02,'square',0.03);break
    case 'noteffective':playNote(300,0.15,'square',0.08);playNote(250,0.2,'square',0.06,0.12);break
    case 'supereffective':playNote(600,0.1,'square',0.1);playNote(800,0.15,'square',0.12,0.08);break
  }
}

let bgmInterval:ReturnType<typeof setInterval>|null=null
let bgmIdx=0
const BGM=[262,330,392,0,330,262,0,294,349,440,0,349,294,0,
           330,392,494,0,392,330,0,262,392,523,392,262,0]
function startBGM(){stopBGM();bgmIdx=0;bgmInterval=setInterval(()=>{const f=BGM[bgmIdx%BGM.length];if(f>0)playNote(f,0.12,'triangle',0.03);bgmIdx++},180)}
function stopBGM(){if(bgmInterval){clearInterval(bgmInterval);bgmInterval=null}}

// ─── Input System ────────────────────────────────────────────

const keys=new Set<string>()
let touchX=-1,touchY=-1
document.addEventListener('keydown',e=>{keys.add(e.key);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()})
document.addEventListener('keyup',e=>keys.delete(e.key))

function setupTouch(cv:HTMLCanvasElement){
  cv.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0],r=cv.getBoundingClientRect();touchX=(t.clientX-r.left)/r.width*W;touchY=(t.clientY-r.top)/r.height*H},{passive:false})
  cv.addEventListener('touchend',e=>{e.preventDefault();touchX=-1;touchY=-1},{passive:false})
}

function justPressed(key:string):boolean{if(keys.has(key)){keys.delete(key);return true}return false}
function upHeld():boolean{return keys.has('ArrowUp')||keys.has('w')||keys.has('W')||touchY<H*0.33}
function downHeld():boolean{return keys.has('ArrowDown')||keys.has('s')||keys.has('S')||touchY>H*0.66}
function leftHeld():boolean{return keys.has('ArrowLeft')||keys.has('a')||keys.has('A')||touchX<W*0.33}
function rightHeld():boolean{return keys.has('ArrowRight')||keys.has('d')||keys.has('D')||touchX>W*0.66}
function actionPressed():boolean{return justPressed(' ')||justPressed('Enter')}
function cancelPressed():boolean{return justPressed('Escape')||justPressed('Backspace')}

// ─── Utility ────────────────────────────────────────────────

function clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v))}
function rand(a:number,b:number){return a+Math.random()*(b-a)}
function randInt(a:number,b:number){return Math.floor(rand(a,b+1))}
function pick<T>(arr:T[]):T{return arr[Math.floor(Math.random()*arr.length)]}

// ─── Printer Factory ────────────────────────────────────────

function makePrinter(defId:string,level:number=5):Printer{
  const def=PRINTERS[defId];if(!def)throw new Error(`Unknown printer: ${defId}`)
  return createPrinter(defId,def.name,level)
}

function createPrinter(defId:string,nickname:string,level:number):Printer{
  const def=PRINTERS[defId]
  const hp=Math.floor(def.baseHp+level*3)
  return{
    defId,nickname,level,xp:0,xpNext:level*level*2+10,
    hp,maxHp:hp,atk:Math.floor(def.baseAtk+level*1.5),
    def:Math.floor(def.baseDef+level*1.2),spd:Math.floor(def.baseSpd+level*1.3),
    moves:def.moves.slice(0,4).map(id=>({defId:id,pp:MOVES[id].maxPp}))
  }
}

function makeWildPrinter(zone:typeof ENCOUNTER_ZONES[0]):Printer{
  const defId=pick(zone.table)
  const level=randInt(zone.minLv,zone.maxLv)
  const p=createPrinter(defId,PRINTERS[defId].name,level)
  // Wild printers might have an extra move at higher levels
  if(level>=10&&p.moves.length<4){
    const allMoves=PRINTERS[defId].moves
    if(allMoves.length>p.moves.length)p.moves.push({defId:allMoves[p.moves.length],pp:MOVES[allMoves[p.moves.length]].maxPp})
  }
  return p
}

function calcDamage(attacker:Printer,defender:Printer,move:MoveDef):{damage:number,effective:number}{
  const level=attacker.level
  const atkStat=attacker.atk;const defStat=defender.def
  let dmg=Math.floor(((2*level/5+2)*move.power*(atkStat/defStat))/50+2)
  // Type effectiveness
  const chart=TYPE_CHART[move.type]
  let eff=1
  if(chart){const m=chart[PRINTERS[defender.defId].type];if(m)eff=m}
  dmg=Math.floor(dmg*eff)
  // STAB
  if(move.type===PRINTERS[attacker.defId].type)dmg=Math.floor(dmg*1.3)
  // Random
  dmg=Math.floor(dmg*(0.85+Math.random()*0.15))
  return{damage:Math.max(1,dmg),effective:eff}
}

function xpToLevel(level:number):number{return level*level*2+10}

// ─── Particle System ────────────────────────────────────────

interface Particle{x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string;size:number;type:'star'|'sparkle'}
const particles:Particle[]=[]

function spawnStars(x:number,y:number,color:string,count=6){
  for(let i=0;i<count;i++){
    const a=Math.PI*2*i/count+Math.random()*0.5,sp=30+Math.random()*40
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0.4+Math.random()*0.3,maxLife:0.6,color,size:2+Math.random()*2,type:'star'})
  }
}

function updateParticles(dt:number){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;p.life-=dt
    if(p.life<=0)particles.splice(i,1)
  }
}

function drawParticles(ctx:CanvasRenderingContext2D){
  for(const p of particles){
    ctx.globalAlpha=clamp(p.life/p.maxLife,0,1);ctx.fillStyle=p.color
    if(p.type==='star')ctx.drawImage(getSprite('star'),Math.floor(p.x)-3,Math.floor(p.y)-3)
    else ctx.drawImage(getSprite('sparkle'),Math.floor(p.x)-1,Math.floor(p.y)-1)
  }
  ctx.globalAlpha=1
}

// ─── Game State ──────────────────────────────────────────────

interface GameData{
  screen:GameScreen
  // Player
  px:number;py:number;pdir:number
  money:number;stepCount:number
  party:Printer[]
  inventory:Record<string,number>
  // NPCs
  npcs:Npc[]
  npcDefeated:Record<string,boolean>
  fedBossDefeated:boolean
  // Camera
  camX:number;camY:number
  // Overworld animation
  walkFrame:number;walkTimer:number
  // Battle
  battle:BattleState|null
  // Dialog
  dialog:{lines:string[],idx:number,charIdx:number,timer:number,callback:()=>void}|null
  // Menu
  menuCursor:number;menuOpen:boolean
  // Shop
  shopCursor:number
  // Party screen
  partyCursor:number
  // Encounters
  encounterCooldown:number
  // Transitions
  fadeAlpha:number;fadeTarget:number;fadeCallback:(()=>void)|null
  // Title
  titleBlink:number
  // Notification
  notification:string;notifTimer:number
  // Stats
  battlesWon:number;printersCaught:number
}

function newGame():GameData{
  const party=[createPrinter('dripdrop','DripDrop',5)]
  return{
    screen:'title',
    px:17*TILE,py:6*TILE,pdir:0,
    money:500,stepCount:0,party,inventory:{inkRefill:3,speedOil:1},
    npcs:makeNpcs(),npcDefeated:{},fedBossDefeated:false,
    camX:0,camY:0,walkFrame:0,walkTimer:0,
    battle:null,dialog:null,
    menuCursor:0,menuOpen:false,shopCursor:0,partyCursor:0,
    encounterCooldown:0,
    fadeAlpha:0,fadeTarget:0,fadeCallback:null,
    titleBlink:0,notification:'',notifTimer:0,
    battlesWon:0,printersCaught:0,
  }
}

// ─── Map Helpers ─────────────────────────────────────────────

function getTile(x:number,y:number):string{
  if(x<0||y<0||x>=MAP_W||y>=MAP_H)return'W'
  return MAP_DATA[y]?.[x]||'W'
}

function isBlocked(x:number,y:number):boolean{
  const t=getTile(x,y)
  if('WT~BCFXR'.includes(t))return true
  // Check NPCs
  for(const n of g.npcs){
    if(Math.floor(n.x/TILE)===x&&Math.floor(n.y/TILE)===y)return true
  }
  return false
}

function canEncounter(tx:number,ty:number):boolean{
  const z=ENCOUNTER_ZONES.find(z=>tx>=z.x1&&tx<=z.x2&&ty>=z.y1&&ty<=z.y2)
  return!!z
}

// ─── Dialog System ───────────────────────────────────────────

function showDialog(lines:string[],callback:()=>void=()=>{}){
  g.dialog={lines,idx:0,charIdx:0,timer:0,callback}
  g.screen='dialog'
}

function advanceDialog(){
  if(!g.dialog)return
  g.dialog.timer+=1/FPS
  const line=g.dialog.lines[g.dialog.idx]
  if(g.dialog.timer>line.length*0.03+0.5){
    // Auto advance if timer exceeds
  }
}

function updateDialog(){
  if(!g.dialog)return
  g.dialog.timer+=1/FPS*2 // chars per frame
  if(g.dialog.charIdx<g.dialog.lines[g.dialog.idx].length){
    g.dialog.charIdx=Math.min(g.dialog.charIdx+1,g.dialog.lines[g.dialog.idx].length)
    if(g.dialog.charIdx%3===0)sfx('text')
  }
  if(actionPressed()){
    if(g.dialog.charIdx<g.dialog.lines[g.dialog.idx].length){
      g.dialog.charIdx=g.dialog.lines[g.dialog.idx].length // skip
    }else{
      g.dialog.idx++
      if(g.dialog.idx>=g.dialog.lines.length){
        const cb=g.dialog.callback
        g.dialog=null
        g.screen='overworld'
        cb()
      }else{
        g.dialog.charIdx=0;g.dialog.timer=0
      }
    }
  }
}

// ─── Overworld Update ────────────────────────────────────────

let moveTimer=0
function updateOverworld(dt:number){
  if(g.menuOpen){
    updateMenu(dt);return
  }

  // Fade transition
  if(g.fadeAlpha<g.fadeTarget){
    g.fadeAlpha=Math.min(g.fadeTarget,g.fadeAlpha+dt*3)
    if(g.fadeAlpha>=g.fadeTarget&&g.fadeCallback){
      const cb=g.fadeCallback;g.fadeCallback=null;cb()
    }
  }else if(g.fadeAlpha>g.fadeTarget){
    g.fadeAlpha=Math.max(g.fadeTarget,g.fadeAlpha-dt*3)
  }
  if(g.fadeAlpha>0)return

  // Movement
  let dx=0,dy=0
  if(upHeld()){dy=-1;g.pdir=1}
  else if(downHeld()){dy=1;g.pdir=0}
  else if(leftHeld()){dx=-1;g.pdir=2}
  else if(rightHeld()){dx=1;g.pdir=3}

  if(dx!==0||dy!==0){
    moveTimer+=dt
    if(moveTimer>=0.18){
      moveTimer=0
      const nx=Math.floor(g.px/TILE)+dx,ny=Math.floor(g.py/TILE)+dy
      if(!isBlocked(nx,ny)){
        g.px=nx*TILE;g.py=ny*TILE
        g.walkFrame=(g.walkFrame+1)%2
        g.stepCount++
        // Encounters
        g.encounterCooldown-=0.18
        if(g.encounterCooldown<=0&&canEncounter(nx,ny)&&Math.random()<0.12){
          g.encounterCooldown=1.5
          const zone=ENCOUNTER_ZONES.find(z=>nx>=z.x1&&nx<=z.x2&&ny>=z.y1&&ny<=z.y2)!
          const wild=makeWildPrinter(zone)
          startBattle(wild,false)
          return
        }
      }
    }
  }else{
    moveTimer=0.15
    g.walkFrame=0
  }

  // NPC interaction
  if(actionPressed()){
    // Check facing NPC
    const fx=Math.floor(g.px/TILE)+(g.pdir===3?1:g.pdir===2?-1:0)
    const fy=Math.floor(g.py/TILE)+(g.pdir===0?1:g.pdir===1?-1:0)
    for(const npc of g.npcs){
      if(Math.floor(npc.x/TILE)===fx&&Math.floor(npc.y/TILE)===fy){
        interactNpc(npc);return
      }
    }
  }

  // Camera
  const targetCX=g.px-W/2+TILE/2, targetCY=g.py-H/2+TILE/2
  g.camX+=(targetCX-g.camX)*dt*5;g.camY+=(targetCY-g.camY)*dt*5
  g.camX=clamp(g.camX,0,MAP_W*TILE-W)
  g.camY=clamp(g.camY,0,MAP_H*TILE-H)

  // Notification timer
  if(g.notifTimer>0)g.notifTimer-=dt

  updateParticles(dt)
}

function interactNpc(npc:Npc){
  sfx('confirm')
  if(npc.onInteract==='heal'){
    showDialog([...npc.dialog,'All your printers are restored!'],()=>{
      for(const p of g.party)p.hp=p.maxHp
      for(const m of g.party.flatMap(p=>p.moves))m.pp=m.pp
      notify('Printers fully restored!')
    })
  }else if(npc.onInteract==='shop'){
    showDialog(npc.dialog,()=>openShop())
  }else if(npc.onInteract==='battle'){
    if(g.npcDefeated[npc.id]){
      showDialog([npc.dialog[0],'No need to fight again. You won.'],()=>{})
    }else{
      showDialog(npc.dialog,()=>{
        const enemy=npc.party![0]
        // Scale to match player level
        const avgLv=Math.floor(g.party.reduce((s,p)=>s+p.level,0)/g.party.length)
        const scaled=createPrinter(enemy.defId,enemy.nickname,clamp(avgLv,enemy.level-2,enemy.level+3))
        startBattle(scaled,true,npc)
      })
    }
  }else if(npc.onInteract==='give'){
    showDialog([...npc.dialog],()=>{
      if(g.party.length<6){
        const p=createPrinter(npc.givePrinter||'screendoor',PRINTERS[npc.givePrinter||'screendoor'].name,8)
        g.party.push(p)
        notify(`Got ${p.nickname}!`)
      }else{
        notify('Party is full!')
      }
    })
  }else{
    showDialog(npc.dialog,()=>{})
  }
}

// ─── Shop ────────────────────────────────────────────────────

const SHOP_ITEMS=['inkRefill','inkTank','freshPlate','speedOil','atkInk','defShield']

function openShop(){
  g.screen='shop';g.shopCursor=0
}

function updateShop(dt:number){
  if(actionPressed()){
    const item=ITEMS[SHOP_ITEMS[g.shopCursor]]
    if(g.money>=item.price){
      g.money-=item.price
      g.inventory[SHOP_ITEMS[g.shopCursor]]=(g.inventory[SHOP_ITEMS[g.shopCursor]]||0)+1
      sfx('confirm');notify(`Bought ${item.name}!`)
    }else{
      sfx('hit');notify('Not enough money!')
    }
  }
  if(cancelPressed()||justPressed('Escape')){
    g.screen='overworld';sfx('select')
  }
  if(justPressed('ArrowUp')){g.shopCursor=Math.max(0,g.shopCursor-1);sfx('select')}
  if(justPressed('ArrowDown')){g.shopCursor=Math.min(SHOP_ITEMS.length-1,g.shopCursor+1);sfx('select')}
}

// ─── Menu ───────────────────────────────────────────────────

function updateMenu(dt:number){
  if(!g.menuOpen)return
  const opts=['Party','Items','Save','Quit']
  if(justPressed('ArrowUp')){g.menuCursor=(g.menuCursor+opts.length-1)%opts.length;sfx('select')}
  if(justPressed('ArrowDown')){g.menuCursor=(g.menuCursor+1)%opts.length;sfx('select')}
  if(actionPressed()){
    sfx('confirm')
    if(g.menuCursor===0){g.menuOpen=false;g.screen='party';g.partyCursor=0}
    else if(g.menuCursor===1){g.menuOpen=false;g.screen='shop'}
    else if(g.menuCursor===2){
      try{localStorage.setItem('inkjob99_save',JSON.stringify({px:g.px,py:g.py,pdir:g.pdir,money:g.money,party:g.party,inventory:g.inventory,npcDefeated:g.npcDefeated,fedBossDefeated:g.fedBossDefeated,battlesWon:g.battlesWon,printersCaught:g.printersCaught}));notify('Game saved!')}catch{notify('Save failed!')}
    }else if(g.menuCursor===3){g.menuOpen=false;g.screen='overworld'}
  }
  if(cancelPressed()){g.menuOpen=false;sfx('select')}
  if(justPressed('Escape')){g.menuOpen=false;sfx('select')}
}

function updateParty(dt:number){
  if(justPressed('ArrowUp')){g.partyCursor=Math.max(0,g.partyCursor-1);sfx('select')}
  if(justPressed('ArrowDown')){g.partyCursor=Math.min(g.party.length-1,g.partyCursor+1);sfx('select')}
  if(actionPressed()){
    const p=g.party[g.partyCursor]
    // Use inkRefill on this printer
    if(g.inventory.inkRefill>0&&p.hp<p.maxHp){
      g.inventory.inkRefill--;p.hp=Math.min(p.maxHp,p.hp+ITEMS.inkRefill.power)
      sfx('heal');notify(`${p.nickname} healed!`)
    }else if(g.inventory.inkTank>0&&p.hp<p.maxHp){
      g.inventory.inkTank--;p.hp=Math.min(p.maxHp,p.hp+ITEMS.inkTank.power)
      sfx('heal');notify(`${p.nickname} healed!`)
    }else if(g.inventory.freshPlate>0&&p.hp<p.maxHp){
      g.inventory.freshPlate--;p.hp=p.maxHp
      sfx('heal');notify(`${p.nickname} fully restored!`)
    }else{notify('No healing items or HP is full!')}
  }
  if(cancelPressed()||justPressed('Escape')){g.screen='overworld';sfx('select')}
}

// ─── Battle System ───────────────────────────────────────────

function startBattle(enemy:Printer,isTrainer:boolean,trainer?:Npc){
  sfx('encounter')
  const firstAlive=g.party.find(p=>p.hp>0)
  if(!firstAlive)return
  g.battle={
    player:{printer:firstAlive,side:'player',x:40,y:120,shakeX:0,flash:0},
    enemy:{printer:enemy,side:'enemy',x:220,y:50,shakeX:0,flash:0},
    phase:'intro',
    textLines:[isTrainer?`${trainer!.name} sends out ${enemy.nickname}!`:`A wild ${enemy.nickname} (Lv${enemy.level}) appeared!`],
    textTimer:0,textCallback:()=>{},
    cursor:0,selectedMove:0,
    playerAction:null,turnCount:0,
  }
  g.screen='battle'
  g.battle.textCallback=()=>{
    g.battle!.textLines=[`Go! ${firstAlive.nickname}!`]
    g.battle!.textCallback=()=>{g.battle!.phase='playerTurn'}
  }
}

function updateBattle(dt:number){
  const b=g.battle;if(!b)return

  // Shake/flash decay
  b.player.shakeX*=0.85;b.enemy.shakeX*=0.85
  b.player.flash=Math.max(0,b.player.flash-dt*3)
  b.enemy.flash=Math.max(0,b.enemy.flash-dt*3)

  updateParticles(dt)

  if(b.phase==='intro'||b.phase==='text'||b.phase==='levelUp'){
    // Wait for action press to advance text
    if(actionPressed()){
      sfx('confirm')
      const cb=b.textCallback;b.textCallback=()=>{};cb()
    }
    return
  }

  if(b.phase==='fainted'){
    if(actionPressed()){
      // Switch to next printer or game over
      const nextAlive=g.party.find(p=>p.hp>0&&p!==b.player.printer)
      if(b.enemy.hp<=0){
        // Enemy fainted
        if(nextAlive){
          b.phase='won'
          b.textLines=[`${b.enemy.printer.nickname} was defeated!`]
          b.textCallback=()=>{g.screen='overworld';g.battle=null;startBGM()}
        }else{
          b.phase='won'
          b.textLines=[`${b.enemy.printer.nickname} was defeated!`]
          b.textCallback=()=>{g.screen='overworld';g.battle=null;startBGM()}
        }
      }else{
        // Player fainted
        if(nextAlive){
          b.player.printer=nextAlive
          b.player.x=40;b.player.y=120
          b.textLines=[`${nextAlive.nickname}, I choose you!`]
          b.textCallback=()=>{b.phase='playerTurn'}
        }else{
          b.phase='text'
          b.textLines=['All your printers fainted...']
          b.textCallback=()=>{
            g.screen='gameOver';g.battle=null;stopBGM();sfx('lose')
          }
        }
      }
    }
    return
  }

  if(b.phase==='won'||b.phase==='ran'){
    if(actionPressed()){
      sfx('confirm');g.screen='overworld';g.battle=null;startBGM()
    }
    return
  }

  if(b.phase==='playerTurn'){
    if(justPressed('ArrowUp')){g.menuCursor=(g.menuCursor+3)%4;sfx('select')}
    if(justPressed('ArrowDown')){g.menuCursor=(g.menuCursor+1)%4;sfx('select')}
    if(actionPressed()){
      if(g.menuCursor<2){
        // Fight or Items
        if(g.menuCursor===0){b.phase='fightMenu';b.selectedMove=0;sfx('confirm')}
        else{b.phase='itemMenu';g.shopCursor=0;sfx('confirm')}
      }else{
        // Run
        if(b.enemy.side==='enemy'&&!g.battle?.enemy.printer){
          // Can always run from wild
        }
        b.phase='ran';b.textLines=['Got away safely!'];sfx('confirm')
      }
    }
    if(cancelPressed()){/* already on main menu */}
    return
  }

  if(b.phase==='fightMenu'){
    const moves=b.player.printer.moves
    if(justPressed('ArrowUp')){b.selectedMove=(b.selectedMove+2)%moves.length;sfx('select')}
    if(justPressed('ArrowDown')){b.selectedMove=(b.selectedMove+1)%moves.length;sfx('select')}
    if(actionPressed()){
      sfx('confirm')
      const m=moves[b.selectedMove]
      if(m.pp<=0){b.textLines=['No PP left for this move!'];b.phase='text';b.textCallback=()=>{b.phase='fightMenu'};return}
      b.playerAction={type:'move',id:b.selectedMove}
      executePlayerMove()
    }
    if(cancelPressed()){b.phase='playerTurn';g.menuCursor=0;sfx('select')}
    return
  }

  if(b.phase==='itemMenu'){
    const healItems=Object.entries(g.inventory).filter(([k,v])=>v>0&&ITEMS[k]&&(ITEMS[k].type==='heal'))
    if(healItems.length===0){b.textLines=['No items!'];b.phase='text';b.textCallback=()=>{b.phase='playerTurn';g.menuCursor=1};return}
    if(justPressed('ArrowUp')){g.shopCursor=Math.max(0,g.shopCursor-1);sfx('select')}
    if(justPressed('ArrowDown')){g.shopCursor=Math.min(healItems.length-1,g.shopCursor+1);sfx('select')}
    if(actionPressed()){
      const[key]=healItems[g.shopCursor]||[]
      const item=ITEMS[key]
      if(item&&item.type==='heal'){
        g.inventory[key]--
        const amt=Math.min(item.power,b.player.printer.maxHp-b.player.printer.hp)
        b.player.printer.hp+=amt
        sfx('heal')
        b.phase='text'
        b.textLines=[`Used ${item.name}! +${amt} HP`]
        b.textCallback=()=>executeEnemyTurn()
      }
    }
    if(cancelPressed()){b.phase='playerTurn';g.menuCursor=1;sfx('select')}
    return
  }

  // Animated phases — auto-advance after delay
  if(b.phase==='executePlayer'){
    b.textTimer+=dt
    if(b.textTimer>1.5){
      if(b.enemy.hp<=0){
        handleFaint('enemy');return
      }
      executeEnemyTurn()
    }
    return
  }

  if(b.phase==='executeEnemy'){
    b.textTimer+=dt
    if(b.textTimer>1.5){
      if(b.player.hp<=0){
        handleFaint('player');return
      }
      b.phase='playerTurn';b.textLines=[];g.menuCursor=0
    }
    return
  }
}

function executePlayerMove(){
  const b=g.battle;if(!b)return
  const action=b.playerAction
  if(!action||action.type!=='move')return
  const moveDef=MOVES[b.player.printer.moves[action.id].defId]
  b.player.printer.moves[action.id].pp--

  // Accuracy check
  if(Math.random()*100>moveDef.accuracy){
    b.phase='text';b.textLines=[`${b.player.printer.nickname} used ${moveDef.name}!`,`But it missed!`]
    b.textCallback=()=>executeEnemyTurn()
    sfx('noteffective');return
  }

  const{damage,effective}=calcDamage(b.player.printer,b.enemy.printer,moveDef)
  b.enemy.printer.hp=Math.max(0,b.enemy.printer.hp-damage)
  b.enemy.shakeX=8;b.enemy.flash=1

  let effText=''
  if(effective>1){effText="It's super effective!";sfx('supereffective')}
  else if(effective<1){effText="It's not very effective...";sfx('noteffective')}
  else sfx('hit')
  if(damage>=b.enemy.printer.maxHp*0.4)sfx('crit')

  b.phase='executePlayer';b.textTimer=0
  b.textLines=[`${b.player.printer.nickname} used ${moveDef.name}!`,`${effText?effText:''} ${damage} damage!`.trim()]
  b.textCallback=()=>{}

  // XP gain
  if(b.enemy.hp<=0){
    const xpGain=Math.floor(b.enemy.printer.level*15*effective)
    b.player.printer.xp+=xpGain
    // Check level up
    if(b.player.printer.xp>=b.player.printer.xpNext){
      levelUp(b.player.printer)
    }
    // Money reward
    g.money+=b.enemy.printer.level*10
    g.battlesWon++
  }

  spawnStars(b.enemy.x+12,b.enemy.y+12,effective>1?C.gold:C.orange,6)
}

function executeEnemyTurn(){
  const b=g.battle;if(!b)return
  // AI: pick best move
  const moves=b.enemy.printer.moves.filter(m=>m.pp>0)
  if(moves.length===0){
    b.phase='text';b.textLines=[`${b.enemy.printer.nickname} has no moves left!`]
    b.textCallback=()=>{b.phase='playerTurn';g.menuCursor=0}
    return
  }
  // Pick move with best type effectiveness
  let bestMove=moves[0],bestEff=0
  for(const m of moves){
    const md=MOVES[m.defId]
    const chart=TYPE_CHART[md.type]
    const eff=chart?chart[PRINTERS[b.player.printer.defId].type]||1:1
    if(eff>bestEff||(eff===bestEff&&md.power>MOVES[bestMove.defId].power)){bestEff=eff;bestMove=m}
  }
  bestMove.pp--

  const moveDef=MOVES[bestMove.defId]
  if(Math.random()*100>moveDef.accuracy){
    b.phase='text';b.textLines=[`${b.enemy.printer.nickname} used ${moveDef.name}!`,`But it missed!`]
    b.textCallback=()=>{b.phase='playerTurn';g.menuCursor=0}
    sfx('text');return
  }

  const{damage,effective}=calcDamage(b.enemy.printer,b.player.printer,moveDef)
  b.player.printer.hp=Math.max(0,b.player.printer.hp-damage)
  b.player.shakeX=8;b.player.flash=1

  let effText=''
  if(effective>1)effText="Super effective!"
  else if(effective<1)effText="Not very effective..."
  sfx(effective>1?'crit':'hit')

  b.phase='executeEnemy';b.textTimer=0
  b.textLines=[`${b.enemy.printer.nickname} used ${moveDef.name}!`,`${effText} ${damage} damage!`]
  b.textCallback=()=>{}
  spawnStars(b.player.x+12,b.player.y+12,C.red,4)
}

function handleFaint(who:'player'|'enemy'){
  const b=g.battle;if(!b)return
  b.phase='fainted'
  if(who==='enemy'){
    b.textLines=[`${b.enemy.printer.nickname} fainted!`]
    b.textCallback=()=>{}
  }else{
    b.textLines=[`${b.player.printer.nickname} fainted!`]
    b.textCallback=()=>{}
  }
}

function levelUp(p:Printer){
  p.level++
  const def=PRINTERS[p.defId]
  p.maxHp=Math.floor(def.baseHp+p.level*3);p.hp=p.maxHp
  p.atk=Math.floor(def.baseAtk+p.level*1.5)
  p.def=Math.floor(def.baseDef+p.level*1.2)
  p.spd=Math.floor(def.baseSpd+p.level*1.3)
  p.xpNext=xpToLevel(p.level)
  // Learn new move at certain levels
  if(p.level%5===0){
    const allMoves=PRINTERS[p.defId].moves
    if(allMoves.length>p.moves.length){
      const newMove=allMoves[p.moves.length]
      if(p.moves.length<4){
        p.moves.push({defId:newMove,pp:MOVES[newMove].maxPp})
        notify(`${p.nickname} learned ${MOVES[newMove].name}!`)
      }
    }
  }
  sfx('levelup')
}

function notify(msg:string){g.notification=msg;g.notifTimer=3}

// ─── Rendering ──────────────────────────────────────────────

let canvas:HTMLCanvasElement
let ctx:CanvasRenderingContext2D

function render(){
  ctx.imageSmoothingEnabled=false

  switch(g.screen){
    case 'title': renderTitle();break
    case 'overworld':case 'menu':case 'party':renderOverworld();break
    case 'battle':renderBattle();break
    case 'dialog':renderOverworld();renderDialog();break
    case 'shop':renderShop();break
    case 'gameOver':renderGameOver();break
  }

  // Fade overlay
  if(g.fadeAlpha>0){
    ctx.globalAlpha=g.fadeAlpha;ctx.fillStyle=C.black;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1
  }

  // Notification
  if(g.notifTimer>0){
    ctx.globalAlpha=Math.min(1,g.notifTimer);ctx.fillStyle='rgba(0,0,0,0.7)'
    const tw=ctx.measureText(g.notification).width+16
    ctx.fillRect(W/2-tw/2,2,tw,12)
    ctx.fillStyle=C.gold;ctx.font='bold 6px monospace';ctx.textAlign='center'
    ctx.fillText(g.notification,W/2,10);ctx.globalAlpha=1
  }
}

// ─── Tile Renderer ──────────────────────────────────────────

function drawTile(ctx:CanvasRenderingContext2D,tile:string,x:number,y:number){
  switch(tile){
    case '.': // grass
      ctx.fillStyle=(x+y)%2===0?C.grass1:C.grass2;ctx.fillRect(x,y,TILE,TILE)
      // Grass detail
      ctx.fillStyle=C.dkGreen
      if((x*7+y*13)%5===0){ctx.fillRect(x+3,y+5,1,3);ctx.fillRect(x+4,y+4,1,2)}
      if((x*11+y*3)%7===0){ctx.fillRect(x+10,y+9,1,3);ctx.fillRect(x+11,y+8,1,2)}
      break
    case 'R': // road
      ctx.fillStyle=C.path;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle='#B8956A'
      if((x+y)%2===0)ctx.fillRect(x+4,y+4,1,1)
      break
    case 'W': // wall exterior
      ctx.fillStyle=C.wallExt;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.gray;ctx.fillRect(x,y,TILE,1);ctx.fillRect(x,y,1,TILE)
      break
    case 'B': // brick wall
      ctx.fillStyle=C.brick;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle='#A93226'
      for(let r=0;r<4;r++)for(let c=0;c<2;c++)ctx.fillRect(x+c*8+((r%2)*4),y+r*4,6,2)
      break
    case 'D': // door
      ctx.fillStyle=C.door;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.gold;ctx.fillRect(x+6,y+4,4,4) // handle
      ctx.fillStyle=C.brown;ctx.fillRect(x+1,y+1,TILE-2,TILE-2) // frame
      ctx.fillStyle=C.door;ctx.fillRect(x+2,y+2,TILE-4,TILE-4)
      ctx.fillStyle=C.gold;ctx.fillRect(x+10,y+6,2,2)
      break
    case 'T': // tree
      ctx.fillStyle=C.grass1;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.brown;ctx.fillRect(x+6,y+8,4,8)// trunk
      ctx.fillStyle=C.dkGreen;ctx.fillRect(x+2,y+1,12,8)
      ctx.fillStyle=C.green;ctx.fillRect(x+3,y+2,10,6)
      ctx.fillStyle=C.ltGreen;ctx.fillRect(x+5,y+3,4,3)// highlight
      break
    case '~': // water
      ctx.fillStyle=C.water;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle='#1F618D'
      const wo=Math.sin(Date.now()/500+x)*2
      ctx.fillRect(x+2+wo,y+4,6,1);ctx.fillRect(x+8+wo,y+10,5,1)
      break
    case '_': // floor
      ctx.fillStyle=(x+y)%2===0?C.floor:C.darkFloor;ctx.fillRect(x,y,TILE,TILE)
      break
    case 'C': // counter
      ctx.fillStyle=C.counter;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.wood;ctx.fillRect(x,y,TILE,2)
      break
    case 'X': // crate
      ctx.fillStyle=C.wood;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.brown;ctx.fillRect(x+1,y+1,TILE-2,TILE-2)
      ctx.fillStyle=C.dkGray;ctx.fillRect(x+4,y+4,2,2);ctx.fillRect(x+10,y+4,2,2)
      ctx.fillRect(x+4,y+10,2,2);ctx.fillRect(x+10,y+10,2,2)
      break
    case 'F': // fence
      ctx.fillStyle=C.fence;ctx.fillRect(x,y,TILE,TILE)
      ctx.fillStyle=C.wood;ctx.fillRect(x+2,y,4,TILE);ctx.fillRect(x+10,y,4,TILE)
      ctx.fillRect(x,y+3,TILE,2);ctx.fillRect(x,y+11,TILE,2)
      break
    default:
      ctx.fillStyle=C.black;ctx.fillRect(x,y,TILE,TILE)
  }
}

// ─── Overworld Renderer ─────────────────────────────────────

function renderOverworld(){
  // Background
  ctx.fillStyle=C.black;ctx.fillRect(0,0,W,H)

  ctx.save()
  ctx.translate(-Math.floor(g.camX),-Math.floor(g.camY))

  // Draw visible tiles
  const sx=Math.floor(g.camX/TILE),sy=Math.floor(g.camY/TILE)
  const ex=Math.min(MAP_W-1,sx+Math.ceil(W/TILE)+1),ey=Math.min(MAP_H-1,sy+Math.ceil(H/TILE)+1)
  for(let y=sy;y<=ey;y++)for(let x=sx;x<=ex;x++){
    drawTile(ctx,getTile(x,y),x*TILE,y*TILE)
  }

  // Draw NPCs
  for(const npc of g.npcs){
    const nc=makeCvs(TILE,TILE)
    const nctx=nc[1]
    // Draw colored NPC
    nctx.fillStyle=npc.color;nctx.fillRect(4,0,8,3)// hat
    nctx.fillStyle=C.skin;nctx.fillRect(5,3,6,4)// face
    nctx.fillStyle=C.black;nctx.fillRect(6,4,1,1);nctx.fillRect(9,4,1,1)// eyes
    nctx.fillStyle=npc.color;nctx.fillRect(4,7,8,5)// body
    nctx.fillStyle=C.skin;nctx.fillRect(2,8,2,3);nctx.fillRect(12,8,2,3)// arms
    nctx.fillStyle=C.dkGray;nctx.fillRect(4,12,3,2);nctx.fillRect(9,12,3,2)// legs
    nctx.fillStyle=C.black;nctx.fillRect(3,14,4,1);nctx.fillRect(9,14,4,1)// shoes
    ctx.drawImage(nc[0],Math.floor(npc.x),Math.floor(npc.y))
  }

  // Draw player
  const dirSprites=['player_down','player_up','player_left','player_right']
  const pSprite=getSprite(dirSprites[g.pdir])
  ctx.drawImage(pSprite,Math.floor(g.px),Math.floor(g.py))

  // Particles
  drawParticles(ctx)

  ctx.restore()

  // HUD
  renderOverworldHUD()

  // Menu overlay
  if(g.menuOpen)renderMenuOverlay()
  if(g.screen==='party')renderPartyOverlay()
}

function renderOverworldHUD(){
  // Bottom bar
  ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,H-16,W,16)
  ctx.fillStyle=C.white;ctx.font='6px monospace';ctx.textAlign='left'
  ctx.fillText(`$${g.money}`,4,H-4)
  // Party HP
  const alive=g.party.filter(p=>p.hp>0)
  ctx.fillStyle=C.green;ctx.fillText(`${alive.length}/${g.party.length} OK`,80,H-4)
  // First printer info
  if(g.party[0]){
    ctx.fillStyle=C.gold;ctx.fillText(`${g.party[0].nickname} Lv${g.party[0].level}`,160,H-4)
  }
  // Hint
  ctx.fillStyle=C.gray;ctx.textAlign='right';ctx.fillText('SPACE:interact',W-4,H-4)
}

function renderMenuOverlay(){
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(40,30,200,120)
  ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(40,30,200,120)
  ctx.fillStyle=C.gold;ctx.font='bold 7px monospace';ctx.textAlign='center'
  ctx.fillText('MENU',W/2,46)
  const opts=['Party','Items','Save','Quit']
  ctx.textAlign='left';ctx.font='6px monospace'
  for(let i=0;i<opts.length;i++){
    ctx.fillStyle=i===g.menuCursor?C.gold:C.white
    const prefix=i===g.menuCursor?'>':' '
    ctx.fillText(`${prefix} ${opts[i]}`,60,66+i*18)
  }
}

function renderPartyOverlay(){
  ctx.fillStyle='rgba(0,0,0,0.9)';ctx.fillRect(20,10,W-40,H-30)
  ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(20,10,W-40,H-30)
  ctx.fillStyle=C.gold;ctx.font='bold 7px monospace';ctx.textAlign='center'
  ctx.fillText('PARTY',W/2,24)
  ctx.textAlign='left';ctx.font='6px monospace'
  for(let i=0;i<g.party.length;i++){
    const p=g.party[i]
    const y=32+i*28
    if(y>H-30)break
    const sel=i===g.partyCursor
    ctx.fillStyle=sel?'rgba(255,215,0,0.15)':'transparent';ctx.fillRect(24,y,W-48,26)
    ctx.fillStyle=sel?C.gold:C.white
    ctx.fillText(`${sel?'>':' '}${p.nickname}`,28,y+10)
    ctx.fillStyle=C.ltGray;ctx.fillText(`Lv${p.level} ${PRINTERS[p.defId].type}`,28,y+20)
    // HP bar
    const hpW=80,hpX=160,hpY=y+4
    ctx.fillStyle=C.dkGray;ctx.fillRect(hpX,hpY,hpW,6)
    const ratio=p.hp/p.maxHp
    ctx.fillStyle=ratio>0.5?C.green:ratio>0.2?C.orange:C.red
    ctx.fillRect(hpX,hpY,Math.floor(hpW*ratio),6)
    ctx.fillStyle=C.white;ctx.font='5px monospace'
    ctx.fillText(`${p.hp}/${p.maxHp}`,hpX,hpY+14)
    // Moves
    ctx.font='5px monospace';ctx.fillStyle=C.cyan
    const moveNames=p.moves.map(m=>MOVES[m.defId].name.slice(0,8)).join(' ')
    ctx.fillText(moveNames,hpX,y+20)
  }
  ctx.fillStyle=C.gray;ctx.font='6px monospace';ctx.textAlign='center'
  ctx.fillText('SPACE:heal  ESC:close',W/2,H-18)
}

// ─── Battle Renderer ────────────────────────────────────────

function renderBattle(){
  const b=g.battle;if(!b)return
  // Battle background
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H)
  // Ground
  ctx.fillStyle='#2d2d44';ctx.fillRect(0,140,W,100)
  ctx.fillStyle='#3d3d5c';ctx.fillRect(0,140,W,3)

  // Enemy platform
  ctx.fillStyle='#4a4a6a';ctx.fillRect(b.enemy.x-20,b.enemy.y+28,56,6)
  // Player platform
  ctx.fillStyle='#4a4a6a';ctx.fillRect(b.player.x-20,b.player.y+28,56,6)

  // Enemy sprite
  const eDef=PRINTERS[b.enemy.printer.defId]
  const eSprite=getSprite(eDef.sprite)
  ctx.save()
  if(b.enemy.shakeX>0.5)ctx.translate(Math.sin(Date.now()/30)*b.enemy.shakeX,0)
  if(b.enemy.flash>0&&Math.floor(Date.now()/100)%2===0){ctx.globalAlpha=0.5}
  // Scale 1.5x for battle
  ctx.drawImage(eSprite,Math.floor(b.enemy.x)+Math.floor(b.enemy.shakeX),
    Math.floor(b.enemy.y),32,32)
  ctx.restore()

  // Player sprite
  const pDef=PRINTERS[b.player.printer.defId]
  const pSprite=getSprite(pDef.sprite)
  ctx.save()
  if(b.player.shakeX>0.5)ctx.translate(Math.sin(Date.now()/30)*b.player.shakeX,0)
  if(b.player.flash>0&&Math.floor(Date.now()/100)%2===0){ctx.globalAlpha=0.5}
  ctx.drawImage(pSprite,Math.floor(b.player.x)+Math.floor(b.player.shakeX),
    Math.floor(b.player.y),32,32)
  ctx.restore()

  // Particles
  drawParticles(ctx)

  // Enemy HP bar
  const ehx=140,ehy=20
  ctx.fillStyle=C.white;font='bold 6px monospace';ctx.textAlign='left'
  ctx.fillText(`${b.enemy.printer.nickname} Lv${b.enemy.printer.level}`,ehx,ehy)
  ctx.fillStyle=C.dkGray;ctx.fillRect(ehx,ehy+3,100,5)
  const eHpRatio=b.enemy.printer.hp/b.enemy.printer.maxHp
  ctx.fillStyle=eHpRatio>0.5?C.green:eHpRatio>0.2?C.orange:C.red
  ctx.fillRect(ehx,ehy+3,Math.floor(100*eHpRatio),5)
  ctx.fillStyle=C.white;font='5px monospace'
  ctx.fillText(`${b.enemy.printer.hp}/${b.enemy.printer.maxHp}`,ehx+60,ehy+18)
  // Type badge
  ctx.fillStyle=typeColor(b.enemy.printer);ctx.fillRect(ehx+104,ehy+3,30,5)
  ctx.fillStyle=C.white;font='4px monospace';ctx.textAlign='center'
  ctx.fillText(b.enemy.printer.defId.toUpperCase().slice(0,3),ehx+119,ehy+8)

  // Player HP bar
  const phx=10,phy=100
  ctx.fillStyle=C.white;font='bold 6px monospace';ctx.textAlign='left'
  ctx.fillText(`${b.player.printer.nickname} Lv${b.player.printer.level}`,phx,phy)
  ctx.fillStyle=C.dkGray;ctx.fillRect(phx,phy+3,100,5)
  const pHpRatio=b.player.printer.hp/b.player.printer.maxHp
  ctx.fillStyle=pHpRatio>0.5?C.green:pHpRatio>0.2?C.orange:C.red
  ctx.fillRect(phx,phy+3,Math.floor(100*pHpRatio),5)
  ctx.fillStyle=C.white;font='5px monospace'
  ctx.fillText(`${b.player.printer.hp}/${b.player.printer.maxHp}`,phx+60,phy+18)
  ctx.fillStyle=typeColor(b.player.printer);ctx.fillRect(phx+104,phy+3,30,5)
  ctx.fillStyle=C.white;font='4px monospace';ctx.textAlign='center'
  ctx.fillText(b.player.printer.defId.toUpperCase().slice(0,3),phx+119,phy+8)

  // XP bar
  ctx.fillStyle=C.dkGray;ctx.fillRect(phx,phy+20,100,3)
  const xpRatio=b.player.printer.xp/b.player.printer.xpNext
  ctx.fillStyle=C.cyan;ctx.fillRect(phx,phy+20,Math.floor(100*xpRatio),3)

  // Text box
  drawTextBox(b.textLines)

  // Fight/Item menu
  if(b.phase==='playerTurn'){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(W-80,H-50,76,46)
    ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(W-80,H-50,76,46)
    ctx.fillStyle=C.white;font='bold 6px monospace';ctx.textAlign='left'
    const labels=['FIGHT','ITEMS','RUN']
    for(let i=0;i<3;i++){
      ctx.fillStyle=i===g.menuCursor?C.gold:C.white
      ctx.fillText(`${i===g.menuCursor?'>':' '}${labels[i]}`,W-74,H-36+i*14)
    }
  }

  // Move selection
  if(b.phase==='fightMenu'){
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,H-70,W,68)
    ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(0,H-70,W,68)
    ctx.font='bold 6px monospace';ctx.textAlign='left'
    ctx.fillStyle=C.gold;ctx.fillText('Choose a move:',8,H-56)
    const moves=b.player.printer.moves
    for(let i=0;i<moves.length;i++){
      const md=MOVES[moves[i].defId]
      const sel=i===b.selectedMove
      ctx.fillStyle=sel?C.gold:C.white
      const col=i<2?0:1;const row=i%2
      ctx.fillText(`${sel?'>':' '}${md.name}`,8+col*155,H-38+row*18)
      ctx.fillStyle=C.gray;font='5px monospace'
      ctx.fillText(`PP:${moves[i].pp}/${md.maxPp}`,8+col*155,H-30+row*18)
      // Type color indicator
      ctx.fillStyle=typeColorForType(md.type)
      ctx.fillRect(8+col*155+100,H-43+row*18,20,6)
    }
  }

  // Item menu
  if(b.phase==='itemMenu'){
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,H-70,W,68)
    ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(0,H-70,W,68)
    const healItems=Object.entries(g.inventory).filter(([k,v])=>v>0&&ITEMS[k]&&ITEMS[k].type==='heal')
    ctx.font='bold 6px monospace';ctx.textAlign='left'
    ctx.fillStyle=C.gold;ctx.fillText('Items:',8,H-56)
    for(let i=0;i<healItems.length;i++){
      const[key,count]=healItems[i];const item=ITEMS[key]
      ctx.fillStyle=i===g.shopCursor?C.gold:C.white
      ctx.fillText(`${i===g.shopCursor?'>':' '}${item.name} x${count}`,8,H-38+i*14)
    }
  }
}

function drawTextBox(lines:string[]){
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(4,H-52,W-8,48)
  ctx.strokeStyle=C.ltGray;ctx.lineWidth=1;ctx.strokeRect(4,H-52,W-8,48)
  ctx.fillStyle=C.white;font='6px monospace';ctx.textAlign='left'
  for(let i=0;i<Math.min(lines.length,3);i++){
    ctx.fillText(lines[i],12,H-38+i*14)
  }
  // Blinking arrow
  if(g.battle&&(g.battle.phase==='intro'||g.battle.phase==='text'||g.battle.phase==='fainted')){
    if(Math.floor(Date.now()/400)%2===0){
      ctx.fillStyle=C.white;ctx.fillRect(W-16,H-12,6,4)
      ctx.fillRect(W-14,H-8,4,4);ctx.fillRect(W-12,H-4,2,4)
    }
  }
}

function typeColor(p:Printer):string{
  const t=PRINTERS[p.defId].type
  return typeColorForType(t)
}
function typeColorForType(t:string):string{
  switch(t){case'offset':return C.orange;case'inkjet':return C.ltBlue;case'laser':return C.red;
    case'letterpress':return C.brown;case'thermo':return C.gold;case'screen':return C.purple;default:return C.gray}
}

// ─── Shop Renderer ───────────────────────────────────────────

function renderShop(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H)
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(20,15,W-40,H-30)
  ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.strokeRect(20,15,W-40,H-30)

  ctx.fillStyle=C.gold;font='bold 8px monospace';ctx.textAlign='center'
  ctx.fillText("SAL'S SUPPLY SHOP",W/2,32)
  ctx.fillStyle=C.white;font='6px monospace'
  ctx.fillText(`Your money: $${g.money}`,W/2,46)

  ctx.textAlign='left';ctx.font='6px monospace'
  for(let i=0;i<SHOP_ITEMS.length;i++){
    const item=ITEMS[SHOP_ITEMS[i]]
    const y=56+i*22
    if(y>H-40)break
    const sel=i===g.shopCursor
    ctx.fillStyle=sel?'rgba(255,215,0,0.15)':'transparent';ctx.fillRect(24,y,W-48,20)
    ctx.fillStyle=sel?C.gold:C.white
    ctx.fillText(`${sel?'>':' '}${item.name}`,28,y+10)
    ctx.fillStyle=C.ltGray;ctx.fillText(`$${item.price}`,160,y+10)
    ctx.fillStyle=C.gray;ctx.font='5px monospace'
    ctx.fillText(item.desc,28,y+18)
  }
  ctx.fillStyle=C.gray;ctx.font='6px monospace';ctx.textAlign='center'
  ctx.fillText('SPACE:buy  ESC:close',W/2,H-22)
}

// ─── Dialog Renderer ──────────────────────────────────────────

function renderDialog(){
  if(!g.dialog)return
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(4,H-52,W-8,48)
  ctx.strokeStyle=C.ltGray;ctx.lineWidth=1;ctx.strokeRect(4,H-52,W-8,48)
  ctx.fillStyle=C.white;font='6px monospace';ctx.textAlign='left'
  // Show current line (partially typed)
  const line=g.dialog.lines[g.dialog.idx]||''
  const visible=line.slice(0,g.dialog.charIdx)
  ctx.fillText(visible,12,H-38)
  // Blinking arrow when done typing
  if(g.dialog.charIdx>=line.length&&Math.floor(Date.now()/400)%2===0){
    ctx.fillStyle=C.white;ctx.fillRect(W-16,H-12,6,4)
    ctx.fillRect(W-14,H-8,4,4);ctx.fillRect(W-12,H-4,2,4)
  }
}

// ─── Title Screen ────────────────────────────────────────────

function renderTitle(){
  g.titleBlink+=1/FPS
  // BG
  ctx.fillStyle=C.navy;ctx.fillRect(0,0,W,H)
  // Grid
  ctx.fillStyle='#0F1F3A'
  for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16){
    if((x/16+y/16)%2===0)ctx.fillRect(x,y,16,16)
  }
  // Darken
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H)

  const yo=Math.sin(g.titleBlink*2)*2
  // Title shadow
  ctx.fillStyle=C.dkGreen;font='bold 18px monospace';ctx.textAlign='center'
  ctx.fillText('INK JOB',W/2+1,62+yo+1)
  ctx.font='bold 24px monospace';ctx.fillText("'99",W/2+1,90+yo+1)
  // Title
  ctx.fillStyle=C.green;font='bold 18px monospace';ctx.fillText('INK JOB',W/2,62+yo)
  ctx.fillStyle=C.gold;font='bold 24px monospace';ctx.fillText("'99",W/2,90+yo)
  // Subtitle
  ctx.fillStyle=C.ltGray;font='bold 7px monospace'
  ctx.fillText('POKEMON-STYLE RPG EDITION',W/2,110)

  // Printer parade
  const printerKeys=['inkjet','offset','laser','letterpress','thermo','screen']
  for(let i=0;i<printerKeys.length;i++){
    const bx=30+i*48,by=125+Math.sin(g.titleBlink*3+i)*4
    ctx.globalAlpha=0.7;ctx.drawImage(getSprite(printerKeys[i]),bx,by,24,24);ctx.globalAlpha=1
  }

  // Blink start
  if(Math.floor(g.titleBlink*2.5)%2===0){
    ctx.fillStyle=C.white;font='bold 7px monospace'
    ctx.fillText('PRESS ENTER OR TAP TO START',W/2,172)
  }

  // Controls
  ctx.fillStyle=C.gray;font='5px monospace'
  ctx.fillText('ARROWS:MOVE  SPACE:TALK  ESC:MENU',W/2,195)

  // High score
  ctx.fillStyle=C.gold;font='6px monospace'
  ctx.fillText(`BATTLES WON: ${g.battlesWon}`,W/2,210)

  ctx.fillStyle=C.gray;font='5px monospace'
  ctx.fillText('BY SUPERDUPERZED',W/2,228)
}

// ─── Game Over ──────────────────────────────────────────────

function renderGameOver(){
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,W,H)
  ctx.fillStyle=C.red;font='bold 14px monospace';ctx.textAlign='center'
  ctx.fillText('GAME OVER',W/2,70)
  ctx.fillStyle=C.white;font='7px monospace'
  ctx.fillText(`Printers fainted...`,W/2,100)
  ctx.fillText(`Battles won: ${g.battlesWon}`,W/2,120)
  if(Math.floor(g.titleBlink*2.5)%2===0){
    ctx.fillStyle=C.white;font='bold 6px monospace'
    ctx.fillText('PRESS ENTER TO CONTINUE',W/2,160)
  }
}

// ─── Main Loop ───────────────────────────────────────────────

let g:GameData
let lastTime=0

function init(){
  canvas=document.getElementById('game')as HTMLCanvasElement
  canvas.width=W;canvas.height=H
  ctx=canvas.getContext('2d')!
  // Pre-cache sprites
  const allSprites=['player_down','player_up','player_left','player_right',
    'inkjet','offset','laser','letterpress','thermo','screen','diehard','goldpress',
    'star','sparkle']
  for(const s of allSprites)getSprite(s)
  // Load save
  const saved=localStorage.getItem('inkjob99_save')
  if(saved){
    try{
      const d=JSON.parse(saved)
      g=newGame();g.screen='overworld'
      Object.assign(g,{px:d.px,py:d.py,pdir:d.pdir,money:d.money,
        party:d.party,inventory:d.inventory,npcDefeated:d.npcDefeated||{},
        fedBossDefeated:d.fedBossDefeated||false,battlesWon:d.battlesWon||0,
        printersCaught:d.printersCaught||0})
      startBGM()
    }catch{g=newGame()}
  }else{g=newGame()}
  setupTouch(canvas);lastTime=performance.now();requestAnimationFrame(loop)
}

function loop(time:number){
  const dt=Math.min((time-lastTime)/1000,1/20);lastTime=time
  g.titleBlink+=dt

  switch(g.screen){
    case 'title':
      if(actionPressed()){sfx('start');g=newGame();g.screen='overworld';startBGM()}
      break
    case 'overworld':updateOverworld(dt);break
    case 'dialog':updateDialog();break
    case 'battle':updateBattle(dt);break
    case 'shop':updateShop(dt);break
    case 'menu':break// handled inside updateOverworld
    case 'party':updateParty(dt);break
    case 'gameOver':
      if(actionPressed()){g=newGame();g.screen='title'}
      break
  }

  render()
  requestAnimationFrame(loop)
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init)
else init()
