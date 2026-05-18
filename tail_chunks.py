"""Append the missing tail of frida_in_london.html in many small chunks.
This avoids the truncation that happens with single large writes/appends."""

import os

PATH = 'frida_in_london.html'

# Chunks - keep each under ~1500 chars
CHUNKS = []

# Finish drawQueen
CHUNKS.append("""2+bob, bw, 4);
  }
}

// ============================================================================
//  PICKUPS RENDER + sprites
// ============================================================================
function drawPickup(k, t) {
  if (k.taken) return;
  const float = Math.sin(t*0.1 + k.phase)*2;
  if (['ribbon','shawl','crown'].includes(k.kind)) {
    const glowColor = { ribbon:'#e94f64', shawl:'#1a5aa8', crown:'#f4c534' }[k.kind];
    const pulse = (Math.sin(t*0.15+k.phase)*0.5+0.5);
    ctx.save();
    ctx.globalAlpha = 0.4 + pulse*0.3;
    ctx.fillStyle = glowColor;
    ctx.beginPath(); ctx.arc(k.x+k.w/2, k.y+k.h/2+float, 18+pulse*3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  if (k.kind === 'tea')          drawTeacup(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'scone')   drawScone(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'ribbon')  drawRibbon(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'shawl')   drawShawl(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'crown')   drawCrown(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'lantern') drawPickupLantern(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'gear')    drawPickupGear(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'rose')    drawPickupRose(k.x+k.w/2, k.y+k.h/2+float, t);
  else if (k.kind === 'brush')   drawPickupBrush(k.x+k.w/2, k.y+k.h/2+float, t);
}

""")

CHUNKS.append("""function drawTeacup(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#f4e8d4';
  ctx.beginPath(); ctx.ellipse(0, 6, 10, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-10, 6, 20, 1);
  ctx.fillStyle = '#f4e8d4';
  ctx.fillRect(-6, -2, 12, 7);
  ctx.beginPath(); ctx.ellipse(0, 5, 6, 1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3010';
  ctx.beginPath(); ctx.ellipse(0, -2, 6, 1.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#f4e8d4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(7, 1, 3, -Math.PI/2, Math.PI/2); ctx.stroke();
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-6, -2, 12, 1);
  ctx.strokeStyle = `rgba(255,255,255,${0.4+Math.sin(t*0.1)*0.2})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.quadraticCurveTo(-4 + Math.sin(t*0.1)*2, -7, 0, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -3);
  ctx.quadraticCurveTo(4 + Math.sin(t*0.1+1)*2, -7, 1, -10);
  ctx.stroke();
  ctx.restore();
}

""")

CHUNKS.append("""function drawScone(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#d4a868';
  ctx.beginPath(); ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c89858';
  ctx.fillRect(-10, 0, 20, 4);
  ctx.beginPath(); ctx.arc(0, 0, 10, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c82040';
  ctx.beginPath(); ctx.arc(-3, -1, 4, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 3, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f4e8d4';
  ctx.beginPath(); ctx.arc(0, -4, 5, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, -6, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -7, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.5+Math.sin(t*0.2)*0.4})`;
  ctx.fillRect(6, -8, 2, 2);
  ctx.fillRect(-7, -5, 2, 2);
  ctx.restore();
}

function drawRibbon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#c8203a';
  ctx.beginPath();
  ctx.moveTo(-8, 4); ctx.lineTo(-12, 10); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 4); ctx.lineTo(12, 10); ctx.lineTo(6, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e94f64';
  ctx.beginPath(); ctx.ellipse(-5, 0, 6, 4, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, 0, 6, 4, 0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#a8203a';
  ctx.fillRect(-2, -2, 4, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-5, -1, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

""")

CHUNKS.append("""function drawShawl(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  const wave = Math.sin(t*0.15)*2;
  ctx.fillStyle = '#1a5aa8';
  ctx.beginPath();
  ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.lineTo(10, 4+wave);
  ctx.lineTo(6, 8); ctx.lineTo(2, 4-wave); ctx.lineTo(-2, 8);
  ctx.lineTo(-6, 4-wave); ctx.lineTo(-10, 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-9, -6, 18, 1.5);
  ctx.fillStyle = '#e94f64';
  for (let i=-7; i<=6; i+=4) { ctx.beginPath(); ctx.arc(i, -2, 1, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-4, -5, 1, 6);
  ctx.restore();
}

function drawCrown(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  const colors = ['#e94f64','#f4c534','#f4486c','#fff4d6'];
  for (let i = 0; i < 7; i++) {
    const a = (i/7)*Math.PI*2 + t*0.01;
    const fx = Math.cos(a)*8, fy = Math.sin(a)*4 - 1;
    drawFlower(fx, fy, 3.5, colors[i%colors.length], '#3a7a3a');
  }
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(0, -1, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c83030';
  ctx.beginPath(); ctx.arc(0, -1, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-1, -3, 1, 1);
  ctx.restore();
}

""")

# Themed pickups (lantern/gear/rose/brush)
CHUNKS.append("""function drawPickupLantern(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  const glow = (Math.sin(t*0.15)*0.5+0.5);
  ctx.fillStyle = `rgba(255, 200, 80, ${0.25 + glow*0.2})`;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-2, -10, 4, 3);
  ctx.fillRect(-6, -8, 12, 2);
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath();
  ctx.moveTo(-5, -6); ctx.lineTo(5, -6); ctx.lineTo(6, 6); ctx.lineTo(-6, 6); ctx.closePath();
  ctx.fill();
  const flick = Math.sin(t*0.4)*1;
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.moveTo(-2, 3); ctx.lineTo(0, -3+flick); ctx.lineTo(2, 3); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff4d6';
  ctx.fillRect(-1, 0, 2, 2);
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(-5, 6, 10, 2);
  ctx.restore();
}

function drawPickupGear(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t*0.08);
  ctx.fillStyle = '#9a3030';
  const r = 8;
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.rotate(i*Math.PI/4);
    ctx.fillRect(-2, -r-3, 4, 6); ctx.restore();
  }
  ctx.fillStyle = '#c84040';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7a1818';
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

""")

CHUNKS.append("""function drawPickupRose(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#3a7a3a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -2); ctx.stroke();
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath(); ctx.ellipse(-4, 5, 4, 2, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, 8, 3.5, 2, 0.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f4f4f4';
  ctx.beginPath(); ctx.arc(0, -4, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c82040';
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a)*3, -4 + Math.sin(a)*3, 3.5, 2.5, a, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(0, -4, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPickupBrush(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.rotate(Math.sin(t*0.08)*0.2 - 0.4);
  ctx.fillStyle = '#7a4a20';
  ctx.fillRect(-1.5, -10, 3, 14);
  ctx.fillStyle = '#5a3010';
  ctx.fillRect(-1.5, 0, 3, 4);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(-3, 4, 6, 3);
  ctx.fillStyle = '#c83030';
  ctx.beginPath();
  ctx.moveTo(-3, 7); ctx.lineTo(-4, 13); ctx.lineTo(0, 15); ctx.lineTo(4, 13); ctx.lineTo(3, 7);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e94f64';
  ctx.beginPath(); ctx.arc(0, 16, 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

""")

# Chatter bubble + particles render
CHUNKS.append("""function drawChatter(e) {
  const cx = e.x + e.w/2;
  const cy = e.y - 10;
  const txt = e.chatter.text;
  ctx.save();
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 12;
  const fade = Math.min(1, e.chatter.life / 30);
  ctx.globalAlpha = fade;
  ctx.fillStyle = '#f4e6c8';
  ctx.strokeStyle = '#3a2010';
  ctx.lineWidth = 1.5;
  ctx.fillRect(cx-w/2, cy-12, w, 18);
  ctx.strokeRect(cx-w/2, cy-12, w, 18);
  ctx.beginPath();
  ctx.moveTo(cx-4, cy+5); ctx.lineTo(cx, cy+12); ctx.lineTo(cx+4, cy+5);
  ctx.closePath(); ctx.fillStyle = '#f4e6c8'; ctx.fill();
  ctx.strokeStyle = '#3a2010'; ctx.stroke();
  ctx.fillStyle = '#3a2010';
  ctx.fillText(txt, cx, cy-3);
  ctx.restore();
}

function drawParticles() {
  for (const p of game.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / 40);
    ctx.fillStyle = p.color;
    if (p.rot !== undefined) {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*1.5);
    } else {
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.restore();
  }
}

function drawFloatTexts() {
  for (const t of game.floatTexts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life / 30);
    ctx.font = `bold ${t.size}px Georgia`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(t.txt, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.txt, t.x, t.y);
    ctx.restore();
  }
}

""")

# HUD with themed counter
CHUNKS.append("""function drawHUD() {
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = '#c9a96e';
  ctx.fillRect(0, 42, W, 2);
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px Georgia';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText(`SCORE  ${game.score.toString().padStart(5,'0')}`, 14, 22);
  drawMiniTeacup(180, 22);
  ctx.font = 'bold 18px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText(`x ${game.totalCoins}`, 196, 22);
  const remainder = game.totalCoins % 10;
  ctx.font = '11px Georgia';
  ctx.fillStyle = '#aaa9a0';
  ctx.fillText(`${remainder}/10`, 244, 30);

  // Themed object counter for this level
  const themeKind = LEVEL_THEME_OBJECT[game.levelIdx] || null;
  if (themeKind) {
    const count = game.collected[themeKind] || 0;
    const obj = OBJECTIVES[themeKind];
    const cx = 290;
    ctx.save(); ctx.translate(cx, 22); ctx.scale(0.7, 0.7);
    if (themeKind === 'lantern') drawPickupLantern(0, 0, game.time);
    else if (themeKind === 'gear') drawPickupGear(0, 0, game.time);
    else if (themeKind === 'rose') drawPickupRose(0, 0, game.time);
    else if (themeKind === 'brush') drawPickupBrush(0, 0, game.time);
    ctx.restore();
    const labelColor = game.decorTriggered[themeKind] ? '#3a7a3a' : '#f4d35e';
    ctx.fillStyle = labelColor;
    ctx.font = 'bold 16px Georgia';
    ctx.fillText(`${count}/${obj}`, cx+14, 22);
    if (game.decorTriggered[themeKind]) {
      ctx.font = 'bold 11px Georgia';
      ctx.fillText('!', cx+58, 22);
    }
  }

  ctx.font = 'bold 16px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText('x', 380, 22);
  for (let i = 0; i < Math.min(game.lives, 6); i++) drawTinyFrida(405 + i*22, 22);
  if (game.lives > 6) { ctx.fillStyle = '#f4e6c8'; ctx.fillText('+' + (game.lives - 6), 405 + 6*22, 22); }

  ctx.textAlign = 'center';
  ctx.font = 'italic 14px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText(`- ${game.level.name} -`, W/2, 22);

  ctx.textAlign = 'right';
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText(`Acte ${game.levelIdx+1} / ${LEVELS.length}`, W-14, 22);

  const p = game.player;
  let py = 56;
  function drawPowerTimer(kind, frames, label, color) {
    if (frames <= 0) return;
    const total = POWER_DURATIONS[kind];
    const frac = Math.min(1, frames / total);
    const x = W - 200;
    ctx.fillStyle = 'rgba(20,10,25,0.85)';
    ctx.fillRect(x, py-12, 190, 22);
    ctx.save();
    if (kind === 'ribbon') drawRibbon(x+14, py-1, game.time);
    else if (kind === 'shawl') drawShawl(x+14, py-1, game.time);
    else if (kind === 'crown') drawCrown(x+14, py-1, game.time);
    ctx.restore();
    ctx.font = 'bold 11px Georgia';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(label, x+30, py-3);
    ctx.fillStyle = '#332533';
    ctx.fillRect(x+30, py+4, 150, 5);
    ctx.fillStyle = color;
    ctx.fillRect(x+30, py+4, 150*frac, 5);
    py += 26;
  }
  if (p) {
    drawPowerTimer('ribbon', p.powerDoubleJump, 'RUBAN ROUGE', '#e94f64');
    drawPowerTimer('shawl',  p.powerSprint,    'CHALE TEHUANA', '#5a8ace');
    drawPowerTimer('crown',  p.powerInvinc,    'COURONNE', '#f4d35e');
  }

  // Big decor-trigger message (transient)
  if (game.messageTimer > 0) {
    const fade = Math.min(1, game.messageTimer / 40);
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(20, 10, 25, 0.85)';
    ctx.fillRect(0, H/2 - 30, W, 60);
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 24px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, W/2, H/2 + 4);
    ctx.globalAlpha = 1;
  }
}

""")

# Mini sprite helpers
CHUNKS.append("""function drawMiniTeacup(cx, cy) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#f4e8d4';
  ctx.fillRect(-5, -3, 10, 7);
  ctx.beginPath(); ctx.ellipse(0, 4, 5, 1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3010';
  ctx.beginPath(); ctx.ellipse(0, -3, 5, 1.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-5, -3, 10, 1);
  ctx.strokeStyle = '#f4e8d4'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(6, 0, 2.5, -Math.PI/2, Math.PI/2); ctx.stroke();
  ctx.restore();
}

function drawTinyFrida(cx, cy) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#b87858';
  ctx.beginPath(); ctx.arc(0, 1, 8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a0e0a';
  ctx.beginPath(); ctx.ellipse(0, -3, 9, 5, 0, Math.PI, 0); ctx.fill();
  drawFlower(-4, -4, 2.5, '#f4486c', '#f4d35e');
  drawFlower(4, -4, 2, '#f4c534', '#c83030');
  ctx.fillStyle = '#0a0500';
  ctx.fillRect(-5, -2, 10, 1.5);
  ctx.fillRect(-3, 0, 1.5, 1.5);
  ctx.fillRect(2, 0, 1.5, 1.5);
  ctx.fillStyle = '#a8203a';
  ctx.fillRect(-2, 4, 4, 1);
  ctx.restore();
}

""")

# Title, intermission, win, gameover, pause + Frida quotes
CHUNKS.append("""const FRIDA_QUOTES = [
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

function drawTitle(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W-80, H-80);
  ctx.strokeRect(48, 48, W-96, H-96);
  ctx.textAlign = 'center';
  ctx.save(); ctx.translate(W/2, 200); ctx.scale(3, 3);
  const fakeP = { x:-11, y:-15, w:22, h:30, facing:1, walkPhase:0, onGround:true,
                  invuln:0, powerSprint:0, powerInvinc:0, powerDoubleJump:0, hairFlow:t*0.15 };
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
  ctx.fillText('Pavés • Charbon • Lande • Couronne — Et Frida au milieu', W/2, 478);
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
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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
  // Stats
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

# Frida QA screen + power select screen
CHUNKS.append("""function drawFridaQA(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, H);
  const cardX = 60, cardY = 60, cardW = W-120, cardH = H-120;
  ctx.fillStyle = 'rgba(244,230,200,0.98)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 3;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 1;
  ctx.strokeRect(cardX+6, cardY+6, cardW-12, cardH-12);
  ctx.save();
  ctx.translate(cardX+110, cardY+170);
  ctx.scale(3.2, 3.2);
  const fakeP = { x:-11, y:-15, w:22, h:30, facing:1, walkPhase:0, onGround:true,
                  invuln:0, powerSprint:0, powerInvinc:0, powerDoubleJump:0, hairFlow:t*0.1 };
  drawFrida(fakeP, t);
  ctx.restore();
  drawFlower(cardX+30, cardY+30, 6, '#e94f64', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+30, 6, '#f4c534', '#c83030');
  drawFlower(cardX+30, cardY+cardH-30, 6, '#1a5aa8', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+cardH-30, 6, '#f4486c', '#fff4d6');

  const q = FRIDA_QUESTIONS[game.qaIdx];
  if (!q) return;
  const tx = cardX + 230;
  const tw = cardW - 260;

  if (game.qaPhase === 'asking') {
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#5a3010';
    ctx.font = 'italic 16px Georgia';
    wrapTextLeft(q.intro, tx, cardY+44, tw, 22);
    ctx.font = 'bold 22px Georgia';
    ctx.fillStyle = '#3a2010';
    wrapTextLeft(`« ${q.question} »`, tx, cardY+100, tw, 28);
    ctx.font = 'bold 14px Georgia';
    ctx.fillStyle = '#7a1818';
    ctx.fillText("Réponds avec 1, 2 ou 3 :", tx, cardY+180);
    for (let i = 0; i < q.answers.length; i++) {
      const ay = cardY + 210 + i*54;
      ctx.fillStyle = ['#e94f64','#1a5aa8','#3a7a3a'][i];
      ctx.fillRect(tx, ay, 36, 36);
      ctx.fillStyle = '#f4e6c8';
      ctx.font = 'bold 22px Georgia';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i+1), tx+18, ay+18);
      ctx.fillStyle = '#3a2010';
      ctx.font = '16px Georgia';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      wrapTextLeft(q.answers[i].text, tx+50, ay+18, tw-60, 20);
    }
  } else {
    const a = q.answers[game.qaAnswered];
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = a.correct ? '#3a7a3a' : '#7a1818';
    ctx.font = 'bold 20px Georgia';
    ctx.fillText(a.correct ? "Bonne réponse !  (+50 pts)" : "Pas tout à fait...", tx, cardY+44);
    ctx.fillStyle = '#5a3010';
    ctx.font = 'italic 18px Georgia';
    wrapTextLeft(`Tu as choisi : « ${a.text} »`, tx, cardY+80, tw, 22);
    ctx.fillStyle = '#3a2010';
    ctx.font = '18px Georgia';
    wrapTextLeft(`Frida : « ${a.reply} »`, tx, cardY+140, tw, 24);
    ctx.font = 'bold 18px Georgia';
    ctx.fillStyle = '#7a1818';
    const blink = Math.sin(t*0.15) > 0;
    if (blink) ctx.fillText("▶ ESPACE pour choisir ton pouvoir", tx, cardY+cardH-60);
  }
}

function wrapTextLeft(text, x, y, maxW, lineH) {
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

CHUNKS.append("""function drawPowerSelect(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 36px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('CHOISIS TON POUVOIR', W/2, 60);
  ctx.font = 'italic 18px Georgia';
  ctx.fillStyle = '#f4e6c8';
  const nxt = LEVELS[game.qaIdx];
  ctx.fillText(`Pour l'acte « ${nxt ? nxt.name : '???'} »`, W/2, 90);

  const cardW = 240, cardH = 280, gap = 30;
  const totalW = 3*cardW + 2*gap;
  const startX = (W - totalW) / 2;
  const cardY = 130;
  for (let i = 0; i < 3; i++) {
    const p = POWER_CHOICES[i];
    const cx = startX + i*(cardW + gap);
    ctx.fillStyle = '#f4e6c8';
    ctx.fillRect(cx, cardY, cardW, cardH);
    ctx.strokeStyle = p.color; ctx.lineWidth = 4;
    ctx.strokeRect(cx, cardY, cardW, cardH);
    ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1;
    ctx.strokeRect(cx+5, cardY+5, cardW-10, cardH-10);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx+30, cardY+30, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f4e6c8';
    ctx.font = 'bold 24px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i+1), cx+30, cardY+31);
    ctx.save();
    ctx.translate(cx + cardW/2, cardY + 110);
    ctx.scale(4, 4);
    if (p.kind === 'ribbon') drawRibbon(0, 0, t);
    else if (p.kind === 'shawl') drawShawl(0, 0, t);
    else if (p.kind === 'crown') drawCrown(0, 0, t);
    ctx.restore();
    ctx.fillStyle = p.color;
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.name, cx + cardW/2, cardY + 200);
    ctx.fillStyle = '#3a2010';
    ctx.font = '14px Georgia';
    wrapTextCenter(p.desc, cx + cardW/2, cardY + 230, cardW-20, 18);
  }
  ctx.font = 'bold 18px Georgia';
  const blink = Math.sin(t*0.15) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#c9a96e';
  ctx.fillText('Appuie sur 1, 2 ou 3 pour choisir', W/2, H-30);
}

function wrapTextCenter(text, x, y, maxW, lineH) {
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

# Main update and render and loop
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
      if (consume('Space')) game.state = 'powerSelect';
    }
    return;
  }
  if (game.state === 'powerSelect') {
    let pick = -1;
    if (consume('Digit1') || consume('Numpad1')) pick = 0;
    else if (consume('Digit2') || consume('Numpad2')) pick = 1;
    else if (consume('Digit3') || consume('Numpad3')) pick = 2;
    if (pick >= 0) {
      game.selectedPower = POWER_CHOICES[pick].kind;
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
  for (const e of game.enemies) { updateEnemy(e, game.level); if (e.alive) maybeChatter(e); }
  updateParticles();
  updateFloatTexts();
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

# Append chunks one at a time to file
with open(PATH, 'a') as f:
    for i, chunk in enumerate(CHUNKS):
        f.write(chunk)
        f.flush()

print(f'Appended {len(CHUNKS)} chunks.')
print('Total file size:', os.path.getsize(PATH))
