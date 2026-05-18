"use strict";
// Pickups : objets thématiques, théières, scones, sprites

function drawPickupLantern(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
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
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t*0.08);
  ctx.fillStyle = '#9a3030';
  const r = 8;
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.rotate(i*Math.PI/4);
    ctx.fillRect(-2, -r-3, 4, 6);
    ctx.restore();
  }
  ctx.fillStyle = '#c84040';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7a1818';
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a0808';
  ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPickupRose(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#3a7a3a';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -2); ctx.stroke();
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath();
  ctx.ellipse(-4, 5, 4, 2, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, 8, 3.5, 2, 0.4, 0, Math.PI*2); ctx.fill();
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
  ctx.save();
  ctx.translate(x, y);
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


function buildPickups(level) {
  const out = [];
  for (let y=0; y<level.h; y++) {
    for (let x=0; x<level.w; x++) {
      const c = level.grid[y][x];
      if (c === 'o') {
        out.push({ kind:'tea', x:x*TILE+8, y:y*TILE+8, w:16, h:16, taken:false, phase: Math.random()*6 });
        level.grid[y][x] = '.';
      } else if (c === 'S') {
        out.push({ kind:'scone', x:x*TILE+4, y:y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
        level.grid[y][x] = '.';
      } else if (c === 'R') {
        out.push({ kind:'ribbon', x:x*TILE+4, y:y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
        level.grid[y][x] = '.';
      } else if (c === 'C') {
        out.push({ kind:'shawl', x:x*TILE+4, y:y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
        level.grid[y][x] = '.';
      } else if (c === 'K') {
        out.push({ kind:'crown', x:x*TILE+4, y:y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
        level.grid[y][x] = '.';
      }
    }
  }
  // Pre-defined power-up spawns
  if (level.powerups) {
    for (const pu of level.powerups) {
      out.push({ kind: pu.kind, x: pu.x*TILE+4, y: pu.y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
    }
  }
  // Pre-defined themed extras (lantern / gear / rose / brush)
  if (level.extras) {
    for (const ex of level.extras) {
      out.push({ kind: ex.kind, x: ex.x*TILE+4, y: ex.y*TILE+4, w:24, h:24, taken:false, phase: Math.random()*6 });
    }
  }
  return out;
}


function drawPickup(k, t) {
  if (k.taken) return;
  const float = Math.sin(t*0.1 + k.phase)*2;
  // Glow for power-ups
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

// ---- POWER-UP SPRITES ----
function drawRibbon(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // ribbon trailing tails
  ctx.fillStyle = '#c8203a';
  ctx.beginPath();
  ctx.moveTo(-8, 4); ctx.lineTo(-12, 10); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 4); ctx.lineTo(12, 10); ctx.lineTo(6, 7); ctx.closePath(); ctx.fill();
  // bow loops (left + right)
  ctx.fillStyle = '#e94f64';
  ctx.beginPath();
  ctx.ellipse(-5, 0, 6, 4, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, 0, 6, 4, 0.3, 0, Math.PI*2); ctx.fill();
  // bow knot
  ctx.fillStyle = '#a8203a';
  ctx.fillRect(-2, -2, 4, 5);
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-5, -1, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawShawl(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  const wave = Math.sin(t*0.15)*2;
  // shawl draped (rectangle with wavy bottom)
  ctx.fillStyle = '#1a5aa8';
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.lineTo(9, -6);
  ctx.lineTo(10, 4+wave);
  ctx.lineTo(6, 8);
  ctx.lineTo(2, 4-wave);
  ctx.lineTo(-2, 8);
  ctx.lineTo(-6, 4-wave);
  ctx.lineTo(-10, 8);
  ctx.closePath(); ctx.fill();
  // gold trim
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-9, -6, 18, 1.5);
  // embroidery
  ctx.fillStyle = '#e94f64';
  for (let i=-7; i<=6; i+=4) {
    ctx.beginPath(); ctx.arc(i, -2, 1, 0, Math.PI*2); ctx.fill();
  }
  // fringe shine
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-4, -5, 1, 6);
  ctx.restore();
}

function drawCrown(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // ring of flowers
  const colors = ['#e94f64','#f4c534','#f4486c','#fff4d6'];
  for (let i = 0; i < 7; i++) {
    const a = (i/7)*Math.PI*2 + t*0.01;
    const fx = Math.cos(a)*8, fy = Math.sin(a)*4 - 1;
    drawFlower(fx, fy, 3.5, colors[i%colors.length], '#3a7a3a');
  }
  // center jewel
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(0, -1, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c83030';
  ctx.beginPath(); ctx.arc(0, -1, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-1, -3, 1, 1);
  ctx.restore();
}

function drawTeacup(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // saucer
  ctx.fillStyle = '#f4e8d4';
  ctx.beginPath(); ctx.ellipse(0, 6, 10, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-10, 6, 20, 1);
  // cup body
  ctx.fillStyle = '#f4e8d4';
  ctx.fillRect(-6, -2, 12, 7);
  ctx.beginPath(); ctx.ellipse(0, 5, 6, 1, 0, 0, Math.PI*2); ctx.fill();
  // top opening (tea)
  ctx.fillStyle = '#5a3010';
  ctx.beginPath(); ctx.ellipse(0, -2, 6, 1.5, 0, 0, Math.PI*2); ctx.fill();
  // handle
  ctx.strokeStyle = '#f4e8d4';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(7, 1, 3, -Math.PI/2, Math.PI/2); ctx.stroke();
  // gold rim
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-6, -2, 12, 1);
  // steam
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

function drawScone(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // scone base
  ctx.fillStyle = '#d4a868';
  ctx.beginPath();
  ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#c89858';
  ctx.fillRect(-10, 0, 20, 4);
  ctx.beginPath();
  ctx.arc(0, 0, 10, Math.PI, 0);
  ctx.fill();
  // jam
  ctx.fillStyle = '#c82040';
  ctx.beginPath(); ctx.arc(-3, -1, 4, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 3, Math.PI, 0); ctx.fill();
  // cream
  ctx.fillStyle = '#f4e8d4';
  ctx.beginPath(); ctx.arc(0, -4, 5, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, -6, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -7, 3, 0, Math.PI*2); ctx.fill();
  // sparkle
  ctx.fillStyle = `rgba(255,255,255,${0.5+Math.sin(t*0.2)*0.4})`;
  ctx.fillRect(6, -8, 2, 2);
  ctx.fillRect(-7, -5, 2, 2);
  ctx.restore();
}


