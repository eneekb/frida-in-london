"use strict";
// Frida : création, update, mort, sprite

function makePlayer(spawn) {
  return {
    x: spawn.x * TILE,
    y: spawn.y * TILE,
    w: 22, h: 30,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    walkPhase: 0,
    jumpHeld: false,
    coyote: 0,
    jumpBuffer: 0,
    invuln: 0,
    hurtFlash: 0,
    deadTimer: 0,
    dead: false,
    won: false,
    // Power-up state (timers in frames; 0 = inactive)
    powerDoubleJump: 0,
    doubleJumpUsed: false,
    // Wall + dash mobility (always on)
    wallSliding: false,
    wallSide: 0,        // -1 if wall is on left, +1 if on right
    dashCD: 0,
    dashing: 0,
    dashedInAir: false,
    dashSign: 1,
    powerSprint: 0,
    powerInvinc: 0,
    powerFireball: 0,
    fireballCD: 0,
    powerFly: 0,
    powerMagnet: 0,
    powerSlowmo: 0,
    powerScoreBoost: 0,
    powerGroundpound: 0,
    powerBrush: 0,
    brushPlatesLeft: 0,
    hairFlow: 0,
  };
}

function updatePlayer() {
  const p = game.player;
  if (p.won) {
    // walk-off animation
    p.vx = 1.5;
    p.vy += GRAVITY;
    moveAndCollide(p, game.level);
    p.walkPhase += 0.3;
    return;
  }
  if (p.dead) {
    p.deadTimer++;
    p.y += p.vy;
    p.vy += 0.5;
    return;
  }

  // ----- Power-up timers -----
  if (p.powerDoubleJump > 0) p.powerDoubleJump--;
  if (p.powerSprint > 0)     p.powerSprint--;
  if (p.powerInvinc > 0)     p.powerInvinc--;
  if (p.powerFireball > 0)   p.powerFireball--;
  if (p.powerFly > 0)        p.powerFly--;
  if (p.powerMagnet > 0)     p.powerMagnet--;
  if (p.powerSlowmo > 0)     p.powerSlowmo--;
  if (p.powerScoreBoost > 0) p.powerScoreBoost--;
  if (p.powerGroundpound > 0) p.powerGroundpound--;
  if (p.powerBrush > 0)      p.powerBrush--;
  if (p.fireballCD > 0)      p.fireballCD--;
  p.hairFlow += 0.15;

  // ----- FIREBALL: press F to shoot -----
  if (p.powerFireball > 0 && p.fireballCD <= 0 && consume('KeyF')) {
    game.projectiles = game.projectiles || [];
    game.projectiles.push({
      x: p.x + p.w/2, y: p.y + 6,
      vx: 7 * p.facing, vy: -1.5,
      life: 90, kind: 'fire',
    });
    p.fireballCD = 24;
    SFX.jump();
  }

  // ----- BRUSH PLATFORM: press F to paint -----
  if (p.powerBrush > 0 && p.brushPlatesLeft > 0 && consume('KeyF')) {
    const tx = Math.floor((p.x + p.w/2) / TILE);
    const ty = Math.floor((p.y + p.h + 6) / TILE);
    if (ty >= 0 && ty < game.level.h) {
      // Paint a 3-wide platform
      for (let dx = -1; dx <= 1; dx++) {
        const cx = tx + dx;
        if (cx >= 0 && cx < game.level.w && game.level.grid[ty][cx] === '.') {
          game.level.grid[ty][cx] = '=';
        }
      }
      p.brushPlatesLeft--;
      SFX.coin();
      pushNotif({ iconKind:'brush', title:'PLATEFORME PEINTE', desc:`Encore ${p.brushPlatesLeft} plateforme(s) à peindre`, color:'#dd2244' });
    }
  }

  // ----- MAGNET: attract tea pickups in radius -----
  if (p.powerMagnet > 0) {
    const cx = p.x + p.w/2, cy = p.y + p.h/2;
    for (const k of game.pickups) {
      if (k.taken || k.kind !== 'tea') continue;
      const dx = cx - (k.x + k.w/2), dy = cy - (k.y + k.h/2);
      const d = Math.hypot(dx, dy);
      if (d < 120 && d > 0) {
        k.x += (dx / d) * 4;
        k.y += (dy / d) * 4;
      }
    }
  }

  // ----- GROUNDPOUND: press DOWN in air to slam -----
  if (p.powerGroundpound > 0 && !p.onGround && p.vy > -2) {
    if (pressing('ArrowDown','KeyS')) {
      p.vy = 18;
      p.groundPounding = true;
    }
  }
  // Detect landing impact
  if (p.groundPounding && p.onGround) {
    // Kill enemies in radius
    const cx = p.x + p.w/2, cy = p.y + p.h/2;
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const dx = (e.x+e.w/2) - cx, dy = (e.y+e.h/2) - cy;
      if (Math.hypot(dx, dy) < 80) {
        if (!e.isBoss) { e.alive = false; game.score += 100; spawnPuff(e.x+e.w/2, e.y+e.h/2, '#666666'); }
        else { e.hp--; if (e.hp <= 0) { e.alive = false; game.bossKilled = true; game.score += 1000; SFX.win(); spawnPetals(e.x+e.w/2, e.y+e.h/2); }
               else spawnPuff(e.x+e.w/2, e.y, '#ffd6e0'); }
      }
    }
    game.shake = 12;
    SFX.stomp();
    for (let i=0; i<14; i++) {
      game.particles.push({ x: cx, y: p.y+p.h, vx:(Math.random()-0.5)*7, vy:-Math.random()*3-1, g:0.15, life:30, color:'#888888', size:3+Math.random()*3 });
    }
    p.groundPounding = false;
  }

  // ----- DASH (Shift) -----
  if (p.dashCD > 0) p.dashCD--;
  if (p.onGround) p.dashedInAir = false;
  if (p.dashing > 0) p.dashing--;
  if (p.dashing <= 0 && (consume('ShiftLeft') || consume('ShiftRight')) && p.dashCD <= 0 && !p.dashedInAir) {
    const dir = pressing('ArrowRight','KeyD') ? 1 : (pressing('ArrowLeft','KeyA','KeyQ') ? -1 : p.facing);
    p.dashing = DASH_DUR;
    p.dashSign = dir;
    p.dashCD = DASH_CD;
    if (!p.onGround) p.dashedInAir = true;
    spawnPuff(p.x+p.w/2, p.y+p.h/2, '#fff4d6');
    SFX.jump();
  }

  // ----- WALL SLIDE detection -----
  p.wallSliding = false;
  if (!p.onGround && p.vy > -1 && p.dashing <= 0) {
    const rightHeld = pressing('ArrowRight','KeyD');
    const leftHeld = pressing('ArrowLeft','KeyA','KeyQ');
    if (rightHeld && checkWallSide(p, 1, game.level)) { p.wallSliding = true; p.wallSide = 1; }
    else if (leftHeld && checkWallSide(p, -1, game.level)) { p.wallSliding = true; p.wallSide = -1; }
  }

  // ----- Horizontal input (progressive acceleration) -----
  const left  = pressing('ArrowLeft','KeyA','KeyQ');
  const right = pressing('ArrowRight','KeyD');
  const moveMax = (p.powerSprint > 0) ? MOVE_MAX_SPRINT : MOVE_MAX_BASE;
  const accel = p.onGround ? MOVE_ACCEL : AIR_ACCEL;
  const fric  = p.onGround ? FRICTION_GROUND : FRICTION_AIR;

  if (left && !right) {
    if (p.vx > 0) p.vx -= accel * TURN_AROUND_MULT;
    else          p.vx -= accel;
    p.facing = -1;
  } else if (right && !left) {
    if (p.vx < 0) p.vx += accel * TURN_AROUND_MULT;
    else          p.vx += accel;
    p.facing = 1;
  } else {
    p.vx *= fric;
    if (Math.abs(p.vx) < 0.12) p.vx = 0;
  }
  p.vx = Math.max(-moveMax, Math.min(moveMax, p.vx));

  // ----- Coyote time -----
  if (p.onGround) {
    p.coyote = COYOTE_FRAMES;
    p.doubleJumpUsed = false;       // landing resets double jump
  } else if (p.coyote > 0) p.coyote--;

  // ----- Jump buffer -----
  if (consume('Space') || consume('ArrowUp') || consume('KeyW') || consume('KeyZ')) {
    p.jumpBuffer = JUMP_BUFFER_FRAMES;
  }
  if (p.jumpBuffer > 0) p.jumpBuffer--;

  // ----- Fire ground/coyote jump -----
  if (p.jumpBuffer > 0 && (p.onGround || p.coyote > 0)) {
    p.vy = JUMP_V;
    p.onGround = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.jumpHeld = true;
    SFX.jump();
    spawnPuff(p.x+p.w/2, p.y+p.h, '#dddddd');
  }
  // ----- WALL JUMP (when sliding) -----
  else if (p.jumpBuffer > 0 && p.wallSliding) {
    p.vy = WALL_JUMP_VY;
    p.vx = -p.wallSide * WALL_JUMP_VX;
    p.facing = -p.wallSide;
    p.jumpBuffer = 0;
    p.jumpHeld = true;
    p.wallSliding = false;
    SFX.jump();
    spawnPuff(p.x+p.w/2 + p.wallSide*8, p.y+p.h/2, '#88ccff');
  }
  // ----- Double jump (only with Ruban Rouge power-up active) -----
  else if (p.jumpBuffer > 0 && p.powerDoubleJump > 0 && !p.doubleJumpUsed && !p.onGround && p.coyote === 0) {
    p.vy = DOUBLE_JUMP_V;
    p.jumpBuffer = 0;
    p.jumpHeld = true;
    p.doubleJumpUsed = true;
    SFX.jump();
    // red ribbon swirl
    for (let i = 0; i < 10; i++) {
      game.particles.push({
        x: p.x+p.w/2, y: p.y+p.h,
        vx: Math.cos(i*Math.PI*2/10)*3, vy: Math.sin(i*Math.PI*2/10)*3 - 1,
        g: 0.05, life: 30, color: '#e94f64', size: 3,
      });
    }
  }

  // ----- Variable jump cut -----
  const jumpPress = pressing('Space','ArrowUp','KeyW','KeyZ');
  if (!jumpPress && p.vy < 0 && p.jumpHeld) {
    p.vy *= JUMP_CUT;
    p.jumpHeld = false;
  }

  // ----- Gravity with HANGTIME at apex, plus FLY override -----
  const jumpPressNow = pressing('Space','ArrowUp','KeyW','KeyZ');
  let gravThisFrame = GRAVITY;
  if (p.powerFly > 0 && !p.onGround && jumpPressNow) {
    gravThisFrame = GRAVITY * 0.12;            // GLIDE
    if (p.vy > 1.2) p.vy = 1.2;                // cap descent while gliding
  } else if (Math.abs(p.vy) < HANGTIME_THRESHOLD && !p.onGround) {
    gravThisFrame = GRAVITY * HANGTIME_FACTOR;
  } else if (p.vy < 0 && p.jumpHeld) {
    gravThisFrame = GRAVITY * GRAVITY_UP_MULT;
  } else if (p.vy > 0) {
    gravThisFrame = GRAVITY * GRAVITY_DOWN_MULT;
  }
  p.vy += gravThisFrame;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;

  // Wall slide caps fall speed
  if (p.wallSliding && p.vy > WALL_SLIDE_SPEED) p.vy = WALL_SLIDE_SPEED;

  // Dash overrides velocity (constant horizontal, no fall)
  if (p.dashing > 0) {
    p.vx = p.dashSign * DASH_SPEED;
    p.vy = 0;
  }

  moveAndCollide(p, game.level);

  // walk phase
  if (Math.abs(p.vx) > 0.4 && p.onGround) {
    p.walkPhase += Math.abs(p.vx) * 0.07;
  } else if (!p.onGround) {
    p.walkPhase = 0;
  }

  // Fell off?
  if (p.y > game.level.pixelH + 200) {
    killPlayer();
  }

  // Hazards (skipped while invincible)
  if (p.invuln <= 0 && p.powerInvinc <= 0 && checkHazards(p, game.level)) {
    killPlayer();
  }

  // Pickups
  for (const k of game.pickups) {
    if (k.taken) continue;
    k.phase += 0.1;
    if (rectOverlap(entBB(p), k)) {
      k.taken = true;
      if (k.kind === 'tea') {
        const teaScore = (p.powerScoreBoost > 0) ? 30 : 10;
        game.score += teaScore;
        game.totalCoins++;
        SFX.coin();
        // Every 10 teas = bonus life, every 25 = power-up gift
        if (game.totalCoins % 10 === 0) {
          game.lives++;
          game.flashGold = 30;
          showFloatText("+1 VIE ! Quelle tasse !", p.x+p.w/2, p.y, '#f4d35e');
        } else if (game.totalCoins % 5 === 0) {
          showFloatText(["Splendide !","Magnifique !","¡Salud !","Quelle classe !"][Math.floor(Math.random()*4)], p.x+p.w/2, p.y-10, '#f4e6c8');
        }
        if (game.totalCoins % 25 === 0) {
          // gift a random power-up at player position
          const kinds = ['ribbon','shawl','crown'];
          const kk = kinds[Math.floor(Math.random()*kinds.length)];
          game.pickups.push({ kind: kk, x: p.x+p.w/2-12, y: p.y-30, w:24, h:24, taken:false, phase:0, gift:true });
          showFloatText("CADEAU ROYAL !", p.x+p.w/2, p.y-22, '#e94f64');
        }
      }
      else if (k.kind === 'scone') {
        game.lives++; game.score += 100; SFX.coin(); game.flashGold = 30;
        showFloatText("Scone à la crème !", p.x+p.w/2, p.y, '#f4d35e');
      }
      else if (k.kind === 'lantern' || k.kind === 'gear' || k.kind === 'rose' || k.kind === 'brush') {
        const cnt = ++game.collected[k.kind];
        const obj = OBJECTIVES[k.kind];
        game.score += 30; SFX.coin();
        spawnCoinBurst(k.x+k.w/2, k.y+k.h/2);
        const labels = { lantern:'Lanterne', gear:'Engrenage', rose:'Rose', brush:'Pinceau' };
        const colors = { lantern:'#ffcc44', gear:'#c84040', rose:'#e94f64', brush:'#f4486c' };
        pushNotif({ iconKind:k.kind, title:`${labels[k.kind].toUpperCase()} ${cnt}/${obj}`,
                    desc: cnt < obj ? `Encore ${obj-cnt} pour transformer le décor !` : 'Objectif atteint — observe le décor !',
                    color: colors[k.kind] });
        if (cnt >= obj && !game.decorTriggered[k.kind]) triggerDecor(k.kind);
      }
      else if (k.kind === 'ribbon') {
        p.powerDoubleJump = POWER_DURATIONS.ribbon;
        p.doubleJumpUsed = false;
        game.score += 200; SFX.win();
        spawnPetals(k.x+k.w/2, k.y+k.h/2);
        pushNotif({ iconKind:'ribbon', title:'RUBAN ROUGE OBTENU', desc:'Double saut activé (≈ 14s) — réappuie SAUT en l\'air', color:'#e94f64' });
      }
      else if (k.kind === 'shawl') {
        p.powerSprint = POWER_DURATIONS.shawl;
        game.score += 200; SFX.win();
        spawnPetals(k.x+k.w/2, k.y+k.h/2);
        pushNotif({ iconKind:'shawl', title:'CHÂLE TEHUANA OBTENU', desc:'Sprint activé — vitesse de course augmentée', color:'#1a5aa8' });
      }
      else if (k.kind === 'crown') {
        p.powerInvinc = POWER_DURATIONS.crown;
        game.score += 200; SFX.win();
        spawnPetals(k.x+k.w/2, k.y+k.h/2);
        pushNotif({ iconKind:'crown', title:'COURONNE FLEURIE OBTENUE', desc:'Invincible 7s — traverse les ennemis et hazards', color:'#f4d35e' });
      }
      else {
        spawnCoinBurst(k.x+k.w/2, k.y+k.h/2);
      }
      if (k.kind === 'tea') spawnCoinBurst(k.x+k.w/2, k.y+k.h/2);
    }
  }

  // Enemy collisions
  for (const e of game.enemies) {
    if (!e.alive) continue;
    if (e.flies && e.type === 'smog') {
      if (rectOverlap(entBB(p), { x:e.x, y:e.y, w:e.w, h:e.h })) {
        if (p.powerInvinc > 0) {
          // Crown clears the smog!
          e.alive = false; e.deathTimer = 0;
          spawnPuff(e.x+e.w/2, e.y+e.h/2, '#dddddd');
          game.score += 150;
          showFloatText("PSCHITT !", e.x+e.w/2, e.y, '#f4e6c8');
        } else if (p.invuln <= 0) killPlayer();
      }
      continue;
    }
    const pb = entBB(p);
    const eb = { x:e.x, y:e.y, w:e.w, h:e.h };
    if (rectOverlap(pb, eb)) {
      const playerFeet = pb.y + pb.h;
      if (p.vy > 0 && playerFeet < eb.y + 14) {
        // STOMP
        if (e.isBoss) {
          e.hp--;
          p.vy = JUMP_V * 0.8;
          spawnPuff(e.x+e.w/2, e.y, '#ffd6e0');
          SFX.stomp();
          if (e.hp <= 0) {
            e.alive = false;
            game.score += 1000;
            game.bossKilled = true;
            SFX.win();
            spawnPetals(e.x+e.w/2, e.y+e.h/2);
            game.shake = 20;
            showFloatText("LA REINE EST TOMBÉE !", e.x+e.w/2, e.y-20, '#f4d35e');
          } else {
            e.facing *= -1;
            showFloatText("Pas amusée du tout !", e.x+e.w/2, e.y-10, '#ffffff');
          }
        } else {
          e.alive = false;
          p.vy = JUMP_V * 0.6;
          game.score += 100;
          SFX.stomp();
          spawnPuff(e.x+e.w/2, e.y+e.h/2);
        }
      } else if (p.powerInvinc > 0) {
        // Walk through enemies = kill them
        if (!e.isBoss) {
          e.alive = false;
          game.score += 100;
          SFX.stomp();
          spawnPetals(e.x+e.w/2, e.y+e.h/2);
        } else {
          // Bosses just take a hit
          e.hp--;
          if (e.hp <= 0) {
            e.alive = false; game.bossKilled = true;
            game.score += 1000; SFX.win(); spawnPetals(e.x+e.w/2, e.y+e.h/2);
          }
          p.powerInvinc = Math.max(0, p.powerInvinc - 60);  // boss costs invinc time
        }
      } else if (p.invuln <= 0) {
        killPlayer();
      }
    }
  }

  // Check level end flag
  const px = Math.floor((p.x + p.w/2) / TILE);
  const py = Math.floor((p.y + p.h/2) / TILE);
  if (tileAt(game.level, px, py) === 'F' || tileAt(game.level, px, py-1) === 'F') {
    if (game.levelIdx === LEVELS.length - 1 && !game.bossKilled) {
      // need to defeat boss first
    } else {
      p.won = true;
      SFX.win();
      spawnPetals(p.x+p.w/2, p.y);
      setTimeout(() => {
        if (game.levelIdx === LEVELS.length - 1) {
          game.state = 'win';
        } else {
          game.state = 'intermission';
          game.intermissionTimer = 0;
        }
      }, 1400);
    }
  }

  if (p.invuln > 0) p.invuln--;
  if (p.hurtFlash > 0) p.hurtFlash--;
}

function killPlayer() {
  const p = game.player;
  if (p.dead) return;
  p.dead = true;
  p.vy = -8;
  p.vx = 0;
  game.lives--;
  game.shake = 18;
  game.flashRed = 20;
  SFX.lose();
  spawnPetals(p.x+p.w/2, p.y+p.h/2);
  setTimeout(() => {
    if (game.lives <= 0) {
      game.state = 'gameover';
    } else {
      // restart current level
      loadLevel(game.levelIdx);
    }
  }, 1500);
}


function drawFrida(p, t) {
  const cx = p.x + p.w/2;
  const cy = p.y + p.h/2;
  const facing = p.facing;

  // ==== Sprint motion lines BEHIND Frida ====
  if (p.powerSprint > 0 && Math.abs(p.vx) > 3) {
    ctx.save();
    ctx.strokeStyle = 'rgba(90,138,206,0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const dx = -facing * (10 + i*5);
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy - 4 + i*3);
      ctx.lineTo(cx + dx - facing*12, cy - 4 + i*3);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==== Invincibility aura ====
  if (p.powerInvinc > 0) {
    ctx.save();
    const pulse = (Math.sin(t*0.3)*0.5+0.5);
    ctx.globalAlpha = 0.35 + pulse*0.25;
    const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 32);
    grad.addColorStop(0, '#f4d35e');
    grad.addColorStop(1, 'rgba(244,72,108,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx-40, cy-40, 80, 80);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, 1);

  // Hurt flash
  if (p.invuln > 0 && Math.floor(p.invuln/3) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Walk bob
  const onAir = !p.onGround;
  const bob = onAir ? -1 : Math.sin(p.walkPhase)*1;
  const armPhase = onAir ? 0.5 : Math.sin(p.walkPhase);
  const legPhase = onAir ? 0 : Math.sin(p.walkPhase);

  // === Dress (long traditional huipil-style, red with embroidery) ===
  ctx.fillStyle = '#c8302a';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-13, 14);
  ctx.lineTo(13, 14);
  ctx.lineTo(10, 0);
  ctx.closePath(); ctx.fill();
  // dress hem embroidery (yellow / blue)
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-13, 11, 26, 2);
  ctx.fillStyle = '#1a5aa8';
  for (let i=-12; i<=10; i+=4) {
    ctx.fillRect(i, 9, 2, 2);
  }

  // === Legs (under dress) ===
  ctx.fillStyle = '#a06848';
  // back leg
  ctx.fillRect(-6 + legPhase*1.5, 14, 4, 6);
  // front leg
  ctx.fillRect(2 - legPhase*1.5, 14, 4, 6);
  // shoes (dark)
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-7 + legPhase*1.5, 19, 6, 2);
  ctx.fillRect(1 - legPhase*1.5, 19, 6, 2);

  // === Torso shawl (rebozo - blue) ===
  ctx.fillStyle = '#2a5a8a';
  ctx.beginPath();
  ctx.moveTo(-10, -1+bob);
  ctx.lineTo(-9, 4+bob);
  ctx.lineTo(9, 4+bob);
  ctx.lineTo(10, -1+bob);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-9, 2+bob, 18, 1);

  // === Arms ===
  ctx.fillStyle = '#c8302a';
  // back arm
  ctx.fillRect(-12, -2+bob, 3, 8 + armPhase*1);
  // hand
  ctx.fillStyle = '#a06848';
  ctx.fillRect(-12, 6+bob+armPhase, 3, 3);
  // front arm
  ctx.fillStyle = '#c8302a';
  ctx.fillRect(9, -2+bob, 3, 8 - armPhase*1);
  ctx.fillStyle = '#a06848';
  ctx.fillRect(9, 6+bob-armPhase, 3, 3);

  // === Neck ===
  ctx.fillStyle = '#a06848';
  ctx.fillRect(-2, -3+bob, 4, 3);

  // === Head ===
  // face base
  ctx.fillStyle = '#b87858';
  ctx.beginPath();
  ctx.ellipse(0, -11+bob, 8, 9, 0, 0, Math.PI*2);
  ctx.fill();
  // chin shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.arc(0, -6+bob, 4, 0, Math.PI); ctx.fill();

  // === Hair (black) - on top and behind, with braid bun ===
  ctx.fillStyle = '#1a0e0a';
  // back hair
  ctx.beginPath();
  ctx.ellipse(0, -13+bob, 10, 7, 0, Math.PI, 0);
  ctx.fill();
  // bun behind
  ctx.beginPath();
  ctx.arc(-2, -20+bob, 6, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, -22+bob, 5, 0, Math.PI*2);
  ctx.fill();
  // hair side
  ctx.fillRect(-9, -14+bob, 3, 4);
  ctx.fillRect(6, -14+bob, 3, 4);

  // === Flowers in hair (Frida signature) ===
  // pink flower
  drawFlower(-4, -22+bob, 4, '#f4486c', '#f4d35e');
  // yellow flower
  drawFlower(3, -24+bob, 3, '#f4c534', '#c83030');
  // small flower
  drawFlower(6, -19+bob, 2.5, '#e94f64', '#fff4d6');
  // leaf
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath();
  ctx.ellipse(-7, -20+bob, 3, 1.5, -0.5, 0, Math.PI*2);
  ctx.fill();

  // === The famous UNIBROW ===
  ctx.fillStyle = '#0a0500';
  ctx.beginPath();
  ctx.moveTo(-6, -13+bob);
  ctx.quadraticCurveTo(0, -15+bob, 6, -13+bob);
  ctx.quadraticCurveTo(0, -12+bob, -6, -13+bob);
  ctx.closePath(); ctx.fill();
  // small subtle gap rendered as eyebrow body unified
  ctx.fillRect(-5, -13+bob, 10, 1.5);

  // === Eyes (dark, intense) ===
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-5, -11+bob, 3, 2);
  ctx.fillRect(2, -11+bob, 3, 2);
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-4, -11+bob, 2, 2);
  ctx.fillRect(3, -11+bob, 2, 2);

  // === Mustache hint (subtle - she had one) ===
  ctx.fillStyle = '#1a0e0a';
  ctx.fillRect(-2, -7+bob, 4, 1);

  // === Mouth (red lips, slight smile) ===
  ctx.fillStyle = '#a8203a';
  ctx.beginPath();
  ctx.moveTo(-3, -5+bob);
  ctx.quadraticCurveTo(0, -3+bob, 3, -5+bob);
  ctx.quadraticCurveTo(0, -4+bob, -3, -5+bob);
  ctx.closePath(); ctx.fill();

  // === Earrings ===
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(-8, -10+bob, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -10+bob, 1.5, 0, Math.PI*2); ctx.fill();

  // === Necklace (chunky pre-columbian style) ===
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath(); ctx.arc(-3, -1+bob, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(0, 0+bob, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c83030';
  ctx.beginPath(); ctx.arc(3, -1+bob, 1.5, 0, Math.PI*2); ctx.fill();

  ctx.restore();
}

function drawFlower(x, y, r, color, centerColor) {
  ctx.fillStyle = color;
  for (let i=0; i<5; i++) {
    const a = (i/5)*Math.PI*2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a)*r*0.6, y + Math.sin(a)*r*0.6, r*0.55, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath(); ctx.arc(x, y, r*0.4, 0, Math.PI*2); ctx.fill();
}


