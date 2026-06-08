'use strict';

// ===== 상태 관리 (기존 구조 확장) =====
const STORAGE_KEY = "pomodoroProgress";

// 저장 (기존 saveProgress 확장)
function saveProgress(data) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 불러오기(기존 loadProgress 확장)
function loadProgress() {
const raw = localStorage.getItem(STORAGE_KEY);
return raw ? JSON.parse(raw) : { projects: [], currentProjectId: null };
}

// 초기화 (기존 resetProgress 유지)
function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  if (typeof initTrack === 'function') initTrack();
}

// ===== 프로젝트 추가 =====
function addProject({ name, channel, unitName, goalUnits, goalMinutes }) {
  const data = loadProgress();
  const id = Date.now();
  const project = { id, name, channel, completedUnits: 0 };
  if (channel === 1) {
    project.unitName = unitName;
    project.goalUnits = goalUnits;
  } else {
    project.goalMinutes = goalMinutes;
    project.completedMinutes = 0;
  }
  data.projects.push(project);
  data.currentProjectId = id;
  saveProgress(data);
  return project;
}

// ===== 현재 프로젝트 =====
function getCurrentProject() {
  const data = loadProgress();
  return data.projects.find(p => p.id === data.currentProjectId) || null;
}

function setCurrentProject(id) {
  const data = loadProgress();
  data.currentProjectId = id;
  saveProgress(data);
}

// ===== 채널별 프로젝트 목록 =====
function getProjectsByChannel(channel) {
  const data = loadProgress();
  return data.projects.filter(p => p.channel === channel);
}

// ===== 단위 완료 (기존 completeUnit 확장) =====
function completeUnit() {
  const data = loadProgress();
  const project = data.projects.find(p => p.id === data.currentProjectId);
  if (!project) return;
  if (project.channel === 1) {
    project.completedUnits = Math.min(project.completedUnits + 1, project.goalUnits);
    if (project.completedUnits >= project.goalUnits) {
      if (typeof updateSubtitle === 'function') {
       updateSubtitle('🎉 목표를 달성했습니다', false);
     }
    }
  }
  saveProgress(data);
}

// ===== UI 업데이트 (기존 updateUI 유지) =====
function updateUI() {
  const project = getCurrentProject();
  if (!project) return;
  const goalElement = document.getElementById("goal");
  const completedElement = document.getElementById("completed");
  if (goalElement) goalElement.textContent = project.goalUnits || project.goalMinutes;
  if (completedElement) completedElement.textContent = project.completedUnits || project.completedMinutes;
}

// ===== state 호환 (track.js용) =====
Object.defineProperty(window, 'state', {
  get() {
    const p = getCurrentProject();
    if (!p || p.channel === 'free') return { goalUnits: 0, completedUnits: 0 };
    return {
      goalUnits: p.channel === 1 ? p.goalUnits : p.goalMinutes,
      completedUnits: p.channel === 1 ? p.completedUnits : p.completedMinutes
    };
  }
});

// ===== 앱 시작 시 이어보기 =====
window.addEventListener("load", () => {
  const data = loadProgress();
  if (data.currentProjectId) {
    updateUI();
  }
});
