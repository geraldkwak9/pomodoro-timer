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
// [상황 2] 세션이 1분 이하일때
// ──────────────────────────────────────────
function checkOneMinuteLeft(timeText) {
    // timeText가 "00:59" 라면 앞의 두 글자 "00"을 추출합니다.
    const minutes = timeText.split(':')[0]; 

    // 분이 "00"이라는 것은 남은 시간이 1분 미만(59초 이하)이라는 뜻입니다.
    // 추가로 "01:00"인 순간도 포함하기 위해 함께 체크합니다.
    if (minutes === "00" || timeText === "01:00") {
        updateSubtitle("곧 타이머가 종료됩니다", true);
    }
}

// ──────────────────────────────────────────
// [상황 3] 세션이 15분으로 바뀌었을 때
// ──────────────────────────────────────────
function showSessionChangedMessage() {
    updateSubtitle("세션이 15분으로 바뀝니다", true);
}

// ──────────────────────────────────────────
// [상황 4] 세션이 시작했을 때
// ──────────────────────────────────────────
function showSessionStartMessage() {
    updateSubtitle("세션이 시작되었습니다", false);
}

// ──────────────────────────────────────────
// [상황 5] 세션이 종료되었을 때
// ──────────────────────────────────────────
function showSessionEndMessage() {
    updateSubtitle("세션이 종료되었습니다", true); // 강조를 위해 빨간색(true) 처리
}
// ──────────────────────────────────────────
// [상황 6] 리셋 버튼을 눌렀을 때
// ──────────────────────────────────────────
function showResetMessage() {
    updateSubtitle("타이머가 리셋되었습니다", false);
}

// ──────────────────────────────────────────
// [상황 7] 일시정지 되었을 때
// ──────────────────────────────────────────
function showPauseMessage() {
    updateSubtitle("타이머가 일시중지되었습니다", false);
}

// ──────────────────────────────────────────
// [상황 8] 중지(⏹) 버튼을 눌렀을 때
// ──────────────────────────────────────────
function showStopMessage() {
    updateSubtitle("타이머가 중단되었습니다", false);
}

// ──────────────────────────────────────────
// [상황 9] 단위 완료(✓) 버튼을 눌렀을 때
// ──────────────────────────────────────────
function showUnitCompleteMessage() {
    updateSubtitle("단위가 완료되었습니다", false);
}
