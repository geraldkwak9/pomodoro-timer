// setup.js
// 역할: 채널/프로젝트 설정 팝업 로직
// 의존: progress5.js (loadProgress, saveProgress, addProject, getProjectsByChannel, setCurrentProject)
//       track.js (initTrack)
let selectedChannel = 1;
let editingProjectId = null;

function showSetupOverlay() {
  if (typeof pauseTimer === 'function' && typeof isRunning !== 'undefined' && isRunning) pauseTimer();
  document.getElementById('setup-overlay').style.display = 'flex';
  document.getElementById('step-onboarding').style.display = 'none';
  document.getElementById('step-channel').style.display = 'block';
  document.getElementById('step-project').style.display = 'none';
}

function hideSetupOverlay() {
  document.getElementById('setup-overlay').style.display = 'none';
}

function renderProjectList(channel) {
  const projects = getProjectsByChannel(channel);
  const container = document.getElementById('project-list');
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = '<p style="color:#888; font-size:11px; font-family:monospace;">저장된 프로젝트 없음</p>';
    return;
  }

  projects.forEach(p => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    row.style.marginBottom = '6px';

    const btn = document.createElement('button');
    btn.className = 'ch-btn';
    btn.style.flex = '1';
    btn.textContent = p.channel === 1
      ? `${p.name} (${p.completedUnits}/${p.goalUnits}${p.unitName})`
      : `${p.name} (${parseFloat(p.completedMinutes.toFixed(1))}/${p.goalMinutes}분)`;
      const isCompleted = p.channel === 1
   ? p.completedUnits >= p.goalUnits
   : p.completedMinutes >= p.goalMinutes;
 if (isCompleted) {
   btn.style.opacity = '0.5';
   btn.textContent = '✓ ' + btn.textContent;
 }
    btn.addEventListener('click', () => {
    document.getElementById('project-name').value = p.name;
     if (p.channel === 1) {
       document.getElementById('ch1-fields').style.display = 'block';
       document.getElementById('ch2-fields').style.display = 'none';
       document.getElementById('unit-name').value = p.unitName;
       document.getElementById('goal-units').value = p.goalUnits;
       document.getElementById('completed-units').value = p.completedUnits;
     } else {
       document.getElementById('ch1-fields').style.display = 'none';
       document.getElementById('ch2-fields').style.display = 'block';
       document.getElementById('goal-amount').value = p.goalMinutes;
       document.getElementById('time-unit').value = 'minutes';
       document.getElementById('completed-amount').value = parseFloat(p.completedMinutes.toFixed(1));
     }
     document.getElementById('step-project').style.display = 'block';
     editingProjectId = p.id;  
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      const data = loadProgress();
      data.projects = data.projects.filter(proj => proj.id !== p.id);
      if (data.currentProjectId === p.id) data.currentProjectId = null;
      saveProgress(data);
      renderProjectList(channel);
    });

    row.appendChild(btn);
    row.appendChild(delBtn);
    container.appendChild(row);
  });
}
function updateProjectNameDisplay() {
  const el = document.getElementById('project-name-display');
  if (!el) return;
  const p = getCurrentProject();
 if (!p || p.channel === 'free') {
     el.style.visibility = 'hidden';
   } else {
     el.style.visibility = 'visible';
     el.textContent = p.name;
   }
}

window.addEventListener('load', () => {
  const data = loadProgress();
  if (data.currentProjectId === 'free') {
     data.projects = data.projects.filter(p => p.id !== 'free');
     data.currentProjectId = null;
     saveProgress(data);
   }
  if (!data.currentProjectId) {
    // 완전 첫 접속이면 온보딩, 아니면 채널 선택
     const isFirstVisit = !localStorage.getItem('visited');
     if (isFirstVisit) {
       document.getElementById('setup-overlay').style.display = 'flex';
       document.getElementById('step-onboarding').style.display = 'block';
       document.getElementById('step-channel').style.display = 'none';
       document.getElementById('step-project').style.display = 'none';
     } else {
    showSetupOverlay();
     }
  } else {
    initTrack(); // 이어보기 시 트랙 초기화
    updateProjectNameDisplay();
  }
});

document.getElementById('onboarding-next-btn').addEventListener('click', () => {
   localStorage.setItem('visited', 'true');
   document.getElementById('step-onboarding').style.display = 'none';
   document.getElementById('step-channel').style.display = 'block';
});

document.getElementById('ch1-btn').addEventListener('click', () => {
  editingProjectId = null;
  selectedChannel = 1;
  document.getElementById('ch1-fields').style.display = 'block';
  document.getElementById('ch2-fields').style.display = 'none';
  document.getElementById('step-channel').style.display = 'none';
  document.getElementById('step-project').style.display = 'block';
  renderProjectList(1);
});

document.getElementById('ch2-btn').addEventListener('click', () => {
  editingProjectId = null;
  selectedChannel = 2;
  document.getElementById('ch1-fields').style.display = 'none';
  document.getElementById('ch2-fields').style.display = 'block';
  document.getElementById('step-channel').style.display = 'none';
  document.getElementById('step-project').style.display = 'block';
  renderProjectList(2);
});

document.getElementById('free-btn').addEventListener('click', () => {
  const data = loadProgress();
  const freeProject = {
     id: 'free',
     name: '자유 시청',
     channel: 'free',
     goalUnits: 0,
     completedUnits: 0,
   };
   data.projects = data.projects.filter(p => p.id !== 'free');
   data.projects.push(freeProject);
   data.currentProjectId = 'free';
   saveProgress(data);
   hideSetupOverlay();
   if (typeof resetAccumulatedMinutes === 'function') resetAccumulatedMinutes();
   initTrack();
   updateProjectNameDisplay();  
});

document.getElementById('close-btn').addEventListener('click', () => {
  hideSetupOverlay();
});

document.getElementById('back-btn').addEventListener('click', () => {
  editingProjectId = null; 
  document.getElementById('step-channel').style.display = 'block';
  document.getElementById('step-project').style.display = 'none';
});

document.getElementById('setup-confirm').addEventListener('click', () => {
  const projectName = document.getElementById('project-name').value;
  if (!projectName) return alert('프로젝트 이름을 입력해주세요');

  if (editingProjectId) {
     const data = loadProgress();
     const project = data.projects.find(p => p.id === editingProjectId);
     if (project) {
       project.name = projectName;
       if (project.channel === 1) {
         project.unitName = document.getElementById('unit-name').value;
         project.goalUnits = parseInt(document.getElementById('goal-units').value);
         project.completedUnits = parseInt(document.getElementById('completed-units').value) || 0;
       } else {
         const amount = parseFloat(document.getElementById('goal-amount').value);
         const unit = document.getElementById('time-unit').value;
         project.goalMinutes = unit === 'hours' ? amount * 60 : amount;
         project.completedMinutes = parseFloat(document.getElementById('completed-amount').value) || 0;
       }
       data.currentProjectId = editingProjectId;
       saveProgress(data);
     }
     editingProjectId = null;
     hideSetupOverlay();
     if (typeof resetAccumulatedMinutes === 'function') resetAccumulatedMinutes();
     initTrack();
     updateProjectNameDisplay();
     return;
   }

  if (selectedChannel === 1) {
    const unitName = document.getElementById('unit-name').value;
    const goalUnits = parseInt(document.getElementById('goal-units').value);
    if (!unitName || !goalUnits) return alert('단위 이름과 목표 개수를 입력해주세요');
    addProject({ name: projectName, channel: 1, unitName, goalUnits });
    const completedUnits = parseInt(document.getElementById('completed-units').value) || 0;
    if (completedUnits > 0) {
     const data = loadProgress();
     const project = data.projects.find(p => p.id === data.currentProjectId);
     if (project) { project.completedUnits = completedUnits; saveProgress(data); }
    }
  } else {
    const amount = parseFloat(document.getElementById('goal-amount').value);
    const unit = document.getElementById('time-unit').value;
    if (!amount) return alert('목표 시간을 입력해주세요');
    const goalMinutes = unit === 'hours' ? amount * 60 : amount;
    addProject({ name: projectName, channel: 2, goalMinutes });
    const completedAmount = parseFloat(document.getElementById('completed-amount').value) || 0;
    if (completedAmount > 0) {
     const data = loadProgress();
     const project = data.projects.find(p => p.id === data.currentProjectId);
     if (project) { project.completedMinutes = completedAmount; saveProgress(data); }
    }
  }

  hideSetupOverlay();
  if (typeof resetAccumulatedMinutes === 'function') resetAccumulatedMinutes();
  initTrack();
  updateProjectNameDisplay();
});

let chDialPressTimer = null;

document.getElementById('dial-ch').addEventListener('mousedown', () => {
  chDialPressTimer = setTimeout(() => {
    chDialPressTimer = null;
    if (typeof showCFEditPopup === 'function') showCFEditPopup();
  }, 600);
});
document.getElementById('dial-ch').addEventListener('mouseup', () => {
  if (chDialPressTimer) {
    clearTimeout(chDialPressTimer);
    chDialPressTimer = null;
    showSetupOverlay();
  }
});

document.getElementById('dial-ch').addEventListener('mouseleave', () => {
  if (chDialPressTimer) {
    clearTimeout(chDialPressTimer);
    chDialPressTimer = null;
  }
});
