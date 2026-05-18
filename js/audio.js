"use strict";
// Audio : bips synthétisés Web Audio

// ----------------------------------------------------------------------------
//  AUDIO (petits bips synthétisés)
// ----------------------------------------------------------------------------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }
}
function blip(freq, dur, type='square', vol=0.08) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + dur);
}
const SFX = {
  jump:   () => blip(440, 0.12, 'square'),
  stomp:  () => { blip(220, 0.08); setTimeout(()=>blip(110,0.1),60); },
  coin:   () => { blip(880, 0.06); setTimeout(()=>blip(1320,0.08),60); },
  hit:    () => blip(140, 0.25, 'sawtooth', 0.12),
  win:    () => { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>blip(f,0.15,'triangle',0.1),i*120)); },
  lose:   () => { [400,300,200,120].forEach((f,i)=>setTimeout(()=>blip(f,0.2,'sawtooth',0.1),i*150)); },
};

