"use strict";
// Caméra + boucle principale (update, render, loop) + boot

//  CAMERA
// ----------------------------------------------------------------------------
function updateCamera() {
  const p = game.player;
  const targetX = p.x + p.w/2 - W/2;
  const targetY = p.y + p.h/2 - H/2;
  game.camera.x += (targetX - game.camera.x) * 0.12;
  game.camera.y += (targetY - game.camera.y) * 0.12;
  game.camera.x = Math.max(0, Math.min(game.level.pixelW - W, game.camera.x));
  game.camera.y = Math.max(0, Math.min(game.level.pixelH - H, game.camera.y));
}

// ============================================================================
//  RENDERING
// ============================================================================

//  MAIN LOOP
// ----------------------------------------------------------------------------
function update() {
  game.time++;

  if (game.state === 'title') {
    if (consume('Space')) {
      ensureAudio();
      game.score = 0; game.lives = 3; game.totalCoins = 0;
      game.qaIdx = 0; game.qaAnswered = -1; game.qaPhase = 'asking';
      game.state = 'fridaQA';
    }
    return;
  }
  if (game.state === 'intermission') {
    game.intermissionTimer++;
    if (consume('Space') && game.intermissionTimer > 30) {
      game.qaIdx = game.levelIdx + 1;
      game.qaAnswered = -1; game.qaPhase = 'asking';
      game.state = 'fridaQA';
    }
    return;
  }
  if (game.state === 'fridaQA') {
    const q = FRIDA_QUESTIONS[game.qaIdx];
    if (!q) { game.state = 'powerSelect'; return; }
    if (game.qaPhase === 'asking') {
      let pick = -1;
      if (consume('Digit1') || consume('Numpad1')) pick = 0;
      else if (consume('Digit2') || consume('Numpad2')) pick = 1;
      else if (consume('Digit3') || consume('Numpad3')) pick = 2;
      if (pick >= 0) {
        game.qaAnswered = pick;
        game.qaPhase = 'reply';
        if (q.answers[pick].correct) { game.score += 50; game.flashGold = 30; SFX.coin(); }
        else { SFX.hit(); }
      }
    } else if (game.qaPhase === 'reply') {
      if (consume('Space')) {
        rollPowerChoices();
        game.state = 'powerSelect';
      }
    }
    return;
  }
  if (game.state === 'powerSelect') {
    if (!game.powerChoicesForLevel || game.powerChoicesForLevel.length === 0) rollPowerChoices();
    let pick = -1;
    if (consume('Digit1') || consume('Numpad1')) pick = 0;
    else if (consume('Digit2') || consume('Numpad2')) pick = 1;
    else if (consume('Digit3') || consume('Numpad3')) pick = 2;
    if (pick >= 0) {
      game.selectedPower = game.powerChoicesForLevel[pick].kind;
      SFX.win();
      loadLevel(game.qaIdx);
    }
    return;
  }
  if (game.state === 'win') {
    if (consume('Space')) {
      game.state = 'title';
    }
    return;
  }
  if (game.state === 'gameover') {
    if (consume('Space')) {
      game.state = 'title';
    }
    return;
  }
  if (game.state === 'paused') {
    if (consume('KeyP')) game.state = 'playing';
    return;
  }
  if (game.state !== 'playing') return;

  if (consume('KeyP')) { game.state = 'paused'; return; }
  if (consume('KeyR')) { loadLevel(game.levelIdx); return; }

  updatePlayer();
  // Slow-mo halves enemy update tick rate
  const slowmoActive = game.player && game.player.powerSlowmo > 0;
  if (!slowmoActive || (game.time % 2 === 0)) {
    for (const e of game.enemies) { updateEnemy(e, game.level); if (e.alive) maybeChatter(e); }
  }
  // Projectiles
  if (game.projectiles && game.projectiles.length) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
      const pr = game.projectiles[i];
      pr.x += pr.vx;
      pr.y += pr.vy;
      pr.vy += 0.15;
      pr.life--;
      // Hit any enemy?
      for (const e of game.enemies) {
        if (!e.alive) continue;
        if (pr.x > e.x && pr.x < e.x + e.w && pr.y > e.y && pr.y < e.y + e.h) {
          if (e.isBoss) {
            e.hp--;
            if (e.hp <= 0) {
              e.alive = false; game.bossKilled = true;
              game.score += 1000; SFX.win();
              spawnPetals(e.x+e.w/2, e.y+e.h/2);
              pushNotif({ iconKind:'fire', title:'BOSS BRÛLÉ', desc:'Tu as réduit la Reine en cendres !', color:'#ff6622' });
            } else {
              spawnPuff(e.x+e.w/2, e.y, '#ffaa44');
            }
          } else {
            e.alive = false;
            game.score += 100; SFX.stomp();
            spawnPuff(e.x+e.w/2, e.y+e.h/2, '#ffaa44');
          }
          pr.life = 0;
          break;
        }
      }
      // Hit a solid tile? Stop
      const tx = Math.floor(pr.x / TILE);
      const ty = Math.floor(pr.y / TILE);
      if (ty >= 0 && ty < game.level.h && tx >= 0 && tx < game.level.w) {
        const c = game.level.grid[ty][tx];
        if (SOLIDS.has(c)) pr.life = 0;
      }
      if (pr.life <= 0) game.projectiles.splice(i, 1);
    }
  }
  updateParticles();
  updateFloatTexts();
  updateNotifications();
  // cleanup dead enemies after fade
  game.enemies = game.enemies.filter(e => e.alive || e.deathTimer < 40);

  updateCamera();

  if (game.shake > 0) game.shake--;
  if (game.flashRed > 0) game.flashRed--;
  if (game.flashGold > 0) game.flashGold--;
}

function render() {
  ctx.save();
  if (game.state === 'playing' && game.shake > 0) {
    ctx.translate((Math.random()-0.5)*game.shake, (Math.random()-0.5)*game.shake);
  }

  if (game.state === 'title') {
    drawTitle(game.time);
    ctx.restore();
    return;
  }
  if (game.state === 'win') {
    drawWinScreen(game.time);
    ctx.restore();
    return;
  }
  if (game.state === 'gameover') {
    drawGameOver(game.time);
    ctx.restore();
    return;
  }
  if (game.state === 'intermission') {
    drawIntermission(game.time);
    ctx.restore();
    return;
  }
  if (game.state === 'fridaQA') {
    drawFridaQA(game.time);
    ctx.restore();
    return;
  }
  if (game.state === 'powerSelect') {
    drawPowerSelect(game.time);
    ctx.restore();
    return;
  }

  // Playing / paused
  if (!game.level) { ctx.restore(); return; }
  drawBackground(game.level.theme, game.time);

  ctx.save();
  ctx.translate(-Math.floor(game.camera.x), -Math.floor(game.camera.y));

  drawTiles(game.level, game.time);

  // Pickups
  for (const k of game.pickups) drawPickup(k, game.time);

  // Enemies (+ chatter bubbles)
  for (const e of game.enemies) {
    drawEnemy(e, game.time);
    if (e.alive && e.chatter && e.chatter.life > 0) drawChatter(e);
  }

  // Player
  if (game.player) drawFrida(game.player, game.time);

  // Particles (in world space)
  drawParticles();

  // Float texts (world space)
  drawFloatTexts();

  ctx.restore();

  // Flash overlays
  if (game.flashRed > 0) {
    ctx.fillStyle = `rgba(255, 30, 30, ${game.flashRed/40})`;
    ctx.fillRect(0,0,W,H);
  }
  if (game.flashGold > 0) {
    ctx.fillStyle = `rgba(255, 220, 80, ${game.flashGold/60})`;
    ctx.fillRect(0,0,W,H);
  }

  drawHUD();
  drawNotifications();

  if (game.state === 'paused') drawPause();

  ctx.restore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// boot
loop();

