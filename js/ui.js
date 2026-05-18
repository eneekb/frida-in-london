"use strict";
// Écrans : titre, QA Frida, choix de pouvoir, HUD, intermission, win, game over

const FRIDA_QUESTIONS = [
  {
    intro: "Bienvenue, ma chère. Avant que tu n'arpentes les pavés de Londres, dis-moi :",
    question: "Pourquoi suis-je venue affronter cette ville pluvieuse ?",
    answers: [
      { text: "Pour secouer leurs traditions poussiéreuses", correct: true,
        reply: "¡Exacto! Les Anglais ont besoin de couleur. Et de m'écouter." },
      { text: "Pour boire toute leur réserve de thé", correct: false,
        reply: "Tentant, mais non. Quoique..." },
      { text: "Pour épouser un duc", correct: false,
        reply: "Ha ! J'ai déjà un Diego, ça suffit largement." },
    ],
  },
  {
    intro: "Bravo pour les ruelles. Mais l'usine à vapeur t'attend.",
    question: "Sais-tu ce qu'est le smog ?",
    answers: [
      { text: "Un nuage de pollution noire", correct: true,
        reply: "Voilà. Évite-le, il est mortel comme un mari jaloux." },
      { text: "Une danse écossaise", correct: false,
        reply: "Charmant, mais non !" },
      { text: "Une marque de thé", correct: false,
        reply: "Ha ! Tu confonds avec tes théières." },
    ],
  },
  {
    intro: "L'usine est domptée. Maintenant la lande brumeuse, et ses créatures...",
    question: "Que vais-je y croiser ?",
    answers: [
      { text: "Des moutons et un chien démoniaque", correct: true,
        reply: "Sí. Méfie-toi du chien des Baskerville, il a faim." },
      { text: "Un dragon gallois", correct: false,
        reply: "On n'est pas dans cette histoire-là." },
      { text: "Des fées du marais", correct: false,
        reply: "Trop joli pour cette lande sinistre." },
    ],
  },
  {
    intro: "Tu y es presque. Big Ben, son sommet, et la Reine.",
    question: "Quelle est ma véritable arme face à la Couronne ?",
    answers: [
      { text: "Ma peinture et mon refus", correct: true,
        reply: "¡Sí! L'art désarme les monarques mieux qu'un sabre." },
      { text: "Mon thé bouillant", correct: false,
        reply: "Inutile, elle en boit dix fois par jour." },
      { text: "Un nœud papillon", correct: false,
        reply: "Tu te moques de moi ?" },
    ],
  },
];

//  FRIDA QA SCREEN — Frida poses a question, player picks 1/2/3
// ============================================================================
function drawFridaQA(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, H);
  // Card
  const cardX = 60, cardY = 60, cardW = W-120, cardH = H-120;
  ctx.fillStyle = 'rgba(244,230,200,0.98)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 3;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 1;
  ctx.strokeRect(cardX+6, cardY+6, cardW-12, cardH-12);
  // Frida portrait left
  ctx.save();
  ctx.translate(cardX+110, cardY+170);
  ctx.scale(3.2, 3.2);
  const fakeP = { x:-11, y:-15, w:22, h:30, facing:1, walkPhase:0, onGround:true,
                  invuln:0, powerSprint:0, powerInvinc:0, powerDoubleJump:0, hairFlow:t*0.1 };
  drawFrida(fakeP, t);
  ctx.restore();
  // Decorative flowers
  drawFlower(cardX+30, cardY+30, 6, '#e94f64', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+30, 6, '#f4c534', '#c83030');
  drawFlower(cardX+30, cardY+cardH-30, 6, '#1a5aa8', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+cardH-30, 6, '#f4486c', '#fff4d6');

  const q = FRIDA_QUESTIONS[game.qaIdx];
  if (!q) return;

  const tx = cardX + 230;
  const tw = cardW - 260;

  if (game.qaPhase === 'asking') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
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
      wrapTextLeft(q.answers[i].text, tx+50, ay+10, tw-60, 20);
    }
  } else {
    // reply
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
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      yy += lineH;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

function drawPowerSelect(t) {
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 36px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('CHOISIS TON POUVOIR', W/2, 80);
  ctx.font = 'italic 18px Georgia';
  ctx.fillStyle = '#f4e6c8';
  const nxt = LEVELS[game.qaIdx];
  ctx.fillText(`Pour l'acte « ${nxt ? nxt.name : '???'} »`, W/2, 110);

  // 3 cards
  const cardW = 240, cardH = 280, gap = 30;
  const totalW = 3*cardW + 2*gap;
  const startX = (W - totalW) / 2;
  const cardY = 160;
  const choices = (game.powerChoicesForLevel && game.powerChoicesForLevel.length) ? game.powerChoicesForLevel : POWER_POOL.slice(0,3);
  for (let i = 0; i < 3; i++) {
    const p = choices[i];
    const cx = startX + i*(cardW + gap);
    // Card background
    ctx.fillStyle = '#f4e6c8';
    ctx.fillRect(cx, cardY, cardW, cardH);
    ctx.strokeStyle = p.color; ctx.lineWidth = 4;
    ctx.strokeRect(cx, cardY, cardW, cardH);
    ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1;
    ctx.strokeRect(cx+5, cardY+5, cardW-10, cardH-10);
    // Number badge
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx+30, cardY+30, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f4e6c8';
    ctx.font = 'bold 24px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i+1), cx+30, cardY+31);
    // Power sprite (large)
    ctx.save();
    ctx.translate(cx + cardW/2, cardY + 110);
    ctx.scale(3.5, 3.5);
    const ic = p.icon || p.kind;
    if (ic === 'ribbon') drawRibbon(0, 0, t);
    else if (ic === 'shawl') drawShawl(0, 0, t);
    else if (ic === 'crown') drawCrown(0, 0, t);
    else if (ic === 'fire') drawFireIcon(0, 0, t);
    else if (ic === 'wing') drawWingIcon(0, 0, t);
    else if (ic === 'magnet') drawMagnetIcon(0, 0, t);
    else if (ic === 'hourglass') drawHourglassIcon(0, 0, t);
    else if (ic === 'skull') drawSkullIcon(0, 0, t);
    else if (ic === 'boot') drawBootIcon(0, 0, t);
    else if (ic === 'brush') drawPickupBrush(0, 0, t);
    ctx.restore();
    // Name
    ctx.fillStyle = p.color;
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.name, cx + cardW/2, cardY + 200);
    // Description
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
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      yy += lineH;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}


function drawHUD() {
  // ornate frame top
  ctx.fillStyle = 'rgba(20, 10, 25, 0.78)';
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = '#c9a96e';
  ctx.fillRect(0, 42, W, 2);

  ctx.textBaseline = 'middle';

  // ==== Score (left) ====
  ctx.font = 'bold 18px Georgia';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText(`SCORE  ${game.score.toString().padStart(5,'0')}`, 14, 22);

  // ==== Teas counter (left-center) with mini teacup icon ====
  drawMiniTeacup(180, 22);
  ctx.font = 'bold 18px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText(`× ${game.totalCoins}`, 196, 22);
  // progress to next +1up (every 10)
  const remainder = game.totalCoins % 10;
  ctx.font = '11px Georgia';
  ctx.fillStyle = '#aaa9a0';
  ctx.fillText(`${remainder}/10`, 240, 30);

  // ==== Lives (mini Frida heads) ====
  ctx.font = 'bold 16px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText('×', 280, 22);
  for (let i = 0; i < Math.min(game.lives, 6); i++) {
    drawTinyFrida(305 + i*22, 22);
  }
  if (game.lives > 6) {
    ctx.fillStyle = '#f4e6c8';
    ctx.fillText('+' + (game.lives - 6), 305 + 6*22, 22);
  }

  // ==== Level name (center) ====
  ctx.textAlign = 'center';
  ctx.font = 'italic 16px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText(`— ${game.level.name} —`, W/2, 22);

  // ==== Acte X/N (top right) ====
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText(`Acte ${game.levelIdx+1} / ${LEVELS.length}`, W-14, 22);

  // ==== Power-up timers (just below HUD bar, right side) ====
  const p = game.player;
  let py = 56;
  function drawPowerTimer(kind, frames, label, color) {
    if (frames <= 0) return;
    const total = POWER_DURATIONS[kind];
    const frac = frames / total;
    const x = W - 180;
    // bg bar
    ctx.fillStyle = 'rgba(20,10,25,0.85)';
    ctx.fillRect(x, py-12, 170, 22);
    // mini sprite
    ctx.save();
    if (kind === 'ribbon') drawRibbon(x+14, py-1, game.time);
    else if (kind === 'shawl') drawShawl(x+14, py-1, game.time);
    else if (kind === 'crown') drawCrown(x+14, py-1, game.time);
    ctx.restore();
    // label + bar
    ctx.font = 'bold 12px Georgia';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(label, x+30, py-3);
    // timer bar
    ctx.fillStyle = '#332533';
    ctx.fillRect(x+30, py+4, 130, 5);
    ctx.fillStyle = color;
    ctx.fillRect(x+30, py+4, 130*frac, 5);
    py += 26;
  }
  if (p) {
    drawPowerTimer('ribbon', p.powerDoubleJump, 'RUBAN — Double saut', '#e94f64');
    drawPowerTimer('shawl',  p.powerSprint,    'CHÂLE — Sprint',       '#5a8ace');
    drawPowerTimer('crown',  p.powerInvinc,    'COURONNE — Invincible', '#f4d35e');
  }
}

function drawMiniTeacup(cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f4e8d4';
  ctx.fillRect(-5, -3, 10, 7);
  ctx.beginPath(); ctx.ellipse(0, 4, 5, 1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3010';
  ctx.beginPath(); ctx.ellipse(0, -3, 5, 1.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c8a830';
  ctx.fillRect(-5, -3, 10, 1);
  ctx.strokeStyle = '#f4e8d4';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(6, 0, 2.5, -Math.PI/2, Math.PI/2); ctx.stroke();
  ctx.restore();
}

function drawTinyFrida(cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  // head
  ctx.fillStyle = '#b87858';
  ctx.beginPath(); ctx.arc(0, 1, 8, 0, Math.PI*2); ctx.fill();
  // hair
  ctx.fillStyle = '#1a0e0a';
  ctx.beginPath(); ctx.ellipse(0, -3, 9, 5, 0, Math.PI, 0); ctx.fill();
  // flower
  drawFlower(-4, -4, 2.5, '#f4486c', '#f4d35e');
  drawFlower(4, -4, 2, '#f4c534', '#c83030');
  // unibrow
  ctx.fillStyle = '#0a0500';
  ctx.fillRect(-5, -2, 10, 1.5);
  // eyes
  ctx.fillRect(-3, 0, 1.5, 1.5);
  ctx.fillRect(2, 0, 1.5, 1.5);
  // lips
  ctx.fillStyle = '#a8203a';
  ctx.fillRect(-2, 4, 4, 1);
  ctx.restore();
}


function drawTitle(t) {
  drawLondonBG(t);

  // Darken
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, W, H);

  // Decorative frame
  ctx.strokeStyle = '#c9a96e';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W-80, H-80);
  ctx.strokeRect(48, 48, W-96, H-96);

  ctx.textAlign = 'center';

  // Frida portrait
  ctx.save();
  ctx.translate(W/2, 200);
  ctx.scale(3, 3);
  const fakeP = { x:-11, y:-15, w:22, h:30, facing:1, walkPhase:0, onGround:true, invuln:0 };
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
  ctx.fillText('▶ Appuyez sur ESPACE pour commencer ◀', W/2, 440);

  ctx.font = '14px Georgia';
  ctx.fillStyle = '#aaa9a0';
  ctx.fillText('Un plateformer en quatre actes — Cobblestones, charbon, lande, couronne', W/2, 480);
}

// ============================================================================
//  FRIDA QUOTES (one shown per intermission - keyed to the level just finished)
// ============================================================================
const FRIDA_QUOTES = [
  { q: "« Des pieds, pour quoi faire si j'ai des ailes pour voler ? »",
    src: "— Frida Kahlo" },
  { q: "« Je ne peins pas mes rêves ni mes cauchemars. Je peins ma propre réalité. »",
    src: "— Frida Kahlo" },
  { q: "« Au bout du compte, on peut toujours résister. »",
    src: "— Frida Kahlo" },
  { q: "« Rien n'est absolu. Tout change, tout bouge, tout tourne, tout vole et s'en va. »",
    src: "— Frida Kahlo" },
];

function drawIntermission(t) {
  // Atmospheric BG: London at dusk with floating particles
  drawLondonBG(t);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);

  // Parchment-like card
  const cardX = 80, cardY = 70, cardW = W-160, cardH = H-140;
  ctx.fillStyle = 'rgba(244,230,200,0.97)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#3a2010';
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#c9a96e';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX+6, cardY+6, cardW-12, cardH-12);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3a2010';
  ctx.font = 'italic 16px Georgia';
  ctx.fillText('— Acte achevé —', W/2, cardY+34);

  ctx.font = 'bold 36px Georgia';
  ctx.fillText(`Bravo, Frida !`, W/2, cardY+78);

  ctx.font = 'italic 18px Georgia';
  ctx.fillText(`Tu as traversé "${LEVELS[game.levelIdx].name}"`, W/2, cardY+108);

  // Frida quote (changes per level)
  const quote = FRIDA_QUOTES[game.levelIdx % FRIDA_QUOTES.length];
  ctx.font = 'italic 17px Georgia';
  ctx.fillStyle = '#5a3010';
  // Wrap manually if needed
  wrapText(quote.q, W/2, cardY+158, cardW-80, 24);
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#7a1818';
  ctx.fillText(quote.src, W/2, cardY+220);

  // Decorative flowers
  drawFlower(cardX+30, cardY+30, 6, '#e94f64', '#f4d35e');
  drawFlower(cardX+cardW-30, cardY+30, 6, '#f4c534', '#c83030');
  drawFlower(cardX+30, cardY+cardH-30, 6, '#f4486c', '#fff4d6');
  drawFlower(cardX+cardW-30, cardY+cardH-30, 6, '#1a5aa8', '#f4d35e');

  // Next act preview
  const next = LEVELS[game.levelIdx + 1];
  if (next) {
    ctx.font = '14px Georgia';
    ctx.fillStyle = '#3a2010';
    ctx.fillText(`Prochain acte`, W/2, cardY+260);
    ctx.font = 'bold 22px Georgia';
    ctx.fillStyle = '#1a3a8a';
    ctx.fillText(`« ${next.name} »`, W/2, cardY+288);
    ctx.font = 'italic 14px Georgia';
    ctx.fillStyle = '#5a3010';
    ctx.fillText(next.subtitle, W/2, cardY+310);
  }

  // Stats line
  ctx.font = 'bold 14px Georgia';
  ctx.fillStyle = '#3a2010';
  ctx.fillText(`Théières bues : ${game.totalCoins}    Vies : ${game.lives}    Score : ${game.score}`, W/2, cardY+cardH-50);

  ctx.font = 'bold 18px Georgia';
  ctx.fillStyle = '#7a1818';
  const blink = Math.sin(t*0.15) > 0;
  if (blink) ctx.fillText('▶ ESPACE pour continuer ◀', W/2, cardY+cardH-22);
}

function wrapText(text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      yy += lineH;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

function drawWinScreen(t) {
  drawBigBenBG(t);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, H);

  // confetti
  for (let i=0;i<60;i++) {
    const cx = (i*97 + t*2) % W;
    const cy = (i*53 + t*3) % H;
    ctx.fillStyle = ['#f4d35e','#c83030','#1a5aa8','#f4486c','#3a7a3a'][i%5];
    ctx.fillRect(cx, cy, 4, 6);
  }

  ctx.textAlign = 'center';
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
  ctx.fillText(`Tasses de thé bues : ${game.totalCoins}`, W/2, 385);

  ctx.font = 'bold 20px Georgia';
  const blink = Math.sin(t*0.12) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#c9a96e';
  ctx.fillText('Appuyez sur ESPACE pour rejouer', W/2, 470);
}

function drawGameOver(t) {
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(0, 0, W, H);
  // dripping
  ctx.fillStyle = '#3a0a0a';
  for (let i=0; i<20; i++) {
    const x = (i*49) % W;
    ctx.fillRect(x, 0, 8, 30 + (i*7)%80);
  }
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px Georgia';
  ctx.fillStyle = '#c83030';
  ctx.fillText('GAME OVER', W/2, 220);
  ctx.font = 'italic 22px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText("Frida est rentrée chez elle... pour préparer sa revanche.", W/2, 270);
  ctx.font = 'bold 20px Georgia';
  const blink = Math.sin(t*0.12) > 0;
  ctx.fillStyle = blink ? '#f4e6c8' : '#7a1818';
  ctx.fillText('Appuyez sur ESPACE pour recommencer', W/2, 380);
}

function drawPause() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,W,H);
  ctx.textAlign = 'center';
  ctx.font = 'bold 60px Georgia';
  ctx.fillStyle = '#f4d35e';
  ctx.fillText('PAUSE', W/2, H/2);
  ctx.font = '20px Georgia';
  ctx.fillStyle = '#f4e6c8';
  ctx.fillText('Appuyez sur P pour reprendre', W/2, H/2 + 40);
}


