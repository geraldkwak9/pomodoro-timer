let timeLeft = 25 * 60; // 25분
let timerId = null;
let isRunning = false;

const timerDisplay = document.getElementById("timer");

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;

    timerId = setInterval(() => {
        timeLeft--;

        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            isRunning = false;
            alert("집중 시간 종료!");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timerId);

    timeLeft = 25 * 60;
    isRunning = false;

    updateDisplay();
}

document.getElementById("startBtn")
    .addEventListener("click", startTimer);

document.getElementById("pauseBtn")
    .addEventListener("click", pauseTimer);

document.getElementById("resetBtn")
    .addEventListener("click", resetTimer);

updateDisplay();