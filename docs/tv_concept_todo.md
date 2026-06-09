# TV 컨셉 보강 — 실행 체크리스트 (개정판 v2)

> 이 체크리스트는 순서대로 진행한다. 각 단계는 독립적으로 커밋·검증 가능한 최소 단위로 쪼개져 있다.  
> 격리 구역(`cf.js`의 데이터 구조·로직, `track.js`, `progress5.js`, `subtitle.js`, `tuning.js`, `storage.js`)은 어떤 단계에서도 수정하지 않는다.

### v2 변경 사항

- PHASE 1 이미지 파일 준비 → 오디오 파일 준비만 남김
- PHASE 5 (cf.js 이미지화) → 전면 삭제
- PHASE 6 (style.css) → UI 스케일업 CSS로 내용 교체
- PHASE 7 신규 → cf.js 최소 수정 (inline font-size 제거)
- Self-QA의 CF 이미지 QA → UI 스케일업 QA로 교체

---

## PHASE 1 — 파일·폴더 준비

- [x] **1-1** `assets/` 폴더를 프로젝트 루트에 생성한다
- [x] **1-2** `assets/audio/` 폴더를 생성한다
- [ ] **1-3** 1~3분짜리 로파이 BGM `.mp3` 파일을 `assets/audio/lofi_bgm.mp3`로 저장한다 (용량 3MB 이하 권장)

---

## PHASE 2 — `bgm.js` 신규 파일 작성

- [x] **2-1** 프로젝트 루트에 `bgm.js` 파일을 생성한다
- [x] **2-2** `'use strict';` 선언과 상수(`BGM_DEFAULT_VOLUME = 0.28`, `BGM_FADE_DURATION_MS = 2000`, `BGM_FADE_IN_DURATION_MS = 1500`)를 작성한다
- [x] **2-3** `bgmAudio`, `bgmFadeTimer` 모듈 변수를 `null`로 선언한다
- [x] **2-4** `_getBgmAudio()` 내부 함수를 작성한다 — `new Audio('assets/audio/lofi_bgm.mp3')`, `loop = true`, `volume = 0`, `onerror` 핸들러(`bgmAudio = null`) 포함
- [x] **2-5** `_clearFade()` 내부 함수를 작성한다 — `clearInterval(bgmFadeTimer)` 및 `bgmFadeTimer = null`
- [x] **2-6** `_fadeVolume(audio, fromVol, toVol, durationMs, onComplete)` 내부 함수를 작성한다 — `setInterval` 기반 30스텝 볼륨 보간, 완료 시 `onComplete` 콜백
- [x] **2-7** `bgmPlay()` 공개 함수를 작성한다 — null 가드, `_clearFade()`, `audio.play().catch(...)`, `_fadeVolume()` fade-in 호출
- [x] **2-8** `bgmFadeOut(durationMs)` 공개 함수를 작성한다 — null·paused 가드, `_clearFade()`, fade-out 후 `audio.pause()` 콜백
- [x] **2-9** `bgmStop()` 공개 함수를 작성한다 — `_clearFade()`, `pause()`, `currentTime = 0`, `volume = 0`
- [ ] **2-10** 브라우저 콘솔에서 `bgmPlay()` / `bgmFadeOut()` / `bgmStop()` 직접 호출로 단독 동작 확인

---

## PHASE 3 — `index.html` 수정

- [x] **3-1** `<script src="sound.js"></script>` 바로 아래 줄에 `<script src="bgm.js"></script>`를 추가한다
- [ ] **3-2** 브라우저 새로고침 후 콘솔 오류 없음을 확인한다 (bgm.js 로드 실패, 변수 충돌 등)

---

## PHASE 4 — `timer.js` 수정 (BGM 호출 5곳)

> 기존 로직을 삭제하거나 이동하지 않는다. `typeof` 가드 한 줄씩만 추가한다.

- [x] **4-1** `startTimer()` 함수 내 `runTimer()` 호출 **직전**에 아래 줄을 삽입한다
  ```javascript
  if (typeof bgmPlay === 'function') bgmPlay();
  ```
- [x] **4-2** `pauseTimer()` 함수 내 `clearInterval(timerId)` **이후**에 아래 줄을 삽입한다
  ```javascript
  if (typeof bgmFadeOut === 'function') bgmFadeOut();
  ```
- [x] **4-3** `resetTimer()` 함수 내 `timeLeft = 25 * 60` 할당 **이후**에 아래 줄을 삽입한다
  ```javascript
  if (typeof bgmStop === 'function') bgmStop();
  ```
- [x] **4-4** `onPhaseEnd()` — `currentPhase === 'session'` 분기에서 `showCFScreen(...)` 호출 **바로 다음 줄**에 삽입한다
  ```javascript
  if (typeof bgmFadeOut === 'function') bgmFadeOut();
  ```
- [x] **4-5** `onPhaseEnd()` — `else` 분기(break→session)에서 `hideCFScreen()` 호출 **바로 다음 줄**에 삽입한다
  ```javascript
  if (typeof bgmPlay === 'function') bgmPlay();
  ```
- [ ] **4-6** 브라우저에서 ▶ 버튼 클릭 시 BGM이 fade-in 재생되는지 육안·청각 확인

---

## PHASE 5 — `style.css` 수정 (UI 스케일업)

> 기존 규칙을 찾아 수정하거나, 새 규칙을 파일 하단에 추가한다. 격리 구역 관련 선택자는 건드리지 않는다.

- [x] **5-1** `.timer-display`의 `font-size: 56px`를 `font-size: clamp(64px, 7.5vw, 130px)`로 수정한다
- [x] **5-2** `.timer-display`의 `text-shadow`를 `0 0 30px rgba(212, 168, 67, 0.4)`로 강화한다 (glow 효과 확대)
- [x] **5-3** `.timer-area`의 `padding: 24px 20px`를 `padding: 10px 20px`로 수정한다 (수직 여백 축소, 타이머 공간 확보)
- [x] **5-4** `.subtitle-bar`의 `padding: 6px 14px`를 `padding: 10px 18px`로 수정한다
- [x] **5-5** `.subtitle-bar`의 `min-height: 28px`를 `min-height: 46px`로 수정한다
- [x] **5-6** `.subtitle-bar`의 `gap: 8px`를 `gap: 10px`로 수정한다
- [x] **5-7** `.subtitle-dot`의 `width: 5px; height: 5px`를 `width: 8px; height: 8px`로 수정한다
- [x] **5-8** `.subtitle-text`의 `font-size: 10px`를 `font-size: 17px`로 수정한다
- [x] **5-9** `style.css` 하단에 CF 화면 스케일업 규칙 블록을 **추가**한다
  ```css
  /* CF 화면 이모지·텍스트 스케일업 */
  #cf-emoji {
    font-size: clamp(80px, 11vw, 180px);
    line-height: 1;
    text-align: center;
  }

  #cf-text {
    font-size: clamp(16px, 1.8vw, 28px);
    letter-spacing: 0.06em;
  }
  ```

---

## PHASE 6 — `cf.js` 최소 수정 (inline font-size 제거)

> 이 단계에서 수정하는 것은 `showCFScreen()` 함수 내 innerHTML 문자열의 `font-size` 속성 **2줄**뿐이다.  
> 데이터 구조(`DEFAULT_CF_ITEMS`), 로직, 이벤트, localStorage — 일체 건드리지 않는다.

- [x] **6-1** `cf.js`의 `showCFScreen()` 함수 내 `cfDiv.innerHTML` 에서 `#cf-emoji` div의 inline style에서 `font-size: 48px;`를 **제거**한다 (transition 등 나머지 속성은 유지)
  ```javascript
  // 변경 전
  <div id="cf-emoji" style="font-size: 48px; transition: opacity 0.8s ease;">
  // 변경 후
  <div id="cf-emoji" style="transition: opacity 0.8s ease;">
  ```
- [x] **6-2** 같은 `cfDiv.innerHTML` 에서 `#cf-text` div의 inline style에서 `font-size: 14px;`를 **제거**한다 (font-family, color, transition 등 나머지 속성은 유지)
  ```javascript
  // 변경 전
  style="font-family: monospace; font-size: 14px; color: #d4a843; transition: opacity 0.8s ease;"
  // 변경 후
  style="font-family: monospace; color: #d4a843; transition: opacity 0.8s ease;"
  ```
- [ ] **6-3** 브라우저에서 세션 종료 → CF 화면 전환 시 이모지와 텍스트가 크게 표시되는지 확인

---

## PHASE 7 — 통합 확인 및 마무리

- [x] **7-1** 브라우저 새로고침 후 콘솔에 JavaScript 오류가 없는지 확인한다
- [x] **7-2** `git diff --name-only`로 수정된 파일 목록을 확인한다 — `bgm.js`, `cf.js`, `timer.js`, `index.html`, `style.css` 외 파일이 포함되어 있으면 즉시 되돌린다
- [x] **7-3** DevTools > Elements에서 `.timer-display`의 computed font-size가 `56px`보다 크게 적용되었는지 확인한다
- [x] **7-4** DevTools > Elements에서 `.subtitle-text`의 computed font-size가 `17px`인지 확인한다

---

## PHASE 8 — 자체 품질 검사 (Self-QA)

아래 시나리오를 **순서대로** 브라우저에서 직접 수행한다.

### BGM QA

| # | 시나리오 | 기대 결과 |
|---|---|---|
| B-1 | 페이지 첫 진입 후 아무 버튼도 누르지 않음 | BGM 재생되지 않음 (자동 재생 없음) |
| B-2 | ▶ 버튼 클릭 (첫 시작) | 1.5초에 걸쳐 BGM이 부드럽게 fade-in 재생됨 |
| B-3 | 재생 중 ▶ 버튼 재클릭 (일시정지) | 2초에 걸쳐 BGM이 fade-out 후 정지 |
| B-4 | 일시정지 상태에서 ▶ 버튼 재클릭 (재개) | BGM이 이어서 fade-in 재생됨 |
| B-5 | 재생 중 ⏹ 버튼 클릭 | BGM이 fade-out 후 정지 |
| B-6 | ↺ 리셋 버튼 클릭 | BGM이 즉시 정지하고 처음 위치로 초기화됨 |
| B-7 | 세션 종료 → 휴식 자동 전환 시점 | BGM이 fade-out되며 CF 화면 표시 |
| B-8 | 휴식 종료 → 세션 자동 재시작 시점 | BGM이 fade-in으로 재개됨 |
| B-9 | `assets/audio/lofi_bgm.mp3` 파일을 임시 이름 변경 후 테스트 | 콘솔에 `[BGM] 오디오 파일 로드 실패` 경고만 출력, 앱 동작 정상 |

### UI 스케일업 QA

| # | 시나리오 | 기대 결과 |
|---|---|---|
| U-1 | 브라우저 DevTools > Elements > `.timer-display` computed 스타일 확인 | `font-size`가 `56px`보다 크게 적용됨 (1920px 기준 약 130px) |
| U-2 | TV 화면에서 타이머 숫자 육안 확인 | 브라운관 화면 중앙을 크게 채우며 가독성 높게 표시됨 |
| U-3 | 자막 바 높이 및 텍스트 크기 육안 확인 | 기존 대비 자막 바가 더 높고 텍스트가 명확하게 보임 |
| U-4 | 세션 종료 → CF 화면 전환 시 이모지 크기 확인 | 이모지가 TV 화면 중앙을 크게 채움 (기존 48px 대비 2~3배 이상) |
| U-5 | CF 화면 하단 텍스트(예: `물 한 잔`) 크기 확인 | 기존 14px 대비 명확하게 크고 읽기 쉬움 |
| U-6 | 브라우저 창을 절반 크기로 축소 후 레이아웃 확인 | `clamp()` 적용으로 타이머·이모지가 작은 화면에서도 overflow 없이 표시됨 |

### 기존 기능 회귀(Regression) QA

| # | 시나리오 | 기대 결과 |
|---|---|---|
| R-1 | 세션 종료 시 벨 소리 확인 | 기존 3화음 벨 사운드 정상 재생 |
| R-2 | TUNING 다이얼 클릭 3회 → 세션 단축 확인 | tuning.js 동작 정상 (격리 구역 무결성) |
| R-3 | CH 다이얼 짧게 클릭 → 채널 설정 팝업 표시 | 기존 setup.js 동작 정상 |
| R-4 | CH2 채널에서 진행률 트랙(progress bar) 확인 | track.js / progress5.js 동작 정상 |
| R-5 | 자막 바 표시 확인 (세션 시작 메시지 등) | subtitle.js 동작 정상, 크기 확대 후 텍스트 잘림 없음 |
| R-6 | 휴식 1분 전 경고 벨 소리 확인 | `onBreakOneMinuteLeft()` → `playBellSound()` 정상 호출 |
| R-7 | CH 다이얼 꾹 누르기 → CF 편집 팝업 열기 → 이모지·텍스트 수정 → 저장 | cf.js 데이터 구조 및 편집 기능 정상 동작 |
| R-8 | CF 편집 팝업에서 항목 추가 / 삭제 후 휴식 전환 | 저장된 이모지·텍스트가 스케일업된 크기로 CF 화면에 표시됨 |
