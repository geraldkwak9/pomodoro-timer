'use strict';

/**
 * [4번 역할] 수동 흐름 교정 및 적응형 인터벌 제어 모듈
 *
 * 의존: storage.js (getTuningCount, setTuningCount, setNextSessionTime)
 *
 * 책임:
 *   1. TUNE 다이얼 클릭 시 tuningCount 누적 + 배지 갱신
 *   2. 세션 종료 시 tuningCount >= 3 조건으로 번아웃 진단 후 nextSessionTime 결정
 *   3. 다음 세션 시작 시 tuningCount 완전 초기화 + 배지 리셋
 *
 * DOM 조작(subtitle 등)과 타이머 제어는 이 파일에서 수행하지 않는다.
 */

function _updateTuningBadge() {
  const badge = document.getElementById('tuning-count');
  if (badge) badge.textContent = getTuningCount();
}

/**
 * TUNE 다이얼 클릭 핸들러
 * 클릭할 때마다 tuningCount를 1 증가시키고 localStorage에 즉시 저장한다.
 */
function onTuningButtonClick() {
  setTuningCount(getTuningCount() + 1);
  _updateTuningBadge();
  _playTuningEffect();
}

function _playTuningEffect() {
   const screen = document.querySelector('.tv-screen');
   if (!screen) return;
   screen.classList.add('tuning-active');
   setTimeout(() => screen.classList.remove('tuning-active'), 800);
 }

/**
 * 세션 타이머가 00:00에 도달하는 시점에 timer.js에서 호출된다.
 * tuningCount >= 3 이면 번아웃으로 판정하여 nextSessionTime을 15분으로 재할당한다.
 * 미충족 시 nextSessionTime을 25분(기본값)으로 복구한다.
 */
function diagnoseFocusAndSetNextSession() {
  const count = getTuningCount();
  setNextSessionTime(count >= 3 ? 15 : 25);
}

/**
 * 다음 세션 시작 시 timer.js의 startSessionTimer()에서 호출된다.
 * tuningCount를 0으로 초기화하고 배지도 리셋한다.
 */
function resetForNextSession() {
  setTuningCount(0);
  _updateTuningBadge();
}

// TUNE 다이얼에 클릭 이벤트 연결 (scripts가 body 끝에 위치하므로 DOM 즉시 접근 가능)
const dialTuning = document.getElementById('dial-tuning');
if (dialTuning) {
  dialTuning.addEventListener('click', onTuningButtonClick);
}
