// ===== 상태 관리 =====
const STORAGE_KEY = "pomodoroProgress";

let state = {
goalUnits: 0,
completedUnits: 0
};

// 저장
function saveProgress() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 불러오기
function loadProgress() {
const saved = localStorage.getItem(STORAGE_KEY);

if (saved) {
state = JSON.parse(saved);
}

updateUI();
initTrack();
}

// ===== 목표 단위 설정 =====
function setGoalUnits(units) {
state.goalUnits = Number(units);
state.completedUnits = 0;

saveProgress();
updateUI();
}

// ===== 단위 완료 =====
function completeUnit() {
state.completedUnits++;

saveProgress();
updateUI();

if (state.completedUnits >= state.goalUnits) {
alert("🎉 목표 단위를 모두 완료했습니다!");
}
}

// ===== 진행 상황 초기화 =====
function resetProgress() {
localStorage.removeItem(STORAGE_KEY);

state = {
goalUnits: 0,
completedUnits: 0
};

updateUI();
}

// ===== UI 업데이트 =====
function updateUI() {
const goalElement = document.getElementById("goal");
const completedElement = document.getElementById("completed");
const progressElement = document.getElementById("progress");

if (goalElement)
goalElement.textContent = state.goalUnits;

if (completedElement)
completedElement.textContent = state.completedUnits;

if (progressElement) {
const percent =
state.goalUnits === 0
? 0
: Math.round(
(state.completedUnits / state.goalUnits) * 100
);

progressElement.textContent = '${percent}%';
}
}

// ===== 앱 시작 시 이어보기 =====
window.addEventListener("load", loadProgress);