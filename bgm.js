'use strict';

const BGM_DEFAULT_VOLUME = 0.28;
const BGM_FADE_DURATION_MS = 2000;
const BGM_FADE_IN_DURATION_MS = 1500;

let bgmAudio = null;
let bgmFadeTimer = null;

function _getBgmAudio() {
  if (!bgmAudio) {
    bgmAudio = new Audio('assets/audio/lofi_bgm.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0;
    bgmAudio.onerror = () => {
      console.warn('[BGM] 오디오 파일 로드 실패 — BGM 기능 비활성화');
      bgmAudio = null;
    };
  }
  return bgmAudio;
}

function bgmPlay() {
  const audio = _getBgmAudio();
  if (!audio) return;
  _clearFade();
  if (audio.paused) {
    audio.play().catch(e => console.warn('BGM 재생 실패:', e));
  }
  _fadeVolume(audio, audio.volume, BGM_DEFAULT_VOLUME, BGM_FADE_IN_DURATION_MS);
}

function bgmFadeOut(durationMs = BGM_FADE_DURATION_MS) {
  if (!bgmAudio || bgmAudio.paused) return;
  _clearFade();
  _fadeVolume(bgmAudio, bgmAudio.volume, 0, durationMs, () => {
    bgmAudio.pause();
  });
}

function bgmStop() {
  _clearFade();
  if (!bgmAudio) return;
  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  bgmAudio.volume = 0;
}

function _fadeVolume(audio, fromVol, toVol, durationMs, onComplete) {
  const steps = 30;
  const stepMs = durationMs / steps;
  const delta = (toVol - fromVol) / steps;
  let step = 0;
  bgmFadeTimer = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, fromVol + delta * step));
    if (step >= steps) {
      _clearFade();
      audio.volume = toVol;
      if (typeof onComplete === 'function') onComplete();
    }
  }, stepMs);
}

function _clearFade() {
  if (bgmFadeTimer) {
    clearInterval(bgmFadeTimer);
    bgmFadeTimer = null;
  }
}
