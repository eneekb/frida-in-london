// Solveur d'atteignabilité — simule la VRAIE physique du jeu et fait un BFS
// sur les "plateformes" du niveau. Pour chaque pickup/F/?, vérifie qu'on peut
// l'atteindre depuis le spawn.

const TILE = 32;

// Physics constants - MUST match the game (slow & floaty profile)
const GRAVITY = 0.30;
const MOVE_ACCEL = 0.10;
const AIR_ACCEL = 0.05;
const MOVE_MAX = 2.0;
const FRICTION_GROUND = 0.85;
const FRICTION_AIR = 0.97;
const TURN_AROUND_MULT = 2.0;
const JUMP_V = -6.0;
const JUMP_CUT = 0.30;
const GRAVITY_UP_MULT = 0.46;
const GRAVITY_DOWN_MULT = 1.50;
const COYOTE_FRAMES = 7;
const JUMP_BUFFER_FRAMES = 8;
const MAX_FALL = 13.5;
const HANGTIME_THRESHOLD = 3.0;
const HANGTIME_FACTOR = 0.25;

const BBX = 3;
const PLAYER_W = 22;
const PLAYER_H = 30;
const BB_W = PLAYER_W - 2*BBX;  // 16

const SOLIDS = new Set(['#','=','|','-','?','T','B']);
const HAZARDS = new Set(['^','G','~']);

function tileAt(level, tx, ty) {
  if (ty < 0 || ty >= level.h || tx < 0 || tx >= level.w) return '.';
  return level.grid[ty][tx];
}
function isSolid(c) { return SOLIDS.has(c); }
function isHaz(c) { return HAZARDS.has(c); }

// Physics step - copies the game's moveAndCollide exactly
function moveAndCollide(ent, level) {
  ent.x += ent.vx;
  let bbX = ent.x + BBX;
  let bbW = BB_W;
  let bbY = ent.y;
  let bbH = PLAYER_H;
  if (ent.vx > 0) {
    const tx = Math.floor((bbX + bbW) / TILE);
    const y1 = Math.floor(bbY / TILE);
    const y2 = Math.floor((bbY + bbH - 1) / TILE);
    for (let ty = y1; ty <= y2; ty++) {
      if (isSolid(tileAt(level, tx, ty))) {
        ent.x = tx*TILE - bbW - BBX;
        ent.vx = 0; break;
      }
    }
  } else if (ent.vx < 0) {
    const tx = Math.floor(bbX / TILE);
    const y1 = Math.floor(bbY / TILE);
    const y2 = Math.floor((bbY + bbH - 1) / TILE);
    for (let ty = y1; ty <= y2; ty++) {
      if (isSolid(tileAt(level, tx, ty))) {
        ent.x = (tx+1)*TILE - BBX;
        ent.vx = 0; break;
      }
    }
  }
  ent.y += ent.vy;
  ent.onGround = false;
  bbX = ent.x + BBX; bbY = ent.y;
  if (ent.vy > 0) {
    const ty = Math.floor((bbY + bbH) / TILE);
    const x1 = Math.floor(bbX / TILE);
    const x2 = Math.floor((bbX + bbW - 1) / TILE);
    for (let tx = x1; tx <= x2; tx++) {
      if (isSolid(tileAt(level, tx, ty))) {
        ent.y = ty*TILE - bbH;
        ent.vy = 0; ent.onGround = true; break;
      }
    }
  } else if (ent.vy < 0) {
    const ty = Math.floor(bbY / TILE);
    const x1 = Math.floor(bbX / TILE);
    const x2 = Math.floor((bbX + bbW - 1) / TILE);
    for (let tx = x1; tx <= x2; tx++) {
      const c = tileAt(level, tx, ty);
      if (isSolid(c)) {
        ent.y = (ty+1)*TILE;
        ent.vy = 0; break;
      }
    }
  }
}

function checkHazardHit(ent, level) {
  const bbX = ent.x + BBX, bbY = ent.y;
  const x1 = Math.floor(bbX / TILE);
  const x2 = Math.floor((bbX + BB_W - 1) / TILE);
  const y1 = Math.floor(bbY / TILE);
  const y2 = Math.floor((bbY + PLAYER_H - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++) {
    for (let tx = x1; tx <= x2; tx++) {
      if (isHaz(tileAt(level, tx, ty))) return true;
    }
  }
  return false;
}

function tilesOverlapped(ent) {
  const bbX = ent.x + BBX, bbY = ent.y;
  const out = [];
  const x1 = Math.floor(bbX / TILE);
  const x2 = Math.floor((bbX + BB_W - 1) / TILE);
  const y1 = Math.floor(bbY / TILE);
  const y2 = Math.floor((bbY + PLAYER_H - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++) {
    for (let tx = x1; tx <= x2; tx++) {
      out.push([tx, ty]);
    }
  }
  return out;
}

// Simulate a single run from (x, y) with starting velocity vx0,
// constant input dxInput (-1/0/1), and (optionally) a jump held for jumpHoldFrames.
// Returns the trajectory: where it landed, tiles visited, and whether it died.
function simulate(level, x0, y0, vx0, dxInput, jump, jumpHoldFrames, maxFrames = 220) {
  const ent = { x: x0, y: y0, vx: vx0, vy: 0,
                onGround: true, jumpHeld: false,
                coyote: COYOTE_FRAMES, jumpBuffer: 0 };
  if (jump) ent.jumpBuffer = JUMP_BUFFER_FRAMES;

  const visited = new Set();
  const collectedAt = new Map(); // tile -> first frame visited
  let died = false;
  let leftGround = false;

  for (let f = 0; f < maxFrames; f++) {
    // input
    const left = dxInput < 0, right = dxInput > 0;
    const accel = ent.onGround ? MOVE_ACCEL : AIR_ACCEL;
    const fric  = ent.onGround ? FRICTION_GROUND : FRICTION_AIR;
    if (left && !right) {
      if (ent.vx > 0) ent.vx -= accel * TURN_AROUND_MULT; else ent.vx -= accel;
    } else if (right && !left) {
      if (ent.vx < 0) ent.vx += accel * TURN_AROUND_MULT; else ent.vx += accel;
    } else {
      ent.vx *= fric;
      if (Math.abs(ent.vx) < 0.12) ent.vx = 0;
    }
    ent.vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, ent.vx));

    if (ent.onGround) ent.coyote = COYOTE_FRAMES;
    else if (ent.coyote > 0) ent.coyote--;
    if (ent.jumpBuffer > 0) ent.jumpBuffer--;

    if (ent.jumpBuffer > 0 && (ent.onGround || ent.coyote > 0)) {
      ent.vy = JUMP_V;
      ent.onGround = false;
      ent.coyote = 0;
      ent.jumpBuffer = 0;
      ent.jumpHeld = true;
    }
    const stillHold = jump && f < jumpHoldFrames;
    if (!stillHold && ent.vy < 0 && ent.jumpHeld) {
      ent.vy *= JUMP_CUT;
      ent.jumpHeld = false;
    }
    // Gravity with hangtime (matches game)
    let g;
    if (Math.abs(ent.vy) < HANGTIME_THRESHOLD && !ent.onGround) g = GRAVITY * HANGTIME_FACTOR;
    else if (ent.vy < 0 && ent.jumpHeld) g = GRAVITY * GRAVITY_UP_MULT;
    else if (ent.vy > 0) g = GRAVITY * GRAVITY_DOWN_MULT;
    else g = GRAVITY;
    ent.vy += g;
    if (ent.vy > MAX_FALL) ent.vy = MAX_FALL;

    moveAndCollide(ent, level);
    if (!ent.onGround) leftGround = true;

    for (const [tx, ty] of tilesOverlapped(ent)) {
      const k = `${tx},${ty}`;
      visited.add(k);
      if (!collectedAt.has(k)) collectedAt.set(k, f);
    }
    if (checkHazardHit(ent, level)) { died = true; break; }
    if (ent.y > level.h * TILE + 100) { died = true; break; }
    // Stop when we land on solid ground after a jump
    if (ent.onGround && leftGround && f > 4) break;
  }

  return {
    endX: ent.x, endY: ent.y,
    onGround: ent.onGround,
    visited, collectedAt,
    died, leftGround
  };
}

// Find platforms: empty tiles whose tile below is solid
function findPlatforms(level) {
  const out = [];
  for (let y = 0; y < level.h; y++) {
    for (let x = 0; x < level.w; x++) {
      const c = level.grid[y][x];
      if (isSolid(c)) continue;
      if (isHaz(c)) continue;
      const below = tileAt(level, x, y+1);
      if (isSolid(below)) out.push([x, y]);
    }
  }
  return out;
}

// Snap a pixel position to the nearest platform tile (x_tile, y_tile)
function platformKey(x, y) {
  const tx = Math.round(x / TILE);
  const ty = Math.round(y / TILE);
  return `${tx},${ty}`;
}

// For a given platform tile (tx, ty), the player's top-left x is at tx*TILE - BBX
// Wait - player occupies the empty tile above the solid. If platform is at (tx, ty), solid at (tx, ty+1).
// Player y so that bottom = (ty+1)*TILE means y = (ty+1)*TILE - PLAYER_H = ty*TILE + TILE - 30 = ty*TILE + 2.
// Player x for tile tx: we want bbX = tx*TILE so x = tx*TILE - BBX = tx*TILE - 3.
function platformToPos(tx, ty) {
  return { x: tx*TILE - BBX, y: ty*TILE + TILE - PLAYER_H };
}

// Compute reachability: starting from spawn, BFS through platforms and collect visited tiles
function reachability(level) {
  const platforms = findPlatforms(level);
  const platSet = new Set(platforms.map(([x,y]) => `${x},${y}`));

  // Determine starting platform: spawn at (level.start.x, level.start.y) — find first platform below
  let sx = level.start.x, sy = level.start.y;
  // walk down until we find a tile whose below is solid
  while (sy < level.h - 1 && !isSolid(tileAt(level, sx, sy+1))) sy++;
  // Sometimes the spawn is in the air and falls. We use the platform below.
  const startKey = `${sx},${sy}`;

  const reached = new Set([startKey]);
  const reachedTiles = new Set(); // all tiles overlapped during any simulated run
  reachedTiles.add(startKey);
  const queue = [[sx, sy]];

  // Inputs to try from each platform - cover a wide range
  const vx0s = [-MOVE_MAX, -MOVE_MAX*0.66, -MOVE_MAX*0.33, 0, MOVE_MAX*0.33, MOVE_MAX*0.66, MOVE_MAX];
  const inputs = [-1, 0, 1];
  const jumpHolds = [0, 6, 12, 20, 30, 42, 60]; // 0 = no jump; cover full hold range

  while (queue.length) {
    const [tx, ty] = queue.shift();
    const { x, y } = platformToPos(tx, ty);

    for (const vx0 of vx0s) {
      for (const inp of inputs) {
        for (const jh of jumpHolds) {
          const jump = jh > 0;
          const res = simulate(level, x, y, vx0, inp, jump, jh, 90);
          // Merge tiles visited
          for (const t of res.visited) reachedTiles.add(t);
          if (res.died) continue;
          // Any platform tile visited during the trajectory becomes a new starting platform.
          // This is robust to landing snapping issues.
          for (const t of res.visited) {
            if (platSet.has(t) && !reached.has(t)) {
              reached.add(t);
              const [px, py] = t.split(',').map(Number);
              queue.push([px, py]);
            }
          }
          if (res.onGround) {
            const lx = Math.round((res.endX + BBX) / TILE);
            const ly = Math.round((res.endY + PLAYER_H) / TILE) - 1;
            const k = `${lx},${ly}`;
            if (platSet.has(k) && !reached.has(k)) {
              reached.add(k);
              queue.push([lx, ly]);
            }
          }
        }
      }
    }
  }

  return { reached, reachedTiles, platforms };
}

function analyzeLevel(level) {
  const { reachedTiles } = reachability(level);
  // Find every object: o, ?, S, F
  const objects = { coins: [], scones: [], qBlocks: [], flags: [] };
  for (let y = 0; y < level.h; y++) {
    for (let x = 0; x < level.w; x++) {
      const c = level.grid[y][x];
      if (c === 'o') objects.coins.push([x, y]);
      else if (c === 'S') objects.scones.push([x, y]);
      else if (c === '?') objects.qBlocks.push([x, y]);
      else if (c === 'F') objects.flags.push([x, y]);
    }
  }
  const check = (list) => list.map(([x,y]) => {
    const reach = reachedTiles.has(`${x},${y}`);
    // For qBlocks: player hits from below, so the tile below must be reached
    return { x, y, reach };
  });
  return {
    coins:   check(objects.coins),
    scones:  check(objects.scones),
    qBlocks: objects.qBlocks.map(([x,y]) => ({ x, y, reach: reachedTiles.has(`${x},${y+1}`) })),
    flags:   check(objects.flags),
    reachedTilesSet: reachedTiles,
  };
}

function parseLevel(raw) {
  const rows = raw.map.map(r => r.split(''));
  const w = Math.max(...rows.map(r => r.length));
  rows.forEach(r => { while (r.length < w) r.push('.'); });
  return { ...raw, grid: rows, w, h: rows.length };
}

module.exports = { parseLevel, analyzeLevel, reachability, simulate, findPlatforms,
                   isSolid, isHaz, tileAt, TILE, platformToPos };
onst rows = raw.map.map(r => r.split(''));
  const w = Math.max(...rows.map(r => r.length));
  rows.forEach(r => { while (r.length < w) r.push('.'); });
  return { ...raw, grid: rows, w, h: rows.length };
}

module.exports = { parseLevel, analyzeLevel, reachability, simulate, findPlatforms,
                   isSolid, isHaz, tileAt, TILE, platformToPos };
 = Math.max(...rows.map(r => r.length));
  rows.forEach(r => { while (r.length < w) r.push('.'); });
  return { ...raw, grid: rows, w, h: rows.length };
}

module.exports = { parseLevel, analyzeLevel, reachability, simulate, findPlatforms,
                   isSolid, isHaz, tileAt, TILE, platformToPos };
 { ...raw, grid: rows, w, h: rows.length };
}

module.exports = { parseLevel, analyzeLevel, reachability, simulate, findPlatforms, isSolid, isHaz, tileAt, TILE, platformToPos };
 platformToPos };
