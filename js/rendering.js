"use strict";
// Décors, tiles, et toute la mise en scène de la scène

function drawBackground(theme, t) {
  switch(theme) {
    case 'london':  drawLondonBG(t); break;
    case 'factory': drawFactoryBG(t); break;
    case 'moor':    drawMoorBG(t); break;
    case 'bigben':  drawBigBenBG(t); break;
    default: ctx.fillStyle='#87729a'; ctx.fillRect(0,0,W,H);
  }
  // Theme decor overlay if objective met
  drawDecorOverlay(t);
}

function drawDecorOverlay(t) {
  const d = game.decorTriggered;
  const tr = Math.min(1, game.decorTransition / 60);
  // ===== LANTERN: street lights all bright, warm orange glow, dusk darkens =====
  if (d.lantern) {
    ctx.save();
    ctx.globalAlpha = tr * 0.55;
    ctx.fillStyle = '#1a0f24';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Many floating warm halos
    for (let i = 0; i < 12; i++) {
      const lx = (i*97 + Math.sin(t*0.005+i)*30) % W;
      const ly = H*0.55 + Math.cos(t*0.007+i)*40;
      const radius = 50 + Math.sin(t*0.05+i)*8;
      const grad = ctx.createRadialGradient(lx, ly, 4, lx, ly, radius);
      grad.addColorStop(0, `rgba(255,200,80,${0.6*tr})`);
      grad.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(lx-radius, ly-radius, radius*2, radius*2);
    }
  }
  // ===== GEAR: factory becomes mechanical nightmare =====
  if (d.gear) {
    ctx.save();
    ctx.globalAlpha = tr * 0.5;
    ctx.fillStyle = '#5a0808';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Giant rotating gears in BG
    for (let i = 0; i < 6; i++) {
      const gx = (i*200 + 80) % (W+150) - 50;
      const gy = 80 + (i%2)*180;
      const r = 50 + i*8;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(t * (i%2===0 ? 0.02 : -0.025) + i);
      ctx.globalAlpha = tr * 0.4;
      ctx.fillStyle = '#8a2020';
      for (let j = 0; j < 12; j++) {
        ctx.save(); ctx.rotate(j*Math.PI/6);
        ctx.fillRect(-6, -r-10, 12, 18);
        ctx.restore();
      }
      ctx.fillStyle = '#c82020';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a0808';
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
  // ===== ROSE: moor blooms, sky brightens =====
  if (d.rose) {
    ctx.save();
    // Brighten the sky to a sunny pinkish-blue
    const grad = ctx.createLinearGradient(0, 0, 0, H*0.7);
    grad.addColorStop(0, `rgba(180, 200, 255, ${0.4*tr})`);
    grad.addColorStop(1, `rgba(255, 200, 220, ${0.3*tr})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H*0.7);
    ctx.restore();
    // Big roses floating in the air
    for (let i = 0; i < 20; i++) {
      const rx = ((i*113 + t*0.4) % (W+60)) - 30;
      const ry = (i*53 % H) - 20 + Math.sin(t*0.02 + i)*8;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.globalAlpha = tr * 0.85;
      const sz = 0.6 + (i%3)*0.3;
      ctx.scale(sz, sz);
      drawFlower(0, 0, 7, i%2===0 ? '#e94f64' : '#f4486c', '#f4d35e');
      ctx.restore();
    }
  }
  // ===== BRUSH: world becomes a Frida painting =====
  if (d.brush) {
    ctx.save();
    // Bright colorful overlay tinted with rainbow strokes
    ctx.globalAlpha = tr * 0.45;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#3a7a3a');
    grad.addColorStop(0.3, '#f4c534');
    grad.addColorStop(0.6, '#e94f64');
    grad.addColorStop(1,   '#1a3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Brush strokes
    const colors = ['#c82040','#f4c534','#1a5aa8','#3a7a3a','#e94f64','#fff4d6'];
    for (let i = 0; i < 30; i++) {
      const sx = (i*61 + Math.sin(t*0.005+i)*15) % W;
      const sy = (i*37 + Math.cos(t*0.007+i)*20) % H;
      ctx.save();
      ctx.globalAlpha = tr * 0.5;
      ctx.fillStyle = colors[i%colors.length];
      ctx.translate(sx, sy);
      ctx.rotate(i*0.5);
      ctx.fillRect(-12, -2, 24, 4);
      ctx.restore();
    }
    // Subtle dancing flowers
    for (let i = 0; i < 12; i++) {
      const fx = (i*83 + t*0.3) % W;
      const fy = (i*67) % H;
      ctx.save();
      ctx.globalAlpha = tr * 0.8;
      drawFlower(fx, fy, 5+i%3, colors[i%colors.length], '#fff4d6');
      ctx.restore();
    }
  }
}

function drawLondonBG(t) {
  // dusk sky gradient
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#3d2c4a');
  g.addColorStop(0.4, '#7c5e7a');
  g.addColorStop(0.8, '#c98a6b');
  g.addColorStop(1, '#5a3e44');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // moon
  ctx.fillStyle = '#fff4d6';
  ctx.beginPath(); ctx.arc(W-120, 80, 32, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7c5e7a';
  ctx.beginPath(); ctx.arc(W-105, 70, 28, 0, Math.PI*2); ctx.fill();

  // distant skyline parallax
  const offX = game.camera.x * 0.2;
  ctx.fillStyle = 'rgba(40, 25, 50, 0.7)';
  for (let i = 0; i < 14; i++) {
    const x = (i*140 - offX) % (W + 200) - 100;
    const bh = 80 + ((i*37)%70);
    ctx.fillRect(x, H-180-bh, 110, bh+50);
    // chimneys
    ctx.fillRect(x+15, H-180-bh-15, 12, 18);
    ctx.fillRect(x+60, H-180-bh-20, 10, 22);
    // smog from chimneys
    ctx.fillStyle = 'rgba(80,60,80,0.4)';
    ctx.beginPath();
    ctx.arc(x+21, H-180-bh-25+Math.sin(t*0.01+i)*3, 16, 0, Math.PI*2);
    ctx.arc(x+34, H-180-bh-35+Math.sin(t*0.013+i)*3, 12, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(40, 25, 50, 0.7)';
    // windows
    for (let wy=0; wy<3; wy++) for (let wx=0; wx<3; wx++) {
      const lit = ((i+wx+wy*2)%5)===0;
      ctx.fillStyle = lit ? '#f7c948' : '#2a1a2e';
      ctx.fillRect(x+15+wx*30, H-160-bh+wy*22, 10, 12);
    }
    ctx.fillStyle = 'rgba(40, 25, 50, 0.7)';
  }

  // closer foggy band
  ctx.fillStyle = 'rgba(180, 160, 170, 0.25)';
  ctx.fillRect(0, H-140 + Math.sin(t*0.01)*5, W, 60);

  // Floating Union Jack on a pole
  const flagX = (W - 250 + Math.sin(t*0.005)*8) | 0;
  const flagY = 50;
  drawUnionJackFlag(flagX, flagY, t, 0.8);

  // Victorian carriage in foreground silhouette
  drawCarriage(t);
}

function drawUnionJackFlag(x, y, t, scale=1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // pole
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(0, 0, 3, 120);
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(1.5, -3, 4, 0, Math.PI*2); ctx.fill();
  // flag (wavy)
  const wave = Math.sin(t*0.08)*4;
  const W_F = 70, H_F = 42;
  ctx.save();
  ctx.translate(3, 5);
  // Background blue
  ctx.fillStyle = '#1a3a8a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i <= W_F; i+=4) {
    const wy = Math.sin((i*0.1)+t*0.08)*3;
    ctx.lineTo(i, wy);
  }
  ctx.lineTo(W_F, H_F + wave*0.5);
  for (let i = W_F; i >= 0; i-=4) {
    const wy = Math.sin((i*0.1)+t*0.08)*3;
    ctx.lineTo(i, H_F + wy);
  }
  ctx.closePath();
  ctx.fill();
  // Simplified Union Jack pattern
  ctx.clip();
  // White diagonal cross (St Andrew)
  ctx.strokeStyle = '#f4f4f4';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W_F, H_F); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W_F,0); ctx.lineTo(0, H_F); ctx.stroke();
  // Red diagonal (St Patrick)
  ctx.strokeStyle = '#c82030';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W_F, H_F); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W_F,0); ctx.lineTo(0, H_F); ctx.stroke();
  // White cross (St George border)
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(0, H_F/2-7, W_F, 14);
  ctx.fillRect(W_F/2-7, 0, 14, H_F);
  // Red cross
  ctx.fillStyle = '#c82030';
  ctx.fillRect(0, H_F/2-3, W_F, 6);
  ctx.fillRect(W_F/2-3, 0, 6, H_F);
  ctx.restore();
  ctx.restore();
}

function drawCarriage(t) {
  // Slow-moving carriage going RIGHT-TO-LEFT (head leads the way)
  const speed = 0.4;
  const cx = (W + 100) - ((t * speed) % (W + 280));
  const cy = H - 175;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 8, 15, 0.85)';
  // horse (silhouette)
  ctx.beginPath();
  ctx.ellipse(cx, cy+8, 16, 8, 0, 0, Math.PI*2); ctx.fill();
  // legs
  ctx.fillRect(cx-12, cy+12, 3, 12);
  ctx.fillRect(cx-2, cy+12, 3, 12);
  ctx.fillRect(cx+8, cy+12, 3, 12);
  ctx.fillRect(cx+12, cy+12, 3, 12);
  // head
  ctx.beginPath();
  ctx.ellipse(cx-18, cy+2, 6, 5, 0.5, 0, Math.PI*2); ctx.fill();
  // ears
  ctx.beginPath();
  ctx.moveTo(cx-19, cy-4); ctx.lineTo(cx-21, cy-7); ctx.lineTo(cx-17, cy-5);
  ctx.closePath(); ctx.fill();
  // carriage body
  ctx.fillRect(cx+18, cy-10, 38, 22);
  // roof
  ctx.beginPath();
  ctx.moveTo(cx+18, cy-10); ctx.lineTo(cx+22, cy-18); ctx.lineTo(cx+52, cy-18); ctx.lineTo(cx+56, cy-10); ctx.closePath(); ctx.fill();
  // wheels
  const wob = t * 0.1;
  ctx.beginPath(); ctx.arc(cx+25, cy+14, 7, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+50, cy+14, 7, 0, Math.PI*2); ctx.fill();
  // spokes hint
  ctx.strokeStyle = 'rgba(40,30,40,0.4)';
  ctx.lineWidth = 1;
  for (let i=0; i<4; i++) {
    const a = i*Math.PI/2 + wob;
    ctx.beginPath();
    ctx.moveTo(cx+25, cy+14);
    ctx.lineTo(cx+25 + Math.cos(a)*6, cy+14 + Math.sin(a)*6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx+50, cy+14);
    ctx.lineTo(cx+50 + Math.cos(a)*6, cy+14 + Math.sin(a)*6);
    ctx.stroke();
  }
  // small lantern on carriage
  ctx.fillStyle = 'rgba(255, 200, 80, 0.9)';
  ctx.beginPath(); ctx.arc(cx+55, cy-12, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 80, 0.3)';
  ctx.beginPath(); ctx.arc(cx+55, cy-12, 8, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawFactoryBG(t) {
  // sickly green sky
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#2c1d1d');
  g.addColorStop(0.6, '#7a5d3a');
  g.addColorStop(1, '#3a2a1a');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // sun struggling through smog
  ctx.fillStyle = 'rgba(255, 180, 80, 0.4)';
  ctx.beginPath(); ctx.arc(W*0.7, 110, 50, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 180, 80, 0.2)';
  ctx.beginPath(); ctx.arc(W*0.7, 110, 80, 0, Math.PI*2); ctx.fill();

  // factory chimneys far
  const offX = game.camera.x * 0.3;
  for (let i = 0; i < 10; i++) {
    const x = (i*180 - offX) % (W + 300) - 150;
    const ch = 240 + ((i*53)%80);
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(x, H-100-ch, 50, ch);
    ctx.fillStyle = '#1a0e0e';
    ctx.fillRect(x-4, H-100-ch, 58, 12);
    // smoke
    ctx.fillStyle = 'rgba(60,50,45,0.6)';
    for (let s=0; s<4; s++) {
      const sx = x+25 + Math.sin(t*0.01 + i + s)*8;
      const sy = H-100-ch - s*30 - (t*0.5 % 30);
      ctx.beginPath();
      ctx.arc(sx, sy, 20-s*2, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // foreground bricks band
  ctx.fillStyle = 'rgba(60,30,30,0.5)';
  ctx.fillRect(0, H-80, W, 80);
}

function drawMoorBG(t) {
  // overcast misty sky
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#7a8a9a');
  g.addColorStop(0.6, '#a8b4be');
  g.addColorStop(1, '#5a6a4a');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // distant rolling hills
  const offX = game.camera.x * 0.25;
  for (let layer = 2; layer >= 0; layer--) {
    ctx.fillStyle = `rgba(${50+layer*30},${70+layer*30},${60+layer*30},0.9)`;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = -100; x <= W + 100; x += 20) {
      const wx = x + offX * (0.5 + layer*0.2);
      const y = H - 150 - layer*60 + Math.sin(wx*0.008 + layer)*40 + Math.cos(wx*0.003)*30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  // mist
  ctx.fillStyle = 'rgba(220,220,220,0.25)';
  ctx.fillRect(0, H-200+Math.sin(t*0.01)*8, W, 80);
  ctx.fillStyle = 'rgba(220,220,220,0.15)';
  ctx.fillRect(0, H-260+Math.sin(t*0.008+1)*10, W, 50);

  // tiny crows
  ctx.fillStyle = '#1a1a1a';
  for (let i=0;i<5;i++) {
    const cx = ((t*0.5 + i*180) % (W+200)) - 100;
    const cy = 80 + i*30 + Math.sin(t*0.05 + i)*6;
    const flap = Math.sin(t*0.2 + i) > 0;
    ctx.beginPath();
    if (flap) { ctx.moveTo(cx-6, cy); ctx.lineTo(cx, cy-3); ctx.lineTo(cx+6, cy); }
    else      { ctx.moveTo(cx-6, cy-2); ctx.lineTo(cx, cy+2); ctx.lineTo(cx+6, cy-2); }
    ctx.stroke();
  }
}

function drawBigBenBG(t) {
  // night sky
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#0d1530');
  g.addColorStop(0.6, '#2a2050');
  g.addColorStop(1, '#503060');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // stars
  for (let i=0; i<80; i++) {
    const sx = (i*97) % W;
    const sy = (i*53) % (H*0.7);
    const tw = (Math.sin(t*0.05 + i)*0.5+0.5);
    ctx.fillStyle = `rgba(255,255,220,${0.4+tw*0.5})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
  // big moon
  ctx.fillStyle = '#f7e9b5';
  ctx.beginPath(); ctx.arc(W*0.75, 100, 60, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for (let i=0;i<6;i++) {
    ctx.beginPath();
    ctx.arc(W*0.75 + Math.cos(i)*30, 100 + Math.sin(i)*30, 6+i, 0, Math.PI*2);
    ctx.fill();
  }

  // huge clock tower silhouette in background
  const offX = game.camera.x * 0.4;
  ctx.fillStyle = 'rgba(20,15,35,0.8)';
  const tx = W*0.5 - offX*0.5;
  ctx.fillRect(tx-60, 200, 120, H-200);
  ctx.fillRect(tx-80, 180, 160, 30);
  // clock face
  ctx.fillStyle = '#f7e9b5';
  ctx.beginPath(); ctx.arc(tx, 280, 38, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2a4a';
  // hands - 10:10 classic
  ctx.save();
  ctx.translate(tx, 280);
  ctx.lineWidth = 3; ctx.strokeStyle = '#3a2a4a';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-20,-12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(20,-15); ctx.stroke();
  ctx.restore();
  // spire
  ctx.fillStyle = 'rgba(20,15,35,0.8)';
  ctx.beginPath();
  ctx.moveTo(tx-30, 180); ctx.lineTo(tx, 100); ctx.lineTo(tx+30, 180);
  ctx.closePath(); ctx.fill();
}

// --- TILE RENDERING ---
function drawTiles(level, t) {
  const cx0 = Math.floor(game.camera.x / TILE);
  const cy0 = Math.floor(game.camera.y / TILE);
  const cx1 = Math.min(level.w, cx0 + Math.ceil(W/TILE) + 2);
  const cy1 = Math.min(level.h, cy0 + Math.ceil(H/TILE) + 2);
  for (let y = cy0; y < cy1; y++) {
    for (let x = cx0; x < cx1; x++) {
      if (x<0||y<0) continue;
      const c = level.grid[y][x];
      if (c === '.') continue;
      drawTile(c, x*TILE, y*TILE, level.theme, t, x, y, level);
    }
  }
}

function drawTile(c, px, py, theme, t, tx, ty, level) {
  switch (c) {
    case '#': drawGround(px, py, theme, tx, ty, level); break;
    case '=': drawBrick(px, py, theme); break;
    case '?': drawQBlock(px, py, t); break;
    case '^': drawSpike(px, py, theme); break;
    case 'F': drawFlag(px, py, theme, t); break;
    case '|': drawLamp(px, py, theme, t); break;
    case '-': drawBeam(px, py, theme); break;
    case 'G': drawGear(px, py, t); break;
    case '~': /* drawn as enemy */ break;
    case 'T': drawBarrel(px, py); break;
    case 'B': drawBench(px, py); break;
  }
}

function drawGround(x, y, theme, tx, ty, level) {
  // Top tile vs interior
  const above = ty > 0 ? level.grid[ty-1][tx] : '.';
  const isTop = above !== '#';
  switch(theme) {
    case 'london': {
      ctx.fillStyle = '#564a40';
      ctx.fillRect(x, y, TILE, TILE);
      // cobblestones pattern
      ctx.fillStyle = '#6b5a4a';
      for (let i=0; i<2; i++) for (let j=0; j<2; j++) {
        ctx.beginPath();
        ctx.arc(x + 8 + i*16, y + 8 + j*16, 6, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle = '#4a3a30';
      ctx.fillRect(x, y, TILE, 2);
      if (isTop) {
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(x, y, TILE, 3);
      }
      break;
    }
    case 'factory': {
      ctx.fillStyle = '#4a2a20';
      ctx.fillRect(x, y, TILE, TILE);
      // rivets
      ctx.fillStyle = '#2a1a10';
      for (let i=0;i<2;i++) for (let j=0;j<2;j++) {
        ctx.beginPath();
        ctx.arc(x+8+i*16, y+8+j*16, 2, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#6a4a3a';
      ctx.fillRect(x, y, TILE, 2);
      if (isTop) {
        ctx.fillStyle = '#8a5a3a';
        ctx.fillRect(x, y, TILE, 3);
      }
      break;
    }
    case 'moor': {
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(x, y, TILE, TILE);
      // earth speckle
      ctx.fillStyle = '#3a2a1a';
      for (let i=0;i<5;i++) {
        ctx.fillRect(x + ((tx*7+i*11)%TILE), y + ((ty*5+i*9)%TILE), 2, 2);
      }
      if (isTop) {
        // grass top
        ctx.fillStyle = '#5a7a3a';
        ctx.fillRect(x, y, TILE, 6);
        ctx.fillStyle = '#7a9a4a';
        for (let i=0;i<6;i++) {
          ctx.fillRect(x + ((tx*3+i*5)%TILE), y-1, 2, 5);
        }
      }
      break;
    }
    case 'bigben': {
      // stone block
      ctx.fillStyle = '#5a5466';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#403a4a';
      ctx.fillRect(x, y+TILE-2, TILE, 2);
      ctx.fillRect(x+TILE-2, y, 2, TILE);
      ctx.fillStyle = '#706a82';
      ctx.fillRect(x, y, TILE, 2);
      ctx.fillRect(x, y, 2, TILE);
      if (isTop) {
        ctx.fillStyle = '#8a84a0';
        ctx.fillRect(x, y, TILE, 3);
      }
      break;
    }
  }
}

function drawBrick(x, y, theme) {
  ctx.fillStyle = theme==='factory'?'#7a4a3a':'#a86048';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = theme==='factory'?'#4a2a20':'#6a3024';
  // mortar lines
  ctx.fillRect(x, y, TILE, 2);
  ctx.fillRect(x, y+15, TILE, 2);
  ctx.fillRect(x, y+TILE-2, TILE, 2);
  ctx.fillRect(x+10, y+2, 2, 14);
  ctx.fillRect(x+22, y+2, 2, 14);
  ctx.fillRect(x+16, y+17, 2, 14);
  ctx.fillRect(x, y, 2, TILE);
  ctx.fillRect(x+TILE-2, y, 2, TILE);
  // highlights
  ctx.fillStyle = theme==='factory'?'#9a6a4a':'#c87858';
  ctx.fillRect(x+2, y+2, 8, 2);
  ctx.fillRect(x+18, y+17, 6, 2);
}

function drawQBlock(x, y, t) {
  const pulse = Math.sin(t*0.1)*0.5 + 0.5;
  ctx.fillStyle = '#e8a838';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#b07820';
  ctx.fillRect(x, y, TILE, 2);
  ctx.fillRect(x, y+TILE-2, TILE, 2);
  ctx.fillRect(x, y, 2, TILE);
  ctx.fillRect(x+TILE-2, y, 2, TILE);
  // rivets
  ctx.fillStyle = '#6a4810';
  [[4,4],[TILE-6,4],[4,TILE-6],[TILE-6,TILE-6]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.arc(x+dx,y+dy,2,0,Math.PI*2); ctx.fill();
  });
  // question mark
  ctx.fillStyle = `rgba(255,255,255,${0.5+pulse*0.4})`;
  ctx.font = 'bold 22px Georgia';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('?', x+TILE/2, y+TILE/2+1);
  ctx.fillStyle = '#3a2810';
  ctx.fillText('?', x+TILE/2, y+TILE/2);
}

function drawSpike(x, y, theme) {
  ctx.fillStyle = theme==='factory'?'#aaaaaa':'#3a3038';
  const baseY = y + TILE;
  for (let i=0; i<3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 2 + i*10, baseY);
    ctx.lineTo(x + 7 + i*10, y + 4);
    ctx.lineTo(x + 12 + i*10, baseY);
    ctx.closePath();
    ctx.fill();
    // highlight
    ctx.fillStyle = theme==='factory'?'#dddddd':'#5a4858';
    ctx.beginPath();
    ctx.moveTo(x + 4 + i*10, baseY - 2);
    ctx.lineTo(x + 7 + i*10, y + 6);
    ctx.lineTo(x + 7 + i*10, baseY - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = theme==='factory'?'#aaaaaa':'#3a3038';
  }
}

function drawFlag(x, y, theme, t) {
  // pole
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x + TILE/2 - 2, y - TILE*3, 4, TILE*4);
  // British flag-ish - Union Jack-y
  ctx.save();
  ctx.translate(x + TILE/2 + 2, y - TILE*3 + 4);
  const wave = Math.sin(t*0.1) * 3;
  ctx.fillStyle = '#1a3a8a';
  ctx.fillRect(0, 0, 36, 24);
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 10, 36, 4);
  ctx.fillRect(16, 0, 4, 24);
  ctx.fillStyle = '#c8203a';
  ctx.fillRect(0, 11, 36, 2);
  ctx.fillRect(17, 0, 2, 24);
  // diagonals
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(36,24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(36,0); ctx.lineTo(0,24); ctx.stroke();
  ctx.strokeStyle = '#c8203a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(36,24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(36,0); ctx.lineTo(0,24); ctx.stroke();
  ctx.restore();
  // ball top
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath(); ctx.arc(x+TILE/2, y-TILE*3, 5, 0, Math.PI*2); ctx.fill();
}

function drawLamp(x, y, theme, t) {
  // gas lamp
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(x+TILE/2-2, y, 4, TILE);
  ctx.beginPath(); ctx.arc(x+TILE/2, y, 8, 0, Math.PI*2); ctx.fill();
  // flame
  const flick = Math.sin(t*0.3)*2;
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath();
  ctx.moveTo(x+TILE/2, y-12+flick);
  ctx.lineTo(x+TILE/2-3, y-2);
  ctx.lineTo(x+TILE/2+3, y-2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffeaa8';
  ctx.beginPath(); ctx.arc(x+TILE/2, y-4, 2, 0, Math.PI*2); ctx.fill();
  // glow
  ctx.fillStyle = 'rgba(255,200,80,0.15)';
  ctx.beginPath(); ctx.arc(x+TILE/2, y-2, 20, 0, Math.PI*2); ctx.fill();
}

function drawBeam(x, y, theme) {
  ctx.fillStyle = theme==='factory'?'#5a4a3a':'#3a3a3a';
  ctx.fillRect(x, y+12, TILE, 8);
  ctx.fillStyle = theme==='factory'?'#3a2a1a':'#1a1a1a';
  ctx.fillRect(x, y+12, TILE, 2);
  ctx.fillRect(x, y+18, TILE, 2);
  // rivets
  ctx.fillStyle = '#1a1010';
  ctx.beginPath(); ctx.arc(x+6, y+16, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+TILE-6, y+16, 2, 0, Math.PI*2); ctx.fill();
}

function drawGear(x, y, t) {
  const cx = x + TILE/2, cy = y + TILE/2;
  const r = 14;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t*0.05);
  ctx.fillStyle = '#9a3030';
  for (let i=0; i<8; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 4);
    ctx.fillRect(-3, -r-4, 6, 8);
    ctx.restore();
  }
  ctx.fillStyle = '#c84040';
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7a1818';
  ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawBarrel(x, y) {
  ctx.fillStyle = '#7a4a20';
  ctx.fillRect(x+2, y+2, TILE-4, TILE-2);
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(x+2, y+8, TILE-4, 3);
  ctx.fillRect(x+2, y+TILE-10, TILE-4, 3);
}
function drawBench(x, y) {
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(x, y+10, TILE, 6);
  ctx.fillRect(x+3, y+18, 3, TILE-18);
  ctx.fillRect(x+TILE-6, y+18, 3, TILE-18);
}


