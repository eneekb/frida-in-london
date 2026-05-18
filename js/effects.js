"use strict";
// Notifications, icônes, textes flottants, particules

//  PERSISTENT NOTIFICATIONS PANEL — stays visible 6 seconds
// ----------------------------------------------------------------------------
const NOTIF_LIFE = 360;  // 6 seconds at 60 fps
const NOTIF_MAX = 4;

function pushNotif(notif) {
  // notif: { iconKind, title, desc, color }
  notif.life = NOTIF_LIFE;
  notif.maxLife = NOTIF_LIFE;
  if (!game.notifications) game.notifications = [];
  game.notifications.unshift(notif);
  if (game.notifications.length > NOTIF_MAX) game.notifications.length = NOTIF_MAX;
}
function updateNotifications() {
  if (!game.notifications) return;
  for (let i = game.notifications.length - 1; i >= 0; i--) {
    game.notifications[i].life--;
    if (game.notifications[i].life <= 0) game.notifications.splice(i, 1);
  }
}
function drawNotifications() {
  if (!game.notifications || game.notifications.length === 0) return;
  const x = W - 280;
  const baseY = H - 30;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  for (let i = 0; i < game.notifications.length; i++) {
    const n = game.notifications[i];
    const y = baseY - i*68;
    const fade = Math.min(1, n.life / 30);
    ctx.save();
    ctx.globalAlpha = fade;
    // Background card
    ctx.fillStyle = 'rgba(20, 10, 25, 0.92)';
    ctx.fillRect(x, y-28, 268, 56);
    ctx.strokeStyle = n.color || '#c9a96e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y-28, 268, 56);
    // Icon (left)
    ctx.save();
    ctx.translate(x+24, y);
    ctx.scale(1.2, 1.2);
    if (n.iconKind === 'tea') drawTeacup(0, 0, game.time);
    else if (n.iconKind === 'scone') drawScone(0, 0, game.time);
    else if (n.iconKind === 'ribbon') drawRibbon(0, 0, game.time);
    else if (n.iconKind === 'shawl') drawShawl(0, 0, game.time);
    else if (n.iconKind === 'crown') drawCrown(0, 0, game.time);
    else if (n.iconKind === 'lantern') drawPickupLantern(0, 0, game.time);
    else if (n.iconKind === 'gear') drawPickupGear(0, 0, game.time);
    else if (n.iconKind === 'rose') drawPickupRose(0, 0, game.time);
    else if (n.iconKind === 'brush') drawPickupBrush(0, 0, game.time);
    else if (n.iconKind === 'fire') drawFireIcon(0, 0, game.time);
    else if (n.iconKind === 'wing') drawWingIcon(0, 0, game.time);
    else if (n.iconKind === 'magnet') drawMagnetIcon(0, 0, game.time);
    else if (n.iconKind === 'hourglass') drawHourglassIcon(0, 0, game.time);
    else if (n.iconKind === 'skull') drawSkullIcon(0, 0, game.time);
    else if (n.iconKind === 'boot') drawBootIcon(0, 0, game.time);
    else if (n.iconKind === 'switch') drawSwitchIcon(0, 0, game.time);
    ctx.restore();
    // Title
    ctx.font = 'bold 14px Georgia';
    ctx.fillStyle = n.color || '#f4d35e';
    ctx.fillText(n.title, x+50, y-8);
    // Description
    ctx.font = '11px Georgia';
    ctx.fillStyle = '#f4e6c8';
    ctx.fillText(n.desc, x+50, y+10);
    // Life bar at the bottom of the card
    ctx.fillStyle = '#332533';
    ctx.fillRect(x, y+24, 268, 3);
    ctx.fillStyle = n.color || '#c9a96e';
    ctx.fillRect(x, y+24, 268 * (n.life / n.maxLife), 3);
    ctx.restore();
  }
}

// Simple icons used by notifications
function drawFireIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  const flick = Math.sin(t*0.3)*1.5;
  ctx.fillStyle = '#ff6622';
  ctx.beginPath();
  ctx.moveTo(-5, 8); ctx.quadraticCurveTo(-7, 0, -2, -3);
  ctx.quadraticCurveTo(-1, 0, 1, -4 + flick);
  ctx.quadraticCurveTo(3, -8, 6, -2);
  ctx.quadraticCurveTo(8, 6, 0, 9);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath(); ctx.arc(0, 4, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawWingIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#aaccff';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -8, -12, -4);
  ctx.quadraticCurveTo(-6, 0, 0, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -8, 12, -4);
  ctx.quadraticCurveTo(6, 0, 0, 0);
  ctx.fill();
  ctx.fillStyle = '#f4e6c8';
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawMagnetIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#cc44dd';
  ctx.fillRect(-7, -8, 4, 14);
  ctx.fillRect(3, -8, 4, 14);
  ctx.fillRect(-7, -8, 14, 4);
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-7, 2, 4, 4);
  ctx.fillRect(3, 2, 4, 4);
  ctx.restore();
}
function drawHourglassIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#88cc44';
  ctx.beginPath();
  ctx.moveTo(-7, -8); ctx.lineTo(7, -8); ctx.lineTo(0, 0); ctx.lineTo(7, 8); ctx.lineTo(-7, 8); ctx.lineTo(0, 0); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(-8, -10, 16, 2);
  ctx.fillRect(-8, 8, 16, 2);
  ctx.restore();
}
function drawSkullIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#fff4d6';
  ctx.beginPath(); ctx.arc(0, -2, 8, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(-5, 4, 10, 5);
  ctx.fillStyle = '#1a0a0a';
  ctx.beginPath(); ctx.arc(-3, -2, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -2, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(-1, 3, 2, 3);
  ctx.restore();
}
function drawBootIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-4, -8, 6, 12);
  ctx.fillRect(-7, 4, 12, 5);
  ctx.fillStyle = '#7a4a20';
  ctx.fillRect(-7, 8, 12, 2);
  ctx.restore();
}
function drawSwitchIcon(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(-6, 2, 12, 6);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(-1, -8, 2, 10);
  ctx.beginPath(); ctx.arc(0, -8, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ----------------------------------------------------------------------------

function showFloatText(txt, x, y, color='#f4e6c8', size=14) {
  game.floatTexts.push({ txt, x, y, vy: -1.2, life: 60, maxLife: 60, color, size });
}
function updateFloatTexts() {
  for (let i = game.floatTexts.length - 1; i >= 0; i--) {
    const t = game.floatTexts[i];
    t.y += t.vy; t.vy *= 0.96; t.life--;
    if (t.life <= 0) game.floatTexts.splice(i, 1);
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

// ----------------------------------------------------------------------------

//  PARTICLES
// ----------------------------------------------------------------------------
function spawnCoinBurst(x, y) {
  for (let i=0; i<8; i++) {
    game.particles.push({
      x, y,
      vx: (Math.random()-0.5)*4,
      vy: -Math.random()*4-2,
      g: 0.2, life: 30, color:'#f4d35e', size: 3+Math.random()*2,
    });
  }
}
function spawnPuff(x, y, color='#cccccc') {
  for (let i=0; i<6; i++) {
    game.particles.push({
      x, y,
      vx: (Math.random()-0.5)*2,
      vy: -Math.random()*2-0.5,
      g: 0.02, life: 40, color, size: 4+Math.random()*3,
    });
  }
}
function spawnPetals(x, y) {
  const colors = ['#e94f64','#f4a4b9','#f7c948','#f6e7d2'];
  for (let i=0; i<14; i++) {
    game.particles.push({
      x, y,
      vx: (Math.random()-0.5)*5,
      vy: -Math.random()*5-2,
      g: 0.15, life: 60, color: colors[Math.floor(Math.random()*colors.length)],
      size: 3+Math.random()*3, rot: Math.random()*Math.PI, vr: (Math.random()-0.5)*0.3,
    });
  }
}

function updateParticles() {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g;
    if (p.rot !== undefined) p.rot += p.vr;
    p.life--;
    if (p.life <= 0) game.particles.splice(i, 1);
  }
}


//  PARTICLES RENDER
// ----------------------------------------------------------------------------
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


