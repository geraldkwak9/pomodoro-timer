'use strict';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBellSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      ctx.resume().then(() => _playBell(ctx));
    } else {
      _playBell(ctx);
    }
  } catch (e) {
    console.warn('사운드 재생 실패:', e);
  }
}

function _playBell(ctx) {
  const frequencies = [220, 440, 660];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 3);
    const volume = i === 0 ? 0.18 : 0.08;
    gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.04);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + i * 0.04 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
    osc.start(ctx.currentTime + i * 0.04);
    osc.stop(ctx.currentTime + 4.5);
  });
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}