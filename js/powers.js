"use strict";
// Pool des pouvoirs + sélection + durées

// POWER POOL — 10 pouvoirs, 3 tirés au hasard à chaque début de niveau
// ============================================================================
const POWER_POOL = [
  { kind: 'ribbon',     icon:'ribbon',    name: 'RUBAN ROUGE',       desc: 'Double saut — réappuie SAUT en l\'air',                       color: '#e94f64' },
  { kind: 'shawl',      icon:'shawl',     name: 'CHÂLE TEHUANA',     desc: 'Sprint — vitesse de course nettement augmentée',              color: '#1a5aa8' },
  { kind: 'crown',      icon:'crown',     name: 'COURONNE FLEURIE',  desc: 'Invincibilité — 30s d\'immunité dès le début',                color: '#f4d35e' },
  { kind: 'fireball',   icon:'fire',      name: 'FLAMMES DU CŒUR',   desc: 'Appuie sur F pour lancer une boule de feu',                   color: '#ff6622' },
  { kind: 'fly',        icon:'wing',      name: 'AILES DE COLOMBE',  desc: 'Maintiens SAUT en l\'air pour planer doucement',              color: '#aaccff' },
  { kind: 'magnet',     icon:'magnet',    name: 'CŒUR MAGNÉTIQUE',   desc: 'Les théières alentour sont attirées vers toi',                color: '#cc44dd' },
  { kind: 'slowmo',     icon:'hourglass', name: 'MEZCAL DE OAXACA',  desc: 'Les ennemis bougent au ralenti',                              color: '#88cc44' },
  { kind: 'scoreboost', icon:'skull',     name: 'CALAVERA DORÉE',    desc: 'Chaque théière vaut TROIS fois plus',                         color: '#ffddaa' },
  { kind: 'groundpound',icon:'boot',      name: 'TALON FERRÉ',       desc: 'En l\'air, appuie BAS pour frapper le sol et tuer autour',    color: '#888888' },
  { kind: 'brushcrea',  icon:'brush',     name: 'PINCEAU MAGIQUE',   desc: 'Appuie sur F pour peindre une plateforme sous tes pieds',     color: '#dd2244' },
];

// Tirage de 3 pouvoirs au hasard sans répétition
function rollPowerChoices() {
  const pool = POWER_POOL.slice();
  const out = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  game.powerChoicesForLevel = out;
}


const POWER_DURATIONS = {
  ribbon: 60 * 14,   // 14s of double jump
  shawl:  60 * 10,   // 10s of sprint
  crown:  60 * 7,    // 7s of invincibility
};

// ----------------------------------------------------------------------------

