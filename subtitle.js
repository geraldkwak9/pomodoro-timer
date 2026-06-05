function updateSubtitle(text, isWarning) {
    const subtitleText = document.querySelector(".subtitle-text");
    const subtitleBar = document.querySelector(".subtitle-bar");
    if (!subtitleText || !subtitleBar) return;

    subtitleText.textContent = text; 

    if (isWarning) {
        subtitleText.style.color = "#ff4d4d";
        subtitleBar.style.borderTop = "1px solid #ff4d4d";
    } else {
        //  평소 상황 (목표 입력 등)
        subtitleText.style.color = "var(--accent-amber)";
        subtitleBar.style.borderTop = "1px solid #1a1a1a";
    }
}

// ──────────────────────────────────────────
// [상황 1] 목표 단위를 입력했을 때
// ──────────────────────────────────────────
function showGoalSetMessage() {
    updateSubtitle("목표단위가 입력되었습니다", false);
}

// ──────────────────────────────────────────
// [상황 2] 1분 전 감지
// ──────────────────────────────────────────
function checkOneMinuteLeft(timeText) {
    // 1번 담당자 타이머 글자가 "01:00"이 되면 작동
    if (timeText === "01:00") {
        updateSubtitle("곧 타이머가 종료됩니다", true);
    }
}

// ──────────────────────────────────────────
// [상황 3] 세션이 15분으로 바뀌었을 때
// ──────────────────────────────────────────
function showSessionChangedMessage() {
    updateSubtitle("세션이 15분으로 바뀝니다", true);
}