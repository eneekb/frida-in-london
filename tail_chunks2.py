"""Rebuild the missing tail of frida_in_london.html with ALL new features."""
import os

PATH = 'frida_in_london.html'
CHUNKS = []

# Quotes + wrapText
CHUNKS.append("""

const FRIDA_QUOTES = [
  { q: "« Des pieds, pour quoi faire si j'ai des ailes pour voler ? »", src: "— Frida Kahlo" },
  { q: "« Je ne peins pas mes rêves ni mes cauchemars. Je peins ma propre réalité. »", src: "— Frida Kahlo" },
  { q: "« Au bout du compte, on peut toujours résister. »", src: "— Frida Kahlo" },
  { q: "« Rien n'est absolu. Tout change, tout bouge, tout tourne, tout vole et s'en va. »", src: "— Frida Kahlo" },
];

function wrapText(text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW) { ctx.fillText(line, x, yy); yy += lineH; line = w; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

""")

CHUNKS.append("""function drawTitle(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W-80, H-80);
  ctx.strokeRect(48, 48, W-96, H-96);
  ctx.textAlign = 'center';
  ctx.save(); ctx.translate(W/2, 200); ctx.scale(3, 3);
  const fakeP = { x:-11, y:-15, w:22, h:30, facing:1, walkPhase:0, onGround:true,
                  invuln:0, powerSprint:0, powerInvinc:0, powerDoubleJump:0,
                  powerFireball:0, powerFly:0, powerMagnet:0, powerSlowmo:0,
                  powerScoreBoost:0, powerGroundpound:0, powerBrush:0, hairFlow:t*0.15 };
  drawFrida(fakeP, t);
  ctx.restore();
  ctx.font = 'bold 56px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('FRIDA À LONDRES', W/2, 340);
  ctx.font = 'italic 24px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText("L'Odyssée Victorienne", W/2, 370);
  ctx.font = 'bold 22px Georgia';
  const blink = Math.sin(t*0.1) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#c9a96e';
  ctx.fillText('▶ ESPACE pour commencer ◀', W/2, 440);
  ctx.font = '13px Georgia';
  ctx.fillStyle = '#aaa9a0';
  ctx.fillText('Pavés • Charbon • Lande • Couronne — 10 pouvoirs, 3 par niveau', W/2, 478);
}

""")

CHUNKS.append("""function drawIntermission(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);
  const cardX = 80, cardY = 70, cardW = W-160, cardH = H-140;
  ctx.fillStyle = 'rgba(244,230,200,0.97)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 3;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 1;
  ctx.strokeRect(cardX+6, cardY+6, cardW-12, cardH-12);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3a2010';
  ctx.font = 'italic 16px Georgia';
  ctx.fillText('— Acte achevé —', W/2, cardY+34);
  ctx.font = 'bold 36px Georgia';
  ctx.fillText(`Bravo, Frida !`, W/2, cardY+78);
  ctx.font = 'italic 18px Georgia';
  ctx.fillText(`Tu as traversé "${LEVELS[game.levelIdx].name}"`, W/2, cardY+108);
  const quote = FRIDA_QUOTES[game.levelIdx % FRIDA_QUOTES.length];
  ctx.font = 'italic 17px Georgia';
  ctx.fillStyle = '#5a3010';
  ctx.textAlign = 'center';
  wrapText(quote.q, W/2, cardY+158, cardW-80, 24);
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#7a1818';
  ctx.fillText(quote.src, W/2, cardY+218);
  drawFlower(cardX+30, cardY+30, 6, '#e94f64', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+30, 6, '#f4c534', '#c83030');
  drawFlower(cardX+30, cardY+cardH-30, 6, '#f4486c', '#fff4d6');
  drawFlower(cardX+cardW-30, cardY+cardH-30, 6, '#1a5aa8', '#f4d35e');
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#3a2010';
  const themeKind = LEVEL_THEME_OBJECT[game.levelIdx];
  let statsLine = `Théières : ${game.totalCoins}    Vies : ${game.lives}    Score : ${game.score}`;
  if (themeKind) {
    const tCount = game.collected[themeKind] || 0;
    const objVal = OBJECTIVES[themeKind];
    const label = { lantern:'Lanternes', gear:'Engrenages', rose:'Roses', brush:'Pinceaux' }[themeKind];
    statsLine += `    ${label} : ${tCount}/${objVal}`;
  }
  ctx.fillText(statsLine, W/2, cardY+cardH-80);
  ctx.font = 'bold 18px Georgia';
  ctx.fillStyle = '#7a1818';
  const blink = Math.sin(t*0.15) > 0;
  if (blink) ctx.fillText('▶ ESPACE pour continuer ◀', W/2, cardY+cardH-22);
}

""")

CHUNKS.append("""function drawWinScreen(t) {
  drawBigBenBG(t);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, H);
  for (let i=0;i<60;i++) {
    const cx = (i*97 + t*2) % W;
    const cy = (i*53 + t*3) % H;
    ctx.fillStyle = ['#f4d35e','#c83030','#1a5aa8','#f4486c','#3a7a3a'][i%5];
    ctx.fillRect(cx, cy, 4, 6);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 64px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('VIVE FRIDA !', W/2, 200);
  ctx.font = 'italic 24px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText("La Reine est terrassée. L'Empire vacille.", W/2, 240);
  ctx.fillText("Frida rentre au Mexique en sirotant son thé.", W/2, 270);
  ctx.font = 'bold 28px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText(`Score final : ${game.score}`, W/2, 350);
  ctx.font = '20px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText(`Théières bues : ${game.totalCoins}`, W/2, 385);
  ctx.font = 'bold 20px Georgia';
  const blink = Math.sin(t*0.12) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#c9a96e';
  ctx.fillText('ESPACE pour rejouer', W/2, 470);
}

function drawGameOver(t) {
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#3a0a0a';
  for (let i=0; i<20; i++) {
    const x = (i*49) % W;
    ctx.fillRect(x, 0, 8, 30 + (i*7)%80);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 72px Georgia';
  ctx.fillStyle = '#c83030';
  ctx.fillText('GAME OVER', W/2, 220);
  ctx.font = 'italic 22px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText("Frida est rentrée chez elle... pour préparer sa revanche.", W/2, 270);
  ctx.font = 'bold 20px Georgia';
  const blink = Math.sin(t*0.12) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#7a1818';
  ctx.fillText('ESPACE pour recommencer', W/2, 380);
}

function drawPause() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,W,H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 60px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('PAUSE', W/2, H/2);
  ctx.font = '20px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText('P pour reprendre', W/2, H/2 + 40);
}

""")

# update() with everything (notifications + projectiles + slowmo)
CHUNKS.append("""function update() {
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
    if (!q) { rollPowerChoices(); game.state = 'powerSelect'; return; }
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
      if (consume('Space')) { rollPowerChoices(); game.state = 'powerSelect'; }
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
  if (game.state === 'win') { if (consume('Space')) game.state = 'title'; return; }
  if (game.state === 'gameover') { if (consume('Space')) game.state = 'title'; return; }
  if (game.state === 'paused') { if (consume('KeyP')) game.state = 'playing'; return; }
  if (game.state !== 'playing') return;
  if (consume('KeyP')) { game.state = 'paused'; return; }
  if (consume('KeyR')) { loadLevel(game.levelIdx); return; }
  updatePlayer();
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
            } else spawnPuff(e.x+e.w/2, e.y, '#ffaa44');
          } else {
            e.alive = false;
            game.score += 100; SFX.stomp();
            spawnPuff(e.x+e.w/2, e.y+e.h/2, '#ffaa44');
          }
          pr.life = 0; break;
        }
      }
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
  game.enemies = game.enemies.filter(e => e.alive || e.deathTimer < 40);
  updateCamera();
  if (game.shake > 0) game.shake--;
  if (game.flashRed > 0) game.flashRed--;
  if (game.flashGold > 0) game.flashGold--;
  const anyDecor = game.decorTriggered.lantern || game.decorTriggered.gear ||
                   game.decorTriggered.rose || game.decorTriggered.brush;
  if (anyDecor && game.decorTransition < 60) game.decorTransition++;
  if (game.messageTimer > 0) game.messageTimer--;
}

""")

CHUNKS.append("""function render() {
  ctx.save();
  if (game.state === 'playing' && game.shake > 0) {
    ctx.translate((Math.random()-0.5)*game.shake, (Math.random()-0.5)*game.shake);
  }
  if (game.state === 'title')        { drawTitle(game.time);        ctx.restore(); return; }
  if (game.state === 'win')          { drawWinScreen(game.time);    ctx.restore(); return; }
  if (game.state === 'gameover')     { drawGameOver(game.time);     ctx.restore(); return; }
  if (game.state === 'intermission') { drawIntermission(game.time); ctx.restore(); return; }
  if (game.state === 'fridaQA')      { drawFridaQA(game.time);      ctx.restore(); return; }
  if (game.state === 'powerSelect')  { drawPowerSelect(game.time);  ctx.restore(); return; }
  if (!game.level) { ctx.restore(); return; }
  drawBackground(game.level.theme, game.time);
  ctx.save();
  ctx.translate(-Math.floor(game.camera.x), -Math.floor(game.camera.y));
  drawTiles(game.level, game.time);
  for (const k of game.pickups) drawPickup(k, game.time);
  for (const e of game.enemies) {
    drawEnemy(e, game.time);
    if (e.alive && e.chatter && e.chatter.life > 0) drawChatter(e);
  }
  if (game.player) drawFrida(game.player, game.time);
  // Projectiles
  if (game.projectiles && game.projectiles.length) {
    for (const pr of game.projectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      grad.addColorStop(0, 'rgba(255, 200, 80, 0.8)');
      grad.addColorStop(1, 'rgba(255, 100, 30, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-14, -14, 28, 28);
      ctx.fillStyle = '#ff6622';
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath(); ctx.arc(-1, -1, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
  drawParticles();
  drawFloatTexts();
  ctx.restore();
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

loop();

</script>
</body>
</html>
""")

with open(PATH, 'a') as f:
    for i, chunk in enumerate(CHUNKS):
        f.write(chunk)
        f.flush()

print(f'Appended {len(CHUNKS)} chunks. Size:', os.path.getsize(PATH))
