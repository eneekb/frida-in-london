"use strict";
// Constantes physiques + helpers de collision

// Physics - tuned via interactive lab. "Slow & floaty" profile.
const GRAVITY = 0.30;
const MOVE_ACCEL = 0.10;
const AIR_ACCEL = 0.05;
const MOVE_MAX_BASE = 2.0;
const MOVE_MAX_SPRINT = 3.5;       // sprint power-up scales accordingly
const FRICTION_GROUND = 0.85;
const FRICTION_AIR = 0.97;
const TURN_AROUND_MULT = 2.0;      // multiplier on accel when reversing direction
const JUMP_V = -6.0;
const JUMP_CUT = 0.30;
const GRAVITY_UP_MULT = 0.46;      // gravity multiplier while ascending (jump held)
const GRAVITY_DOWN_MULT = 1.50;    // gravity multiplier while falling
const HANGTIME_THRESHOLD = 3.0;
const HANGTIME_FACTOR = 0.25;
const COYOTE_FRAMES = 7;
const JUMP_BUFFER_FRAMES = 8;
const MAX_FALL = 13.5;
// Power-up tuning
const DOUBLE_JUMP_V = -5.5;
// Optional movement: wall, dash, corner correction
const WALL_SLIDE_SPEED = 0.80;
const WALL_JUMP_VY = -6.0;
const WALL_JUMP_VX = 2.0;          // push away from wall horizontally
const DASH_SPEED = 5.0;
const DASH_DUR = 20;
const DASH_CD = 120;
const CORNER_CORRECT_PX = 8;       // max pixel forgiveness for head-bumps
// Theoretical max jump: ~135 px vertical (4.2 tiles), ~210 px horizontal (6.5 tiles)
// Practical (with accel ramp): ~3.8 tiles up, ~5 tiles across — used by the level solver.


//  COLLISION HELPERS
// ----------------------------------------------------------------------------
const SOLIDS = new Set(['#','=','|','-','?','T','B']);
const HAZARDS = new Set(['^','G','~']);

function tileAt(level, tx, ty) {
  if (ty < 0 || ty >= level.h || tx < 0 || tx >= level.w) return '.';
  return level.grid[ty][tx];
}
function isSolid(c) { return SOLIDS.has(c); }
function isHazard(c) { return HAZARDS.has(c); }

// BB offset (constant): bb.x = ent.x + BBX, bb.w = ent.w - 2*BBX
const BBX = 3;

function entBB(ent) {
  return {
    x: ent.x + BBX,
    y: ent.y,
    w: ent.w - 2*BBX,
    h: ent.h,
  };
}

// Check if there's a solid wall immediately to the side of the player (dir = +1 right, -1 left)
function checkWallSide(p, dir, level) {
  const bbx = p.x + BBX, bbw = p.w - 2*BBX;
  const tx = dir > 0 ? Math.floor((bbx + bbw + 1) / TILE) : Math.floor((bbx - 1) / TILE);
  const y1 = Math.floor(p.y / TILE);
  const y2 = Math.floor((p.y + p.h - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++) {
    if (isSolid(tileAt(level, tx, ty))) return true;
  }
  return false;
}

function moveAndCollide(ent, level) {
  // ---- X axis ----
  ent.x += ent.vx;
  let bbX = ent.x + BBX;
  let bbW = ent.w - 2*BBX;
  let bbY = ent.y;
  let bbH = ent.h;
  if (ent.vx > 0) {
    const tx = Math.floor((bbX + bbW) / TILE);
    const y1 = Math.floor(bbY / TILE);
    const y2 = Math.floor((bbY + bbH - 1) / TILE);
    for (let ty = y1; ty <= y2; ty++) {
      if (isSolid(tileAt(level, tx, ty))) {
        // snap so that bbX + bbW = tx*TILE
        ent.x = tx*TILE - bbW - BBX;
        ent.vx = 0;
        ent.bumpedRight = true;
        break;
      }
    }
  } else if (ent.vx < 0) {
    const tx = Math.floor(bbX / TILE);
    const y1 = Math.floor(bbY / TILE);
    const y2 = Math.floor((bbY + bbH - 1) / TILE);
    for (let ty = y1; ty <= y2; ty++) {
      if (isSolid(tileAt(level, tx, ty))) {
        // snap so that bbX = (tx+1)*TILE
        ent.x = (tx+1)*TILE - BBX;
        ent.vx = 0;
        ent.bumpedLeft = true;
        break;
      }
    }
  }

  // ---- Y axis ----
  ent.y += ent.vy;
  ent.onGround = false;
  bbX = ent.x + BBX;
  bbW = ent.w - 2*BBX;
  bbY = ent.y;
  bbH = ent.h;
  if (ent.vy > 0) {
    const ty = Math.floor((bbY + bbH) / TILE);
    const x1 = Math.floor(bbX / TILE);
    const x2 = Math.floor((bbX + bbW - 1) / TILE);
    for (let tx = x1; tx <= x2; tx++) {
      if (isSolid(tileAt(level, tx, ty))) {
        ent.y = ty*TILE - bbH;
        ent.vy = 0;
        ent.onGround = true;
        break;
      }
    }
  } else if (ent.vy < 0) {
    const ty = Math.floor(bbY / TILE);
    const x1 = Math.floor(bbX / TILE);
    const x2 = Math.floor((bbX + bbW - 1) / TILE);
    // CORNER CORRECTION : when only one of the two head tiles is solid AND we're close
    // to its edge, nudge horizontally so the player slides past instead of bonking.
    if (ent === game.player && x1 !== x2) {
      const leftSolid = isSolid(tileAt(level, x1, ty));
      const rightSolid = isSolid(tileAt(level, x2, ty));
      if (leftSolid && !rightSolid) {
        const overlap = (x1+1)*TILE - bbX;       // how much of player is in left tile
        if (overlap <= CORNER_CORRECT_PX) {
          ent.x += overlap;                       // nudge right to clear the corner
          ent.y -= ent.vy;                        // undo y step, let next frame re-process
          ent.vy *= 0.5;
          return;
        }
      } else if (!leftSolid && rightSolid) {
        const overlap = (bbX + bbW) - x2*TILE;
        if (overlap <= CORNER_CORRECT_PX) {
          ent.x -= overlap;
          ent.y -= ent.vy;
          ent.vy *= 0.5;
          return;
        }
      }
    }
    for (let tx = x1; tx <= x2; tx++) {
      const c = tileAt(level, tx, ty);
      if (isSolid(c)) {
        ent.y = (ty+1)*TILE;
        ent.vy = 0;
        if (c === '?' && ent === game.player) {
          level.grid[ty][tx] = '=';
          spawnCoinBurst((tx+0.5)*TILE, ty*TILE);
          game.score += 50;
          SFX.coin();
        }
        break;
      }
    }
  }
}

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Hazards: check if entity overlaps a hazard tile
function checkHazards(ent, level) {
  const bb = entBB(ent);
  const x1 = Math.floor(bb.x / TILE);
  const x2 = Math.floor((bb.x + bb.w - 1) / TILE);
  const y1 = Math.floor(bb.y / TILE);
  const y2 = Math.floor((bb.y + bb.h - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++) {
    for (let tx = x1; tx <= x2; tx++) {
      if (isHazard(tileAt(level, tx, ty))) return true;
    }
  }
  return false;
}


