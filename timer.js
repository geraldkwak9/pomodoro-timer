'use strict';

// ── 상수 ─────────────────────────────────────────────────────────────────────
const BREAK_DURATION_SECONDS = 10 * 60; // 10분 휴식

// ── 상태 변수 (기존 팀 코드 구조 유지) ──────────────────────────────────────
let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;
let currentPhase = 'session'; // 'session' | 'break'

// ── 화면 갱신 ────────────────────────────────────────────────────────────────
// [FIX] 기존 팀 코드의 "timer" → 실제 HTML id인 "timer-display"로 수정
const timerDisplay = document.getElementById('timer-display');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeText = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

  if (timerDisplay) timerDisplay.textContent = timeText;

  // subtitle.js 연동: 1분 전 경고 감지 (런타임 호출이므로 로드 순서 무관)
  if (typeof checkOneMinuteLeft === 'function') checkOneMinuteLeft(timeText);
}

// ── 세션/휴식 Phase 전환 처리 ────────────────────────────────────────────────
function onPhaseEnd() {
  if (currentPhase === 'session') {
    // ★ [4번 역할 주입] 세션 종료 시 tuningCount >= 3 진단 → nextSessionTime 결정
    if (typeof diagnoseFocusAndSetNextSession === 'function') {
      diagnoseFocusAndSetNextSession();
    }

    // subtitle.js 연동: 번아웃 판정 여부에 따라 자막 분기
    if (typeof getNextSessionTime === 'function' && getNextSessionTime() === 15) {
      if (typeof showSessionChangedMessage === 'function') showSessionChangedMessage();
    } else {
      if (typeof showSessionEndMessage === 'function') showSessionEndMessage();
    }

    // 휴식 Phase로 전환
    currentPhase = 'break';
    timeLeft = BREAK_DURATION_SECONDS;
    updateDisplay();
    runTimer();

  } else {
    // 휴식 종료 → 세션 Phase로 전환
    currentPhase = 'session';

    // ★ [4번 역할 주입] tuningCount 완전 초기화 + nextSessionTime 반영(15분 또는 25분)
    if (typeof resetForNextSession === 'function') resetForNextSession();
    timeLeft = (typeof getNextSessionTime === 'function' ? getNextSessionTime() : 25) * 60;

    updateDisplay();
    if (typeof showSessionStartMessage === 'function') showSessionStartMessage();
    runTimer();
  }
}

// ── 내부 인터벌 실행 ──────────────────────────────────────────────────────────
function runTimer() {
  clearInterval(timerId);
  isRunning = true;
  timerId = setInterval(function () {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      isRunning = false;
      onPhaseEnd();
    }
  }, 1000);
}

// ── 공개 함수: 시작 ───────────────────────────────────────────────────────────
function startTimer() {
  if (isRunning) return;
  runTimer();
}

// ── 공개 함수: 일시정지 ───────────────────────────────────────────────────────
function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
}

// ── 공개 함수: 전체 리셋 ──────────────────────────────────────────────────────
function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  currentPhase = 'session';

  // ★ [4번 역할 주입] localStorage 완전 초기화 (tuningCount, nextSessionTime)
  if (typeof setTuningCount === 'function') setTuningCount(0);
  if (typeof setNextSessionTime === 'function') setNextSessionTime(25);

  timeLeft = 25 * 60;
  updateDisplay();
}

// ── 초기 표시: localStorage에 저장된 nextSessionTime 반영 ────────────────────
timeLeft = (typeof getNextSessionTime === 'function' ? getNextSessionTime() : 25) * 60;
updateDisplay();

// ── 버튼 이벤트 ──────────────────────────────────────────────────────────────
// [FIX] 기존 팀 코드의 "startBtn"/"pauseBtn"/"resetBtn" →
//       실제 HTML id인 "btn-start"/"btn-stop"/"btn-reset"으로 수정

document.getElementById('btn-start').addEventListener('click', function () {
  if (isRunning) {
    pauseTimer();
  } else {
    if (currentPhase === 'session' && typeof showSessionStartMessage === 'function') {
      showSessionStartMessage();
    }
    startTimer();
  }
});

document.getElementById('btn-stop').addEventListener('click', pauseTimer);
document.getElementById('btn-reset').addEventListener('click', resetTimer);
