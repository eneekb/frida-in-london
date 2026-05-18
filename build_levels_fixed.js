// Generates clean, playable levels. Each row exactly 100 chars (level 4: 84).
// Verifies every coin/scone/?/F via solver.
//
// Physics constraint reminder:
//   Max jump apex from a platform at row P puts the player TOP at ~ row (P-4).
//   So a coin at row Y is reachable only from a platform at row <= Y+4.
//   Ground is row 15 (player on row 14), so apex covers row 10 at the lowest.
//   To reach higher than row 9, need an intermediate platform.

const { parseLevel, analyzeLevel } = require('./solver.js');

const W = 100;
const H = 17;

function emptyRows(w = W) {
  return Array.from({length: H}, () => '.'.repeat(w));
}
function place(rows, r, c, str) {
  rows[r] = rows[r].substring(0, c) + str + rows[r].substring(c + str.length);
}
function fill(rows, r, c, w, ch) { place(rows, r, c, ch.repeat(w)); }
function assertWidths(rows, w = W) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== w) throw new Error(`row ${i} has width ${rows[i].length}, expected ${w}`);
  }
}

// ============================================================================
// LEVEL 1 — Les Ruelles de Londres
// ============================================================================
function buildLevel1() {
  const r = emptyRows();
  // Main floor row 15-16 with 3 gaps
  fill(r, 15, 0,  30, '#');
  fill(r, 15, 33, 23, '#'); // 33..55
  fill(r, 15, 59, 22, '#'); // 59..80
  fill(r, 15, 83, 17, '#'); // 83..99
  fill(r, 16, 0,  30, '#');
  fill(r, 16, 33, 23, '#');
  fill(r, 16, 59, 22, '#');
  fill(r, 16, 83, 17, '#');

  // ---- Cluster A: cols 8-18, low platforms ----
  place(r, 12, 9, '====');       // platform at row 12 (reachable from ground)
  place(r, 11, 10, 'oo');        // coins one row above platform
  place(r, 13, 14, '?');          // ? block in air at low height

  // ---- Cluster B: stair up to higher platform with scone ----
  place(r, 12, 20, '====');
  place(r, 11, 21, 'oo');
  place(r, 10, 25, '====');       // higher step
  place(r,  9, 26, 'oo');
  // Note: from row 12 jump we reach apex row ~8 → can land on row 10. OK.

  // ---- Bonus block in mid-air at reachable height ----
  place(r, 11, 28, '?');

  // ==== GAP 1 (cols 30-32) ====
  place(r, 13, 31, 'o');          // hint coin over the gap

  // ---- Cluster C: cols 35-55 ----
  place(r, 12, 36, '======');     // platform
  place(r, 11, 38, 'oo');
  place(r, 10, 44, '======');     // higher
  place(r,  9, 46, 'oo');
  place(r, 11, 50, '?');

  // ==== GAP 2 (cols 56-58) ====
  place(r, 13, 57, 'o');

  // ---- Cluster D: cols 60-80 with scone perched ----
  place(r, 12, 60, '======');
  place(r, 11, 62, 'oo');
  place(r, 10, 67, '======');     // intermediate
  place(r,  9, 69, 'oo');
  place(r,  9, 74, '?');           // mid-air ? reachable at apex
  place(r,  6, 74, '====');       // VERY high platform — needs row 10 as intermediate
  place(r,  5, 75, 'S');           // SCONE — extreme but accessible: floor → row 12 plat → row 10 plat → row 6 plat

  // Hazards on ground
  place(r, 14, 76, '^');

  // ==== GAP 3 (cols 81-82) ====
  place(r, 13, 81, 'o');

  // ---- Cluster E: final stretch ----
  place(r, 12, 84, '======');
  place(r, 11, 86, 'oo');
  place(r, 10, 92, '====');
  place(r,  9, 93, 'oo');
  // FLAG at end on main ground (row 14)
  place(r, 14, 97, 'F');

  assertWidths(r);
  return {
    name: "Les Ruelles de Londres",
    subtitle: "Où Frida découvre la pluie et les pavés",
    theme: 'london',
    music: 'london',
    map: r,
    bg: 'london',
    enemies: [
      { type:'bobby',  x: 20, y: 14 },
      { type:'sweep',  x: 42, y: 14 },
      { type:'bobby',  x: 66, y: 14 },
      { type:'smog',   x: 50, y: 6 },
      { type:'sweep',  x: 88, y: 14 },
    ],
    start: { x: 3, y: 13 },
  };
}

// ============================================================================
// LEVEL 2 — L'Usine à Vapeur
// ============================================================================
function buildLevel2() {
  const r = emptyRows();
  // Ground rows 15-16 with 2 gaps
  fill(r, 15, 0,  28, '#');
  fill(r, 15, 31, 25, '#');  // 31..55
  fill(r, 15, 59, 41, '#');  // 59..99
  fill(r, 16, 0, 100, '#');
  // Open the abyss under gaps
  for (let c = 28; c <= 30; c++) r[16] = r[16].substring(0,c) + '.' + r[16].substring(c+1);
  for (let c = 56; c <= 58; c++) r[16] = r[16].substring(0,c) + '.' + r[16].substring(c+1);

  // ---- Section 1: warm-up with low platforms ----
  place(r, 13, 5, '====');
  place(r, 12, 6, 'oo');
  place(r, 13, 10, '?');           // ? block in low air, reachable directly from floor
  place(r, 11, 13, '====');
  place(r, 10, 14, 'oo');
  place(r, 14, 22, 'G');           // gear hazard on ground

  // ==== GAP cols 28-30 ====
  place(r, 13, 29, 'o');           // coin hint over gap

  // ---- Section 2: stairs going up ----
  place(r, 13, 31, '==');          // landing
  place(r, 12, 34, '====');
  place(r, 11, 35, 'oo');
  place(r, 10, 39, '====');        // higher step
  place(r,  9, 40, 'oo');
  place(r,  9, 44, '?');           // mid-air ? above plat row 11
  place(r,  9, 47, '====');        // even higher
  place(r,  6, 49, '==');          // very high mini-platform needs row 9 below
  place(r,  5, 49, 'o');           // coin on the high platform
  // Descent
  place(r, 11, 52, '====');
  place(r, 13, 54, 'o');

  // ==== GAP cols 56-58 ====
  place(r, 13, 60, 'o');

  // ---- Section 3: long stairs up to scone ----
  place(r, 13, 62, '======');
  place(r, 12, 64, 'oo');
  place(r, 11, 68, '======');
  place(r, 10, 70, 'oo');
  place(r,  9, 73, '======');
  place(r,  8, 75, 'o');
  place(r,  9, 78, '?');           // ? block at row 9, reachable from row 13/11
  place(r,  6, 79, '====');       // high platform, accessible from row 9 below
  place(r,  5, 80, 'S');           // SCONE at row 5

  // ---- Descent and finale ----
  place(r, 11, 84, '======');
  place(r, 10, 86, 'oo');
  place(r, 13, 89, 'o');
  place(r, 13, 91, 'o');
  place(r, 14, 80, '^');
  place(r, 14, 93, 'G');
  // FLAG at end
  place(r, 14, 97, 'F');

  assertWidths(r);
  return {
    name: "L'Usine à Vapeur",
    subtitle: "Engrenages, suie et patrons en haut-de-forme",
    theme: 'factory',
    music: 'factory',
    map: r,
    bg: 'factory',
    enemies: [
      { type:'topboss', x: 18, y: 14 },
      { type:'sweep',   x: 45, y: 8 },
      { type:'smog',    x: 50, y: 4 },
      { type:'topboss', x: 70, y: 14 },
      { type:'sweep',   x: 87, y: 14 },
    ],
    start: { x: 2, y: 14 },
  };
}

// ============================================================================
// LEVEL 3 — La Lande Brumeuse  (rolling hills)
// ============================================================================
function buildLevel3() {
  const r = emptyRows();
  fill(r, 15, 0, 100, '#');
  fill(r, 16, 0, 100, '#');
  // Stack # to make hills sticking up
  function hill(cFrom, cTo, height) {
    for (let c = cFrom; c <= cTo; c++) {
      for (let h = 1; h <= height; h++) {
        const row = 15 - h;
        r[row] = r[row].substring(0, c) + '#' + r[row].substring(c+1);
      }
    }
  }
  hill(8, 14, 1);
  hill(20, 28, 2);
  hill(34, 38, 1);
  hill(52, 56, 3);
  hill(70, 76, 2);
  hill(85, 88, 1);

  // Coins on hill tops
  function coinsOnHill(cFrom, cTo, height) {
    const row = 15 - height - 1;
    for (let c = cFrom; c <= cTo; c++) {
      r[row] = r[row].substring(0, c) + 'o' + r[row].substring(c+1);
    }
  }
  coinsOnHill(10, 12, 1);
  coinsOnHill(22, 26, 2);
  coinsOnHill(53, 55, 3);
  coinsOnHill(72, 74, 2);

  // Floating platforms — kept at reachable heights
  place(r, 12, 16, '====');        // row 12 - low
  place(r, 11, 17, 'oo');
  place(r, 11, 30, '======');      // medium
  place(r, 10, 32, 'oo');
  // For row 7 we need a row 11 step nearby
  place(r, 11, 42, '======');      // step
  place(r,  9, 44, '?');           // mid-air ? above the step (tile below is empty)
  // Hmm let's keep all ? blocks at row 10-12
  // (removed problematic ? at 47,10)
  place(r, 12, 60, '======');
  place(r, 11, 62, 'oo');
  place(r, 11, 67, '====');        // step to scone
  place(r,  9, 68, '====');        // higher
  place(r,  8, 68, 'S');           // scone
  place(r, 11, 80, '======');
  place(r,  9, 83, '?'); // ? above plat row 11 (mid-air)
  place(r, 11, 90, '====');
  place(r, 10, 91, 'oo');

  // Hazards
  place(r, 14, 45, '^');
  place(r, 14, 65, '^');

  place(r, 14, 97, 'F');

  assertWidths(r);
  return {
    name: "La Lande Brumeuse",
    subtitle: "Moutons, chiens des Baskerville et collines bossues",
    theme: 'moor',
    music: 'moor',
    map: r,
    bg: 'moor',
    enemies: [
      { type:'sheep',  x: 10, y: 13 },
      { type:'dog',    x: 25, y: 11 },
      { type:'sheep',  x: 38, y: 13 },
      { type:'dog',    x: 50, y: 13 },
      { type:'dog',    x: 73, y: 11 },
      { type:'sheep',  x: 88, y: 13 },
    ],
    start: { x: 2, y: 14 },
  };
}

// ============================================================================
// LEVEL 4 — Le Sommet de Big Ben (vertical, boss at top)
// ============================================================================
function buildLevel4() {
  const w = 84;
  const rows = Array.from({length: H}, () => '.'.repeat(w));
  function pl(r, c, s) { rows[r] = rows[r].substring(0, c) + s + rows[r].substring(c + s.length); }
  function fl(r, c, n, ch) { pl(r, c, ch.repeat(n)); }

  fl(16, 0, w, '#');
  fl(15, 0, w, '#');

  // Zig-zag ascending platforms — each new step within 4 rows of the previous
  pl(12, 4,  '======');             // step 1 (row 12, from ground)
  pl(11, 6,  'oo');
  pl(11, 12, '======');             // step 2 (row 11)
  pl( 9, 15, '?'); // ? in mid-air above step 2
  pl(10, 18, '======');             // step 3 (row 10)
  pl( 9, 20, 'oo');
  pl( 9, 24, '======');             // step 4 (row 9) — 1 row up from step 3, OK
  pl( 7, 27, '?'); // ? mid-air
  pl( 8, 30, '======');             // step 5 (row 8)
  pl( 7, 32, 'oo');
  pl( 6, 36, '======');             // step 6 (row 6) — 2 row jump from step 5, OK
  pl( 4, 39, '?'); // ? mid-air above step 6
  pl( 5, 42, '======');             // step 7 (row 5)
  pl( 4, 44, 'oo');
  pl( 4, 48, '====');               // step 8 (row 4)
  pl( 3, 49, 'o');
  pl( 3, 53, '======');             // step 9 (row 3)
  pl( 2, 55, 'oo');
  // Scone on a tricky reach
  pl( 3, 60, '====');
  pl( 2, 61, 'S');

  // Boss arena platform on the right (rows 13-14 stretch)
  pl(13, 63, '====================');
  pl(13, 70, 'oooooooo');
  pl(14, 82, 'F');
  // Hazards
  pl(14, 19, '^');
  pl(14, 33, '^');
  pl(14, 47, '^^');

  // Width check
  for (const row of rows) if (row.length !== w) throw new Error('width mismatch');
  return {
    name: "Le Sommet de Big Ben",
    subtitle: "Et Frida face à la Reine Victorienne",
    theme: 'bigben',
    music: 'bigben',
    map: rows,
    bg: 'bigben',
    enemies: [
      { type:'guard',  x: 8, y: 14 },
      { type:'guard',  x: 30, y: 14 },
      { type:'smog',   x: 25, y: 4 },
      { type:'smog',   x: 55, y: 3 },
      { type:'queen',  x: 72, y: 12 },
    ],
    start: { x: 2, y: 14 },
  };
}

const LEVELS = [buildLevel1(), buildLevel2(), buildLevel3(), buildLevel4()];

function dump(L) {
  console.log('--- ' + L.name + ' ---');
  for (let i = 0; i < L.map.length; i++) {
    console.log(String(i).padStart(2) + ': ' + L.map[i]);
  }
}

LEVELS.forEach((raw, i) => {
  const parsed = parseLevel(raw);
  const a = analyzeLevel(parsed);
  const total = arr => arr.length;
  const ok = arr => arr.filter(x => x.reach).length;
  console.log(`\n=== Level ${i+1}: ${raw.name} (w=${parsed.w}) ===`);
  console.log(`  Coins:   ${ok(a.coins)}/${total(a.coins)}`);
  console.log(`  Scones:  ${ok(a.scones)}/${total(a.scones)}`);
  console.log(`  ? blocks:${ok(a.qBlocks)}/${total(a.qBlocks)}`);
  console.log(`  Flags:   ${ok(a.flags)}/${total(a.flags)}`);
  ['coins','scones','qBlocks','flags'].forEach(k => {
    a[k].forEach(o => { if (!o.reach) console.log(`  UNREACH ${k} at ${o.x},${o.y}`); });
  });
});

if (process.argv.includes('--dump')) LEVELS.forEach(dump);

if (process.argv.includes('--export')) {
  console.log('\n========== JS EXPORT ==========\n');
  console.log('const RAW_LEVELS = [');
  LEVELS.forEach(L => {
    console.log('  {');
    console.log('    name: ' + JSON.stringify(L.name) + ',');
    console.log('    subtitle: ' + JSON.stringify(L.subtitle) + ',');
    console.log('    theme: ' + JSON.stringify(L.theme) + ',');
    console.log('    music: ' + JSON.stringify(L.music) + ',');
    console.log('    map: [');
    L.map.forEach(row => console.log('      ' + JSON.stringify(row) + ','));
    console.log('    ],');
    console.log('    bg: ' + JSON.stringify(L.bg) + ',');
    console.log('    enemies: ' + JSON.stringify(L.enemies) + ',');
    console.log('    start: ' + JSON.stringify(L.start) + ',');
    console.log('  },');
  });
  console.log('];');
}

module.exports = { LEVELS, buildLevel1, buildLevel2, buildLevel3, buildLevel4 };
