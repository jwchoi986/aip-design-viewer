// ============================================================
// Aip 리서치 뷰어 — 구글시트 메모 백엔드 (Google Apps Script)
// ------------------------------------------------------------
// 팀원들의 메모를 하나의 구글시트에 실시간 누적/조회하기 위한 스크립트.
// index.html 의 "구글시트 연동" 칸에 이 스크립트의 배포 URL을 넣으면 켜집니다.
//
//   • doPost : 메모 1건 추가 (앱에서 저장 시 호출)
//   • doGet  : 전체 메모 조회 (앱이 몇 초마다 폴링 → 실시간 공동 확인)
//              CORS 우회를 위해 callback 파라미터가 오면 JSONP로 응답
//
// [설정 방법]
// 1. 구글시트 새로 만들기 → 1행에 헤더 입력:
//    researcher | account_id | design_idx | design_title | memo | ts
// 2. 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭
// 3. 기본 코드 지우고 이 파일 전체 붙여넣기 → 저장
// 4. 상단 [배포] → [새 배포] → 유형 "웹 앱"
//      - 실행 계정: 나
//      - 액세스 권한: "모든 사용자"   (링크만 있으면 기록/조회 가능)
// 5. 생성된 "웹 앱 URL"(https://script.google.com/macros/s/..../exec) 복사
// 6. index.html 사이드바 "구글시트 연동" 칸에 붙여넣기
//    → 팀원 모두 같은 URL 입력 시 서로의 메모가 실시간으로 보이고 추가됩니다.
//
// ※ 코드 수정 후에는 반드시 [배포] → [배포 관리] → 편집(연필) → "새 버전"으로 재배포해야 반영됩니다.
// ============================================================

var HEADERS = ['researcher', 'account_id', 'design_idx', 'design_title', 'memo', 'ts'];

function sheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

// ---------- 메모 추가 ----------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    sheet_().appendRow([
      data.researcher || '',
      data.account_id || '',
      data.design_idx || '',
      data.design_title || '',
      data.memo || '',
      data.ts || new Date().toISOString()
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// ---------- 메모 조회 (전체) ----------
function doGet(e) {
  var out = { ok: true, notes: [] };
  try {
    var values = sheet_().getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {       // 1행(헤더) 제외
      var row = values[i];
      if (!row[1] && !row[4]) continue;              // 빈 행 스킵
      var o = {};
      for (var c = 0; c < HEADERS.length; c++) o[HEADERS[c]] = row[c] !== undefined ? String(row[c]) : '';
      out.notes.push(o);
    }
  } catch (err) {
    out = { ok: false, error: String(err), notes: [] };
  }
  // JSONP (callback 파라미터가 있으면 크로스도메인 조회 지원)
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify(out) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(out);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
