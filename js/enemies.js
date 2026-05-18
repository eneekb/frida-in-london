"use strict";
// Ennemis : factory, update, sprites, chatter

function maybeChatter(e) {
  // Each enemy randomly says something occasionally
  if (Math.random() < 0.003) {
    const lines = {
      bobby:   ["Halte-là !", "Eh, vous !", "Au nom de la Reine !", "Saperlipopette !", "Stop, je vous dis !"],
      sweep:   ["Du charbon !", "Pousse-toi, p'tite !", "Eh, la dame !", "Tousse tousse..."],
      topboss: ["Mes profits !", "Plus de vapeur !", "Le loyer, le loyer !", "Bah, des artistes...", "Au travail !"],
      smog:    ["Tousse, tousse !", "*pollue royalement*", "Hum hum...", "Mort aux poumons !"],
      dog:     ["Wouaf !", "Grrr...", "Aboie ! Aboie !", "Wraf wraf !"],
      sheep:   ["Bêêê...", "Mééé.", "Bê.", "...zzz..."],
      guard:   ["Pour la Couronne !", "Silence, étrangère !", "...", "On ne passe pas."],
      queen:   ["Nous ne sommes pas amusée.", "Qu'on lui ôte sa perruque !", "Nous sommes la Reine !", "Vil insecte mexicain !"],
    };
    const arr = lines[e.type];
    if (!arr) return;
    const line = arr[Math.floor(Math.random()*arr.length)];
    e.chatter = { text: line, life: 100 };
  }
  if (e.chatter) { e.chatter.life--; if (e.chatter.life <= 0) e.chatter = null; }
}


function makeEnemy(spec) {
  const e = {
    type: spec.type,
    x: spec.x * TILE,
    y: spec.y * TILE,
    vx: 0, vy: 0,
    w: 26, h: 28,
    onGround: false,
    facing: -1,
    phase: Math.random() * Math.PI * 2,
    alive: true,
    deathTimer: 0,
    hp: 1,
  };
  switch (spec.type) {
    case 'bobby':   e.speed = 1.0; break;
    case 'sweep':   e.speed = 1.6; e.h = 26; break;
    case 'topboss': e.speed = 0.7; e.w = 30; e.h = 32; break;
    case 'smog':    e.speed = 0; e.w = 36; e.h = 28; e.flies = true; e.baseY = e.y; break;
    case 'dog':     e.speed = 1.8; e.w = 30; e.h = 22; break;
    case 'sheep':   e.speed = 0.5; e.w = 30; e.h = 24; break;
    case 'guard':   e.speed = 1.1; e.w = 22; e.h = 34; break;
    case 'queen':   e.speed = 0.6; e.w = 38; e.h = 44; e.hp = 3; e.isBoss = true; break;
  }
  return e;
}

// ----------------------------------------------------------------------------

function updateEnemy(e, level) {
  if (!e.alive) {
    e.deathTimer++;
    e.y += 4;
    e.vx *= 0.95;
    return;
  }
  e.phase += 0.1;

  if (e.flies) {
    // smog cloud - drifts in a sine
    e.x += Math.sin(e.phase * 0.3) * 0.7;
    e.y = e.baseY + Math.sin(e.phase * 0.5) * 12;
    return;
  }

  if (e.isBoss) {
    // queen - paces and occasionally hops
    e.vx = e.facing * e.speed;
    e.vy += GRAVITY;
    moveAndCollide(e, level);
    if (e.bumpedLeft || e.bumpedRight) e.facing *= -1;
    e.bumpedLeft = e.bumpedRight = false;
    // edge detection
    const aheadX = e.x + (e.facing > 0 ? e.w + 2 : -2);
    const belowTile = tileAt(level, Math.floor(aheadX/TILE), Math.floor((e.y+e.h+2)/TILE));
    if (!isSolid(belowTile) && e.onGround) e.facing *= -1;
    // jump occasionally
    if (e.onGround && Math.random() < 0.012) {
      e.vy = -8;
      spawnPuff(e.x+e.w/2, e.y+e.h);
    }
    return;
  }

  e.vx = e.facing * e.speed;
  e.vy += GRAVITY;
  moveAndCollide(e, level);
  if (e.bumpedLeft || e.bumpedRight) e.facing *= -1;
  e.bumpedLeft = e.bumpedRight = false;
  // turn around at edge
  if (e.onGround) {
    const aheadX = e.x + (e.facing > 0 ? e.w + 2 : -2);
    const belowTile = tileAt(level, Math.floor(aheadX/TILE), Math.floor((e.y+e.h+2)/TILE));
    if (!isSolid(belowTile)) e.facing *= -1;
  }
}

// ----------------------------------------------------------------------------

function drawEnemy(e, t) {
  if (!e.alive && e.deathTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - e.deathTimer/30);
    ctx.translate(e.x + e.w/2, e.y + e.h/2);
    ctx.rotate(e.deathTimer * 0.15);
  } else {
    ctx.save();
    ctx.translate(e.x + e.w/2, e.y + e.h/2);
  }
  ctx.scale(e.facing < 0 ? -1 : 1, 1);

  switch(e.type) {
    case 'bobby':   drawBobby(t, e); break;
    case 'sweep':   drawSweep(t, e); break;
    case 'topboss': drawTopboss(t, e); break;
    case 'smog':    drawSmog(t, e); break;
    case 'dog':     drawDog(t, e); break;
    case 'sheep':   drawSheep(t, e); break;
    case 'guard':   drawGuard(t, e); break;
    case 'queen':   drawQueen(t, e); break;
  }
  ctx.restore();
}

// Bobby (Victorian policeman, blue uniform, custodian helmet)
function drawBobby(t, e) {
  const bob = Math.sin(t*0.15 + e.phase)*1;
  // body
  ctx.fillStyle = '#1a3a6a';
  ctx.fillRect(-10, -4+bob, 20, 16);
  // belt
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(-10, 4+bob, 20, 2);
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-2, 4+bob, 4, 2);
  // legs
  ctx.fillStyle = '#1a1810';
  ctx.fillRect(-7, 12+bob, 5, 6);
  ctx.fillRect(2, 12+bob, 5, 6);
  // head
  ctx.fillStyle = '#e8c8a8';
  ctx.beginPath(); ctx.ellipse(0,-10+bob,7,8,0,0,Math.PI*2); ctx.fill();
  // helmet (custodian - tall rounded)
  ctx.fillStyle = '#1a2a4a';
  ctx.beginPath();
  ctx.moveTo(-8, -10+bob);
  ctx.lineTo(-7, -22+bob);
  ctx.quadraticCurveTo(0, -28+bob, 7, -22+bob);
  ctx.lineTo(8, -10+bob);
  ctx.closePath(); ctx.fill();
  // helmet badge
  ctx.fillStyle = '#c8a830';
  ctx.beginPath(); ctx.arc(0, -18+bob, 2, 0, Math.PI*2); ctx.fill();
  // chinstrap
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-7, -10+bob, 14, 1);
  // angry mustache
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-4, -8+bob, 8, 2);
  // eyes
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-3, -12+bob, 2, 2);
  ctx.fillRect(1, -12+bob, 2, 2);
  // angry eyebrows
  ctx.fillRect(-4, -14+bob, 3, 1);
  ctx.fillRect(1, -14+bob, 3, 1);
  // baton
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(9, 0+bob, 8, 2);
}

// Sweep (chimney sweep boy, sooty)
function drawSweep(t, e) {
  const bob = Math.sin(t*0.2 + e.phase)*1;
  // body - tattered grey
  ctx.fillStyle = '#3a3a40';
  ctx.fillRect(-9, -2+bob, 18, 14);
  // soot patches
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-5, 4+bob, 4, 3);
  ctx.fillRect(3, -1+bob, 3, 4);
  // legs
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-7, 12+bob, 5, 4);
  ctx.fillRect(2, 12+bob, 5, 4);
  // head
  ctx.fillStyle = '#a89888';
  ctx.beginPath(); ctx.ellipse(0,-8+bob,6,7,0,0,Math.PI*2); ctx.fill();
  // soot on face
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-4, -4+bob, 3, 1);
  ctx.fillRect(2, -5+bob, 2, 1);
  // hat
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-7, -14+bob, 14, 4);
  ctx.fillRect(-5, -18+bob, 10, 5);
  // eyes (wide, slightly creepy)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4, -10+bob, 2, 2);
  ctx.fillRect(2, -10+bob, 2, 2);
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-3, -10+bob, 1, 2);
  ctx.fillRect(3, -10+bob, 1, 2);
  // brush
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(9, -4+bob, 2, 12);
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.arc(10, -6+bob, 4, 0, Math.PI*2);
  ctx.fill();
}

// Top-Hat Boss (factory owner, fat with monocle)
function drawTopboss(t, e) {
  const bob = Math.sin(t*0.1 + e.phase)*1.5;
  // belly
  ctx.fillStyle = '#1a1010';
  ctx.beginPath();
  ctx.ellipse(0, 2+bob, 14, 10, 0, 0, Math.PI*2);
  ctx.fill();
  // waistcoat
  ctx.fillStyle = '#7a3030';
  ctx.beginPath();
  ctx.ellipse(0, 4+bob, 10, 7, 0, 0, Math.PI*2);
  ctx.fill();
  // watch chain
  ctx.fillStyle = '#f4d35e';
  for (let i=0; i<5; i++) ctx.fillRect(-6+i*3, 3+bob, 2, 1);
  // arms
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(-15, -2+bob, 5, 10);
  ctx.fillRect(10, -2+bob, 5, 10);
  // legs
  ctx.fillRect(-7, 11+bob, 5, 7);
  ctx.fillRect(2, 11+bob, 5, 7);
  // head
  ctx.fillStyle = '#f4c8a8';
  ctx.beginPath(); ctx.arc(0, -8+bob, 7, 0, Math.PI*2); ctx.fill();
  // mutton chops
  ctx.fillStyle = '#8a4a20';
  ctx.fillRect(-8, -8+bob, 2, 6);
  ctx.fillRect(6, -8+bob, 2, 6);
  // top hat
  ctx.fillStyle = '#0a0506';
  ctx.fillRect(-9, -15+bob, 18, 2);
  ctx.fillRect(-7, -25+bob, 14, 10);
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(-7, -19+bob, 14, 1);
  // monocle
  ctx.strokeStyle = '#c8a830';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(3, -8+bob, 3, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle = '#aaeeff';
  ctx.beginPath(); ctx.arc(3, -8+bob, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#c8a830'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(6, -6+bob); ctx.lineTo(8, -2+bob); ctx.stroke();
  // eye (one normal)
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-4, -9+bob, 2, 2);
  // angry mouth + cigar
  ctx.fillStyle = '#5a2010';
  ctx.fillRect(-2, -4+bob, 5, 1);
  ctx.fillStyle = '#7a4a20';
  ctx.fillRect(3, -5+bob, 5, 2);
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(8, -5+bob, 1, 2);
  // cigar smoke
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  for (let i=0; i<3; i++) {
    ctx.beginPath();
    ctx.arc(10+Math.sin(t*0.05+i)*1, -8+bob-i*3, 2-i*0.5, 0, Math.PI*2);
    ctx.fill();
  }
}

// Smog Cloud (flying enemy)
function drawSmog(t, e) {
  const wob = Math.sin(t*0.1 + e.phase)*1;
  // dark cloud
  ctx.fillStyle = '#3a2a3a';
  for (let i=0; i<5; i++) {
    const a = (i/5)*Math.PI*2;
    ctx.beginPath();
    ctx.arc(Math.cos(a)*8, Math.sin(a)*5+wob, 8, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0+wob, 12, 0, Math.PI*2);
  ctx.fill();
  // angry face
  ctx.fillStyle = '#f4c534';
  ctx.fillRect(-5, -3+wob, 3, 2);
  ctx.fillRect(2, -3+wob, 3, 2);
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-4, -3+wob, 1, 2);
  ctx.fillRect(3, -3+wob, 1, 2);
  // angry mouth
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-3, 3+wob, 6, 1);
  ctx.fillRect(-3, 3+wob, 1, 2);
  ctx.fillRect(2, 3+wob, 1, 2);
}

// Dog (Hound of the Baskervilles)
function drawDog(t, e) {
  const bob = Math.sin(t*0.3 + e.phase)*1;
  // body
  ctx.fillStyle = '#3a2a20';
  ctx.beginPath();
  ctx.ellipse(0, 3+bob, 12, 6, 0, 0, Math.PI*2);
  ctx.fill();
  // legs
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-9, 8+bob, 3, 4);
  ctx.fillRect(-4, 8+bob, 3, 4);
  ctx.fillRect(3, 8+bob, 3, 4);
  ctx.fillRect(7, 8+bob, 3, 4);
  // tail
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(-14, -1+bob, 5, 3);
  ctx.fillRect(-16, -3+bob, 3, 4);
  // head
  ctx.fillStyle = '#3a2a20';
  ctx.beginPath();
  ctx.ellipse(10, -1+bob, 6, 5, 0, 0, Math.PI*2);
  ctx.fill();
  // snout
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(13, 0+bob, 5, 4);
  ctx.fillStyle = '#0a0506';
  ctx.fillRect(17, 0+bob, 2, 2);
  // ears
  ctx.fillStyle = '#1a1008';
  ctx.beginPath();
  ctx.moveTo(8, -5+bob); ctx.lineTo(6, -10+bob); ctx.lineTo(10, -7+bob);
  ctx.closePath(); ctx.fill();
  // eye glowing
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(10, -2+bob, 2, 2);
  // teeth
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(13, 3+bob); ctx.lineTo(15, 5+bob); ctx.lineTo(17, 3+bob);
  ctx.fill();
}

// Sheep (slow, big wool)
function drawSheep(t, e) {
  const bob = Math.sin(t*0.1 + e.phase)*1;
  // wool body
  ctx.fillStyle = '#f4e8d4';
  for (let i=0; i<7; i++) {
    const a = (i/7)*Math.PI*2;
    ctx.beginPath();
    ctx.arc(Math.cos(a)*9, Math.sin(a)*5+bob, 6, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0+bob, 10, 0, Math.PI*2); ctx.fill();
  // legs
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-8, 8+bob, 3, 4);
  ctx.fillRect(-3, 8+bob, 3, 4);
  ctx.fillRect(2, 8+bob, 3, 4);
  ctx.fillRect(6, 8+bob, 3, 4);
  // head (dark)
  ctx.fillStyle = '#2a1810';
  ctx.beginPath();
  ctx.ellipse(11, -1+bob, 5, 4, 0, 0, Math.PI*2);
  ctx.fill();
  // ear
  ctx.beginPath();
  ctx.moveTo(10, -4+bob); ctx.lineTo(8, -7+bob); ctx.lineTo(12, -6+bob);
  ctx.fill();
  // eye - silly wide
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(13, -1+bob, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0a0506';
  ctx.fillRect(13, -1+bob, 1, 1);
}

// Royal Guard (red coat, big bearskin hat)
function drawGuard(t, e) {
  const bob = Math.sin(t*0.15 + e.phase)*1;
  // body red coat
  ctx.fillStyle = '#c83030';
  ctx.fillRect(-8, -2+bob, 16, 16);
  // belt
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(-8, 6+bob, 16, 2);
  // buttons (gold)
  ctx.fillStyle = '#f4d35e';
  for (let i=0;i<3;i++) {
    ctx.beginPath(); ctx.arc(0, 0+i*4+bob, 1.2, 0, Math.PI*2); ctx.fill();
  }
  // legs (black trousers)
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(-6, 14+bob, 5, 6);
  ctx.fillRect(1, 14+bob, 5, 6);
  // boots
  ctx.fillStyle = '#0a0506';
  ctx.fillRect(-7, 19+bob, 6, 2);
  ctx.fillRect(1, 19+bob, 6, 2);
  // head
  ctx.fillStyle = '#e8c8a8';
  ctx.beginPath(); ctx.ellipse(0,-7+bob,5,6,0,0,Math.PI*2); ctx.fill();
  // bearskin hat (huge)
  ctx.fillStyle = '#0a0506';
  ctx.beginPath();
  ctx.moveTo(-7, -8+bob);
  ctx.quadraticCurveTo(-9, -22+bob, 0, -26+bob);
  ctx.quadraticCurveTo(9, -22+bob, 7, -8+bob);
  ctx.closePath(); ctx.fill();
  // chin strap
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-5, -8+bob, 10, 1);
  // eyes stoic
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-3, -9+bob, 1, 2);
  ctx.fillRect(2, -9+bob, 1, 2);
  // mouth (stern line)
  ctx.fillRect(-2, -4+bob, 4, 1);
  // rifle
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(7, -8+bob, 2, 18);
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(7, -10+bob, 2, 3);
}

// Queen (boss - Reine Victorienne caricaturée)
function drawQueen(t, e) {
  const bob = Math.sin(t*0.1 + e.phase)*1;
  // huge dress
  ctx.fillStyle = '#1a1010';
  ctx.beginPath();
  ctx.moveTo(-18, 22);
  ctx.lineTo(-12, 0+bob);
  ctx.lineTo(12, 0+bob);
  ctx.lineTo(18, 22);
  ctx.closePath(); ctx.fill();
  // dress trim
  ctx.fillStyle = '#3a3030';
  ctx.fillRect(-18, 20, 36, 2);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(-18, 21, 36, 1);
  // sash
  ctx.fillStyle = '#1a3a8a';
  ctx.beginPath();
  ctx.moveTo(-10, -2+bob);
  ctx.lineTo(10, 8+bob);
  ctx.lineTo(8, 12+bob);
  ctx.lineTo(-12, 2+bob);
  ctx.closePath(); ctx.fill();
  // bust
  ctx.fillStyle = '#0a0506';
  ctx.beginPath();
  ctx.ellipse(0, -4+bob, 12, 6, 0, 0, Math.PI*2);
  ctx.fill();
  // arms
  ctx.fillStyle = '#0a0506';
  ctx.fillRect(-15, -3+bob, 4, 12);
  ctx.fillRect(11, -3+bob, 4, 12);
  // hands
  ctx.fillStyle = '#f4d4b8';
  ctx.beginPath(); ctx.arc(-13, 10+bob, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(13, 10+bob, 2.5, 0, Math.PI*2); ctx.fill();
  // head (pinched, stern)
  ctx.fillStyle = '#f4d4b8';
  ctx.beginPath(); ctx.ellipse(0, -15+bob, 9, 11, 0, 0, Math.PI*2); ctx.fill();
  // double chin
  ctx.beginPath(); ctx.arc(0, -7+bob, 6, 0, Math.PI); ctx.fill();
  // hair (grey, parted, in bun)
  ctx.fillStyle = '#cccccc';
  ctx.beginPath(); ctx.ellipse(0, -22+bob, 10, 5, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(-9, -19+bob, 2, 6);
  ctx.fillRect(7, -19+bob, 2, 6);
  // small bun
  ctx.beginPath(); ctx.arc(0, -28+bob, 5, 0, Math.PI*2); ctx.fill();
  // small crown
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(-5, -32+bob, 10, 3);
  for (let i=0; i<3; i++) {
    ctx.beginPath();
    ctx.moveTo(-5+i*5, -32+bob);
    ctx.lineTo(-3+i*5, -36+bob);
    ctx.lineTo(0+i*5, -32+bob);
    ctx.fill();
  }
  ctx.fillStyle = '#c83030';
  ctx.beginPath(); ctx.arc(0, -35+bob, 1, 0, Math.PI*2); ctx.fill();
  // sour eyes (we are not amused)
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(-4, -17+bob, 2, 1);
  ctx.fillRect(2, -17+bob, 2, 1);
  // brows
  ctx.fillRect(-5, -19+bob, 3, 1);
  ctx.fillRect(2, -19+bob, 3, 1);
  // pinched mouth
  ctx.fillStyle = '#7a2020';
  ctx.fillRect(-2, -11+bob, 4, 1);
  // HP bar above
  if (e.alive) {
    const bw = 36;
    ctx.fillStyle = '#3a1010';
    ctx.fillRect(-bw/2, -42+bob, bw, 4);
    ctx.fillStyle = '#e84040';
    ctx.fillRect(-bw/2, -42+bob, bw * (e.hp/3), 4);
    ctx.strokeStyle = '#f4d35e';
    ctx.lineWidth = 1;
    ctx.strokeRect(-bw/2, -42+bob, bw, 4);
  }
}

// --- PICKUPS ---

function drawChatter(e) {
  const cx = e.x + e.w/2;
  const cy = e.y - 10;
  const txt = e.chatter.text;
  ctx.save();
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 12;
  const fade = Math.min(1, e.chatter.life / 30);
  ctx.globalAlpha = fade;
  // bubble background
  ctx.fillStyle = '#f4e6c8';
  ctx.strokeStyle = '#3a2010';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(cx-w/2, cy-12, w, 18, 4) : ctx.rect(cx-w/2, cy-12, w, 18);
  ctx.fill(); ctx.stroke();
  // tail
  ctx.beginPath();
  ctx.moveTo(cx-4, cy+5); ctx.lineTo(cx, cy+12); ctx.lineTo(cx+4, cy+5);
  ctx.closePath(); ctx.fillStyle = '#f4e6c8'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx-4, cy+5); ctx.lineTo(cx, cy+12); ctx.lineTo(cx+4, cy+5);
  ctx.strokeStyle = '#3a2010'; ctx.stroke();
  // text
  ctx.fillStyle = '#3a2010';
  ctx.fillText(txt, cx, cy-3);
  ctx.restore();
}


