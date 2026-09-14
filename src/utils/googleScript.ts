/**
 * Integration service for Google Apps Script Web App (Google Sheets Database)
 */

export const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyzddMeJefYoZcFQVUXYMeXjjHQUYgIrbxW7wdmKRZZ9QKVqgxpRKsIRqcxTY1xxdpD9A/exec';

export interface SheetRecordPayload {
  studentName?: string;
  name?: string;
  fullName?: string;
  studentClass?: string;
  class?: string;
  studentNumber?: string;
  number?: string;
  studentId?: string;
  timestamp?: string;
  isoTimestamp?: string;
  eventType?: string;
  action?: string;
  score?: number | string;
  totalQuestions?: number | string;
  accuracy?: number | string;
  coins?: number | string;
  details?: string;
}

/**
 * Send learning records or student logs to Google Apps Script / Google Sheets
 */
export async function syncToGoogleSheet(data: SheetRecordPayload): Promise<boolean> {
  const timestamp = data.timestamp || new Date().toLocaleString('th-TH');
  const studentName = data.studentName || data.name || data.fullName || '';
  const studentClass = data.studentClass || data.class || '';
  const studentNumber = data.studentNumber || data.number || '';
  const eventType = data.eventType || data.action || 'กิจกรรมในบทเรียน';

  const payload: SheetRecordPayload = {
    ...data,
    studentName,
    name: studentName,
    fullName: studentName,
    studentClass,
    class: studentClass,
    studentNumber,
    number: studentNumber,
    studentId: data.studentId || `${studentClass} เลขที่ ${studentNumber}`,
    timestamp,
    isoTimestamp: data.isoTimestamp || new Date().toISOString(),
    eventType,
    action: eventType,
  };

  const queryParams = new URLSearchParams({
    studentName,
    name: studentName,
    fullName: studentName,
    studentClass,
    class: studentClass,
    studentNumber,
    number: studentNumber,
    studentId: payload.studentId || '',
    timestamp,
    eventType,
    action: eventType,
    score: String(data.score ?? ''),
    accuracy: String(data.accuracy ?? ''),
    coins: String(data.coins ?? ''),
    details: data.details || '',
  }).toString();

  const targetUrl = `${GOOGLE_SCRIPT_URL}?${queryParams}`;

  try {
    // 1. Primary transmission: POST with JSON body + URL query parameters (mode: no-cors)
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // 2. Secondary fallback: GET beacon to ensure scripts with only doGet also capture parameters
    fetch(targetUrl, { method: 'GET', mode: 'no-cors' }).catch(() => {});
    return true;
  } catch (err) {
    console.warn('Data sync to Google Apps Script encountered an issue:', err);
    return false;
  }
}

/**
 * Google Apps Script (Code.gs) template for teachers to paste in Google Sheets
 */
export const RECOMMENDED_GAS_SCRIPT = `function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = data.timestamp || new Date().toLocaleString('th-TH');
    var studentName = data.studentName || data.name || data.fullName || '';
    var studentClass = data.studentClass || data.class || '';
    var studentNumber = data.studentNumber || data.number || '';
    var eventType = data.eventType || data.action || 'เข้าสู่ระบบ';
    var score = data.score !== undefined ? data.score : '';
    var accuracy = data.accuracy !== undefined ? data.accuracy : '';
    var details = data.details || '';
    
    // ตั้งค่าหัวตารางอัตโนมัติหากยังไม่มีข้อมูล
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['วัน-เวลา', 'ชื่อ-นามสกุล', 'ชั้น', 'เลขที่', 'กิจกรรม/สถานะ', 'คะแนน', 'ความแม่นยำ (%)', 'รายละเอียดเพิ่มเติม']);
    }
    
    // บันทึกแถวข้อมูลนักเรียน
    sheet.appendRow([timestamp, studentName, studentClass, studentNumber, eventType, score, accuracy, details]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
