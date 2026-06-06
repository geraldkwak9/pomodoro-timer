// track.js
// 역할: 트랙 시각화, 단위 완료 버튼 연동

const MAX_CELLS = 20;

// 트랙 초기화
function initTrack() {
  const trackBg = document.getElementById('track-bg');
  if (!trackBg) return;
  trackBg.innerHTML = '';

  const cellCount = Math.min(state.goalUnits, MAX_CELLS);
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.classList.add('track-cell');
    trackBg.appendChild(cell);
  }
  updateTrack();
}

// 트랙 업데이트
function updateTrack() {
  const cells = document.querySelectorAll('.track-cell');
  if (cells.length === 0) return;

  const filledRatio = state.goalUnits === 0 ? 0 : state.completedUnits / state.goalUnits;
  const filledCount = filledRatio * cells.length;

  cells.forEach((cell, index) => {
    cell.classList.remove('filled', 'partial');
    cell.style.removeProperty('--fill-pct');

    if (index < Math.floor(filledCount)) {
      cell.classList.add('filled');
    } else if (index === Math.floor(filledCount)) {
      const pct = (filledCount - Math.floor(filledCount)) * 100;
      if (pct > 0) {
        cell.classList.add('partial');
        cell.style.setProperty('--fill-pct', `${pct}%`);
      }
    }
  });
}

// 단위 완료 버튼
document.getElementById('btn-unit').addEventListener('click', () => {
  if (state.completedUnits >= state.goalUnits) return;
  completeUnit();
  updateTrack();
  updateSubtitle(`${state.completedUnits}/${state.goalUnits}`, false);
});