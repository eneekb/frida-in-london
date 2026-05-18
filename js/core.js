"use strict";
// Setup canvas + état global du jeu

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const TILE = 32;

// ----------------------------------------------------------------------------
//  GAME STATE
// ----------------------------------------------------------------------------
const game = {
  state: 'title',
  levelIdx: 0,
  level: null,
  player: null,
  enemies: [],
  pickups: [],
  particles: [],
  floatTexts: [],
  enemyChatter: [],
  camera: { x: 0, y: 0 },
  score: 0,
  lives: 3,
  totalCoins: 0,
  time: 0,
  intermissionTimer: 0,
  shake: 0,
  flashRed: 0,
  flashGold: 0,
  message: '',
  messageTimer: 0,
  bossKilled: false,
  // Per-level themed object counters + decor flags
  collected:       { tea:0, lantern:0, gear:0, rose:0, brush:0 },
  decorTriggered:  { tea:false, lantern:false, gear:false, rose:false, brush:false },
  decorTransition: 0,   // animates 0->1 when decor flips
  // Power selection
  selectedPower: null,  // 'ribbon' | 'shawl' | 'crown'
  // Frida QA state
  qaIdx: 0, qaAnswered: -1, qaPhase: 'asking', // 'asking' | 'reply'
};

// Per-level object objectives (must collect this many to trigger decor change)
const OBJECTIVES = { tea: 10, lantern: 5, gear: 5, rose: 5, brush: 5 };

// Which themed object goes with which level (by index)
const LEVEL_THEME_OBJECT = ['lantern', 'gear', 'rose', 'brush'];


