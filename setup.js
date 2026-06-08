// setup.js
// 역할: 채널/프로젝트 설정 팝업 로직
// 의존: progress5.js (loadProgress, saveProgress, addProject, getProjectsByChannel, setCurrentProject)
//       track.js (initTrack)
let selectedChannel = 1;

function showSetupOverlay() {
  document.getElementById('setup-overlay').style.display = 'flex';
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
      : `${p.name} (${p.completedMinutes}/${p.goalMinutes}분)`;
    btn.addEventListener('click', () => {
      setCurrentProject(p.id);
      hideSetupOverlay();
      initTrack();
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

window.addEventListener('load', () => {
  const data = loadProgress();
  if (!data.currentProjectId) {
    showSetupOverlay();
  } else {
    initTrack(); // 이어보기 시 트랙 초기화
  }
});

document.getElementById('ch1-btn').addEventListener('click', () => {
  selectedChannel = 1;
  document.getElementById('ch1-fields').style.display = 'block';
  document.getElementById('ch2-fields').style.display = 'none';
  document.getElementById('step-channel').style.display = 'none';
  document.getElementById('step-project').style.display = 'block';
  renderProjectList(1);
});

document.getElementById('ch2-btn').addEventListener('click', () => {
  selectedChannel = 2;
  document.getElementById('ch1-fields').style.display = 'none';
  document.getElementById('ch2-fields').style.display = 'block';
  document.getElementById('step-channel').style.display = 'none';
  document.getElementById('step-project').style.display = 'block';
  renderProjectList(2);
});

document.getElementById('free-btn').addEventListener('click', () => {
  hideSetupOverlay();
});

document.getElementById('close-btn').addEventListener('click', () => {
  hideSetupOverlay();
});

document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('step-channel').style.display = 'block';
  document.getElementById('step-project').style.display = 'none';
});

document.getElementById('setup-confirm').addEventListener('click', () => {
  const projectName = document.getElementById('project-name').value;
  if (!projectName) return alert('프로젝트 이름을 입력해주세요');

  if (selectedChannel === 1) {
    const unitName = document.getElementById('unit-name').value;
    const goalUnits = parseInt(document.getElementById('goal-units').value);
    if (!unitName || !goalUnits) return alert('단위 이름과 목표 개수를 입력해주세요');
    addProject({ name: projectName, channel: 1, unitName, goalUnits });
  } else {
    const amount = parseFloat(document.getElementById('goal-amount').value);
    const unit = document.getElementById('time-unit').value;
    if (!amount) return alert('목표 시간을 입력해주세요');
    const goalMinutes = unit === 'hours' ? amount * 60 : amount;
    addProject({ name: projectName, channel: 2, goalMinutes });
  }

  hideSetupOverlay();
  initTrack();
});

document.getElementById('dial-ch').addEventListener('click', () => {
  showSetupOverlay();
});