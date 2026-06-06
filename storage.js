'use strict';

/**
 * localStorage 안전 래퍼 모듈
 *
 * 모든 localStorage 읽기/쓰기는 이 파일의 함수만을 통해 수행한다.
 * null, NaN, 음수, 허용 범위 외의 값을 단일 지점에서 차단한다.
 */

function getTuningCount() {
  const raw = localStorage.getItem('tuningCount');
  const count = parseInt(raw, 10);
  return isNaN(count) ? 0 : Math.max(0, count);
}

function setTuningCount(value) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  localStorage.setItem('tuningCount', safe);
}

/**
 * nextSessionTime 은 15(번아웃 판정) 또는 25(정상) 두 값만 허용한다.
 * 그 외 모든 값(null, NaN, 다른 숫자)은 기본값 25로 복구한다.
 */
function getNextSessionTime() {
  const raw = localStorage.getItem('nextSessionTime');
  const minutes = parseInt(raw, 10);
  return minutes === 15 ? 15 : 25;
}

function setNextSessionTime(minutes) {
  const safe = minutes === 15 ? 15 : 25;
  localStorage.setItem('nextSessionTime', safe);
}
