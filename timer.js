'use strict';

let sessionStartTime = null;

// ── 상수 ─────────────────────────────────────────────────────────────────────
const BREAK_DURATION_SECONDS = 10 * 60; //10분 휴식
const BREAK_WARNING_SECONDS = 60; // 1분 전 경고
//const BREAK_DURATION_SECONDS = 7; //TEST
//const BREAK_WARNING_SECONDS = Math.floor(BREAK_DURATION_SECONDS * 0.5); //TEST


// ── 상태 변수 (기존 팀 코드 구조 유지) ──────────────────────────────────────
//let timeLeft = 10;//test용
let accumulatedMinutes = 0;
let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;
let currentPhase = 'session'; // 'session' | 'break'
let goalReached = false;

// ── 화면 갱신 ────────────────────────────────────────────────────────────────
// [FIX] 기존 팀 코드의 "timer" → 실제 HTML id인 "timer-display"로 수정
const timerDisplay = document.getElementById('timer-display');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeText = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

  if (timerDisplay) timerDisplay.textContent = timeText;

  if (currentPhase === 'session' && timeLeft === 60) {
  if (typeof showCFComingMessage === 'function') showCFComingMessage();
}
if (currentPhase === 'break' && timeLeft === BREAK_WARNING_SECONDS) {
  if (typeof onBreakOneMinuteLeft === 'function') onBreakOneMinuteLeft();
}


  // CH2 시간 기반: 타이머 틱마다 트랙 자동 업데이트
const p = getCurrentProject();
if (p && p.channel === 2 && currentPhase === 'session') {
  const currentElapsed = sessionStartTime
    ? (Date.now() - sessionStartTime) / 1000 / 60
    : 0;
  const totalElapsed = accumulatedMinutes + currentElapsed;

  const data = loadProgress();
  const project = data.projects.find(proj => proj.id === data.currentProjectId);
  if (project) {
    project.completedMinutes = Math.min(totalElapsed, project.goalMinutes);
    saveProgress(data);
  if (!goalReached && project.completedMinutes >= project.goalMinutes) {
  goalReached = true;
  if (typeof updateSubtitle === 'function') {
    updateSubtitle('🎉 목표를 달성했습니다', false);
     }
   }
    if (typeof updateTrack === 'function') updateTrack();
  }
}
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
    /*} else {
      if (typeof showSessionEndMessage === 'function') showSessionEndMessage();*/
    }

    // 휴식 Phase로 전환
    if (typeof showCFScreen === 'function') showCFScreen(BREAK_DURATION_SECONDS);
    currentPhase = 'break';
    timeLeft = BREAK_DURATION_SECONDS;
    updateDisplay();
    runTimer();

  } else {
    // 휴식 종료 → 세션 Phase로 전환
    if (typeof hideCFScreen === 'function') hideCFScreen();
    currentPhase = 'session';

    // ★ [4번 역할 주입] tuningCount 완전 초기화 + nextSessionTime 반영(15분 또는 25분)
    if (typeof resetForNextSession === 'function') resetForNextSession();
    timeLeft = (typeof getNextSessionTime === 'function' ? getNextSessionTime() : 25) * 60;
    updateDisplay();
    
// ──────────────────────────────────────────────────────────────
    // [기존 코드는 그대로 두고, 자막 출력용 조건문만 아래에 추가]
    // ──────────────────────────────────────────────────────────────
    setTimeout(() => {
      // 이전 자막 클리어
      const subtitleText = document.querySelector('.subtitle-text');
      if (subtitleText) subtitleText.textContent = '';
      if (typeof showSessionStartMessage === 'function') showSessionStartMessage();
    }, 900);
    //if (typeof showSessionStartMessage === 'function') showSessionStartMessage();
    // ──────────────────────────────────────────────────────────────
    
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
let fadeTimerId = null;
function startTimer() {
  if (isRunning) return;
  sessionStartTime = Date.now();
  clearTimeout(fadeTimerId);
  fadeTimerId = setTimeout(() => {
    if (timerDisplay) timerDisplay.classList.add('faded');
  }, 5000);
  runTimer();
}

// ── 공개 함수: 일시정지 ───────────────────────────────────────────────────────
function pauseTimer() {
  if (sessionStartTime && currentPhase === 'session') {
    accumulatedMinutes += (Date.now() - sessionStartTime) / 1000 / 60;
  }
  sessionStartTime = null;  // 이제 안전하게 null 가능
  clearTimeout(fadeTimerId);
  if (timerDisplay) timerDisplay.classList.remove('faded');
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
}

// ── 공개 함수: 전체 리셋 ──────────────────────────────────────────────────────
function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  if (currentPhase === 'break' && typeof hideCFScreen === 'function') hideCFScreen();
currentPhase = 'session';
  accumulatedMinutes = 0; 
  goalReached = false;
  sessionStartTime = null; 
  // CH2: accumulatedMinutes 리셋 시 completedMinutes는 유지
   const p = getCurrentProject();
   if (p && p.channel === 2) {
     const data = loadProgress();
     const project = data.projects.find(proj => proj.id === data.currentProjectId);
     if (project) {
       accumulatedMinutes = project.completedMinutes;
     }
   }

  clearTimeout(fadeTimerId);
if (timerDisplay) timerDisplay.classList.remove('faded');
  // ★ [4번 역할 주입] localStorage 완전 초기화 (tuningCount, nextSessionTime)
  if (typeof setTuningCount === 'function') setTuningCount(0);
  if (typeof setNextSessionTime === 'function') setNextSessionTime(25);

  timeLeft = 25 * 60;
  updateDisplay();

  // [자막 추가] 리셋 시 자막 출력
  if (typeof showResetMessage === 'function') showResetMessage();
}

// ── 초기 표시: localStorage에 저장된 nextSessionTime 반영 ────────────────────
timeLeft = (typeof getNextSessionTime === 'function' ? getNextSessionTime() : 25) * 60;
//timeLeft = 10; //test용

updateDisplay();

// ── 버튼 이벤트 ──────────────────────────────────────────────────────────────
// [FIX] 기존 팀 코드의 "startBtn"/"pauseBtn"/"resetBtn" →
//       실제 HTML id인 "btn-start"/"btn-stop"/"btn-reset"으로 수정

document.getElementById('btn-start').addEventListener('click', function () {
  unlockAudio();
  if (isRunning) {
    pauseTimer();
    if (typeof showPauseMessage === 'function') showPauseMessage();
  } else {
    if (typeof showSessionStartMessage === 'function') showSessionStartMessage();
    startTimer();
  }
});

// 1. [수정] 중지(⏹) 버튼 클릭 시: 타이머를 멈추고 "중단되었습니다" 자막 출력
document.getElementById('btn-stop').addEventListener('click', function () {
  pauseTimer();
  if (typeof showStopMessage === 'function') showStopMessage();
});

// 2. [수정] 리셋(↺) 버튼 클릭 시: 값을 초기화하는 resetTimer()를 실행 (자막은 함수 내부에 넣어도 되지만 안전하게 여기서 호출)
document.getElementById('btn-reset').addEventListener('click', function () {
  resetTimer();
});

 /**
  * 프로젝트 전환 시 누적 시간 초기화
  * CH2는 기존 completedMinutes부터 이어서 누적, CH1/free는 0으로 초기화
  */
 function resetAccumulatedMinutes() {
   const p = getCurrentProject();
   accumulatedMinutes = (p && p.channel === 2) ? (p.completedMinutes || 0) : 0;
   sessionStartTime = null;
 }