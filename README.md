# Aip 디자인 리서치 뷰어

> 생성: 2026-07-14 | 작성자: jwchoi+Claude | 맥락: 구글시트가 썸네일 수만 개 동시 렌더로 느려 대체 환경을 HTML로 구축

Aip 사용자별 생성 디자인을 한 장씩 크게 보며, 잘 쓰는/못 쓰는 유저 패턴을 메모·분석하는 도구입니다.

---

## 무엇을 해결하나

- 구글시트가 느렸던 이유: 이미지가 무거운 게 아니라 **원격 썸네일 수만 개를 한꺼번에 렌더링**해서.
- 이 뷰어는 **한 번에 한 디자인만** 불러오므로 가볍고 빠릅니다.

## 화면 구성

| 영역 | 내용 |
|---|---|
| 좌측 | 내 이름 · 정렬(헤비→라이트) · 유저 검색 · 구글시트 연동 · **유저 목록** → 클릭 시 그 유저의 디자인 목록(썸네일)이 펼쳐짐 → 디자인 클릭 시 중앙에 크게 |
| 중앙 | "유저 › 디자인 N/M" 경로 + 디자인 이미지(크게) + 페이지 넘김 + 이전/다음 디자인 + 슬라이더 |
| 우측 | 유저 정보 + 메모 작성 + **이 디자인의 메모(팀 실시간 피드)** + CSV 내보내기 |

- 유저 행·디자인 행에 메모 개수 배지(✎N)가 표시되어 어디에 메모가 쌓였는지 한눈에 보입니다.
- 현재 보고 있는 디자인은 목록에서 하이라이트됩니다.

**단축키**: `←`/`→` 같은 유저 내 디자인 이동 · `Ctrl/Cmd`+`Enter` 메모 저장

---

## 실행 방법 (로컬)

`file://` 로 바로 열면 브라우저가 데이터 파일을 못 읽으므로, 폴더에서 간이 서버를 띄웁니다.

```bash
cd outputs/vibe-coding/aip-design-viewer
python3 -m http.server 8765
# 브라우저에서 http://localhost:8765 접속
```

> 데이터는 `data/designs.csv.gz`(11MB)를 브라우저가 자동으로 풀어서 로딩합니다.
> 최신 데이터로 교체하려면: `gzip -c 새데이터.csv > data/designs.csv.gz`

---

## 메모 저장 · 실시간 공유

- **구글시트 연동 시(권장)**: 저장하면 팀 구글시트에 누적되고, 앱이 **6초마다 자동 갱신(polling)** 하여 다른 사람이 남긴 메모가 우측 피드에 실시간으로 나타납니다. 조회는 CORS 우회를 위해 JSONP로 처리합니다.
- **연동 안 할 때**: 메모는 이 브라우저(localStorage)에만 저장 — 혼자 볼 때 사용.
- **CSV 내보내기**: 우측 하단 버튼 → `research_notes.csv` 다운로드 (엑셀/시트에서 열림).

메모 레코드: `researcher, account_id, design_idx, design_title, memo, ts`
우측 피드는 최신순으로 정렬되며, 내가 쓴 메모는 초록색 테두리로 구분됩니다.

> 연동 상태는 우측 "이 디자인의 메모" 헤더에 표시됩니다: 🟢실시간 / ⚪로컬 / 연결 확인 필요.

---

## 팀 공유 설정 (구글시트 + 무료 배포)

### 1) 구글시트 연동 (메모 실시간 공유)
`google-apps-script.gs` 파일 상단 주석의 단계를 따라 하세요. 요약:
1. 구글시트 생성 → 1행 헤더: `researcher | account_id | design_idx | design_title | memo | ts`
2. [확장 프로그램] → [Apps Script] → `google-apps-script.gs` 내용 붙여넣기
3. [배포] → [웹 앱], 액세스 "모든 사용자" → 웹 앱 URL 복사
4. 뷰어 사이드바 "구글시트 연동" 칸에 URL 붙여넣기

### 2) 뷰어 링크 공유 (GitHub Pages, 무료)
```bash
# 이 폴더를 깃 레포로 올린 뒤
git init && git add . && git commit -m "feat: Aip 디자인 리서치 뷰어"
git branch -M main
git remote add origin https://github.com/<유저명>/aip-design-viewer.git
git push -u origin main
```
GitHub → 레포 [Settings] → [Pages] → Source: `main` / `/root` → 저장
→ 발급된 `https://<유저명>.github.io/aip-design-viewer/` 링크를 팀에 공유.

> 팀원은 링크 접속 → 각자 이름 입력 → 메모 저장 → 모두 같은 구글시트에 누적됩니다.
> (구글시트 URL은 각자 한 번 입력하면 브라우저에 기억됩니다.)

---

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 뷰어 앱 전체 (화면 + 로직) |
| `data/designs.csv.gz` | 디자인 데이터 (gzip) |
| `google-apps-script.gs` | 구글시트 메모 수집 백엔드 |
| `README.md` | 이 문서 |
