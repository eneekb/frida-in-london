"use strict";
// Gestion du clavier

// ----------------------------------------------------------------------------
//  INPUT
// ----------------------------------------------------------------------------
const keys = {};
const keyPressed = {};
window.addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
  if (!keys[e.code]) keyPressed[e.code] = true;
  keys[e.code] = true;
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function consume(code) {
  const p = keyPressed[code];
  keyPressed[code] = false;
  return p;
}
function pressing(...codes) { return codes.some(c => keys[c]); }

