'use strict';

const CF_STORAGE_KEY = 'cfItems';

const DEFAULT_CF_ITEMS = [
  { id: 1, emoji: '💧', text: '물 한 잔' },
  { id: 2, emoji: '🧘', text: '스트레칭' },
  { id: 3, emoji: '🌬️', text: '심호흡' },
  { id: 4, emoji: '🍵', text: '차 한 잔' },
  { id: 5, emoji: '🚶', text: '걷기' },
];

const CF_ITEM_DISPLAY_SECONDS = 15;

function getCFItems() {
  const raw = localStorage.getItem(CF_STORAGE_KEY);
  if (!raw) return DEFAULT_CF_ITEMS;
  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) && items.length > 0 ? items : DEFAULT_CF_ITEMS;
  } catch {
    return DEFAULT_CF_ITEMS;
  }
}

function setCFItems(items) {
  localStorage.setItem(CF_STORAGE_KEY, JSON.stringify(items));
}

let cfWarningFired = false;

function showCFScreen(breakDurationSeconds) {
  cfWarningFired = false;
  const items = getCFItems();
  const item = items[Math.floor(Math.random() * items.length)];
  const screen = document.querySelector('.tv-screen');
  if (!screen) return;

  // subtitle-bar 숨기기
  const subtitleBar = document.querySelector('.subtitle-bar');
  if (subtitleBar) subtitleBar.style.display = 'none';

  Array.from(screen.children).forEach(el => {
    if (el.id !== 'cf-overlay' && !el.classList.contains('subtitle-bar')) {
    el.dataset.prevDisplay = el.style.display;
    el.style.display = 'none';
    }
  });

  const cfDiv = document.createElement('div');
  cfDiv.id = 'cf-overlay';
  cfDiv.style.cssText = `
    position: absolute; inset: 0;
    background: #1c1e16;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.8s ease;
    z-index: 0;
  `;
  cfDiv.innerHTML = `
    <div id="cf-emoji" style="transition: opacity 0.8s ease;">${item.emoji}</div>
    <div id="cf-text" style="font-family: monospace; color: #d4a843; transition: opacity 0.8s ease;">${item.text}</div>
  `;
  screen.appendChild(cfDiv);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { cfDiv.style.opacity = '1'; });
  });

  setTimeout(() => {
    const emoji = document.getElementById('cf-emoji');
    const text = document.getElementById('cf-text');
    if (emoji) emoji.style.opacity = '0';
    if (text) text.style.opacity = '0';
  }, CF_ITEM_DISPLAY_SECONDS * 1000);
}

function onBreakOneMinuteLeft() {
  //if (cfWarningFired) return;
  //cfWarningFired = true;
  // subtitle-bar 다시 보여주기
  const subtitleBar = document.querySelector('.subtitle-bar');
  if (subtitleBar) subtitleBar.style.display = 'flex';
  if (typeof showSessionComingMessage === 'function') {
     showSessionComingMessage();
   }
  if (typeof playBellSound === 'function') {
    playBellSound();
  }
}

function hideCFScreen() {
  cfWarningFired = false;
  const cfDiv = document.getElementById('cf-overlay');
  if (cfDiv) {
    cfDiv.style.opacity = '0';
    setTimeout(() => {
      cfDiv.remove();
      const screen = document.querySelector('.tv-screen');
      if (screen) {
        Array.from(screen.children).forEach(el => {
          if (!el.classList.contains('subtitle-bar')) {
            el.style.display = el.dataset.prevDisplay ?? '';
          }
        });
      }
      // subtitle-bar 복원
      const subtitleBar = document.querySelector('.subtitle-bar');
      if (subtitleBar) subtitleBar.style.display = '';
    }, 800);
  }
}

function renderCFEditor() {
  const container = document.getElementById('cf-item-list');
  if (!container) return;
  container.innerHTML = '';
  const items = getCFItems();

  if (items.length === 0) {
    container.innerHTML = '<p style="color:#888; font-size:11px; font-family:monospace;">항목 없음</p>';
    return;
  }

  items.forEach(item => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:6px; margin-bottom:6px; align-items:center;';
    row.innerHTML = `
      <input class="cf-emoji-input" type="text" value="${item.emoji}" maxlength="2" data-id="${item.id}"
        style="width:36px; text-align:center; padding:6px; background:#2a2a2a; border:1px solid #444; border-radius:4px; color:#f0f0f0; font-size:14px;">
      <input class="cf-text-input" type="text" value="${item.text}" data-id="${item.id}"
        style="flex:1; padding:6px 8px; background:#2a2a2a; border:1px solid #444; border-radius:4px; color:#f0f0f0; font-family:monospace; font-size:12px;">
      <button class="del-btn cf-del-btn" data-id="${item.id}">✕</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.cf-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      setCFItems(getCFItems().filter(i => i.id !== id));
      renderCFEditor();
    });
  });
}

function saveCFEdits() {
  const rows = document.querySelectorAll('#cf-item-list > div');
  const items = [];
  rows.forEach(row => {
    const emojiEl = row.querySelector('.cf-emoji-input');
    const textEl = row.querySelector('.cf-text-input');
    if (!emojiEl || !textEl) return;
    const text = textEl.value.trim();
    if (text) items.push({ id: parseInt(emojiEl.dataset.id), emoji: emojiEl.value.trim() || '✨', text });
  });
  setCFItems(items);
}

function addCFItem() {
  const items = getCFItems();
  items.push({ id: Date.now(), emoji: '✨', text: '새 항목' });
  setCFItems(items);
  renderCFEditor();
}

function showCFEditPopup() {
  const popup = document.getElementById('cf-edit-popup');
  if (popup) { renderCFEditor(); popup.style.display = 'flex'; }
}

function hideCFEditPopup() {
  saveCFEdits();
  const popup = document.getElementById('cf-edit-popup');
  if (popup) popup.style.display = 'none';
}

window.addEventListener('load', () => {
  const addBtn = document.getElementById('cf-add-btn');
  if (addBtn) addBtn.addEventListener('click', addCFItem);

  const saveBtn = document.getElementById('cf-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', hideCFEditPopup);

  const closeBtn = document.getElementById('cf-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', hideCFEditPopup);
});