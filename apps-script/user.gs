/**
 * Murmur — USER (PRIVATE) Apps Script
 * ----------------------------------------------------------------
 * Each user deploys THIS bound to their OWN private Google Sheet. This sheet is
 * the user's database. Murmur (the Vercel app) talks only to this endpoint, so
 * the data never leaves the user's Google account.
 *
 * SECURITY: set a TOKEN below (any long random string). Murmur sends it with
 * every request; requests without the matching token are rejected. Keep the
 * Web app URL + token secret — together they grant access to this data.
 *
 * DEPLOY:
 *   1. Create a NEW Google Sheet -> Extensions -> Apps Script.
 *   2. Paste this file. Set TOKEN to a long random string. Save.
 *   3. Deploy -> New deployment -> Web app.
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Copy the Web app URL. In Murmur, paste the URL + your TOKEN.
 */

var TOKEN = 'CHANGE_ME_to_a_long_random_secret';
var DATA_SHEET = 'messages';
var COLS = ['id', 'channel', 'date', 'ts', 'type', 'pinned', 'deleted', 'editedTs', 'tags', 'author', 'authorEmail', 'text'];

function doGet(e) {
  return json({ ok: true, service: 'murmur-user', version: '1.0' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.action === 'ping') return json({ ok: true, service: 'murmur-user', version: '1.0' });
    if (String(req.token) !== String(TOKEN)) return json({ ok: false, error: 'unauthorized' });

    var res;
    switch (req.action) {
      case 'upsert':    res = upsert(req.message); break;
      case 'upsertBatch': res = upsertBatch(req.messages); break;
      case 'delete':    res = remove(req.id); break;
      case 'getDates':  res = getDates(); break;
      case 'getByDate': res = getByDate(req.date); break;
      case 'getByChannel': res = getByChannel(req.channel); break;
      case 'getAll':    res = getAll(); break;
      default:          res = { ok: false, error: 'unknown_action' };
    }
    return json(res);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(DATA_SHEET);
  if (!sh) {
    sh = ss.insertSheet(DATA_SHEET);
    sh.appendRow(COLS);
  }
  // Keep the `date` column (col 3) as PLAIN TEXT so Sheets never coerces a
  // "2026-07-04" string into a typed date (which would round-trip back as an
  // "Invalid Date"). Idempotent and cheap; guards existing sheets too.
  sh.getRange(1, 3, sh.getMaxRows(), 1).setNumberFormat('@');
  return sh;
}

function tz_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone()
    || Session.getScriptTimeZone()
    || 'Etc/GMT';
}

/** Normalize a date cell (string OR a Sheets-coerced Date) to a YYYY-MM-DD key. */
function toDateKey_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), 'yyyy-MM-dd');
  var s = String(v == null ? '' : v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, tz_(), 'yyyy-MM-dd');
  return s;
}

function rowFromMessage_(m) {
  return [
    m.id,
    m.channel || 'general',
    m.date,
    m.ts,
    m.type || 'message',
    m.pinned ? true : false,
    m.deleted ? true : false,
    m.editedTs || '',
    m.tags ? JSON.stringify(m.tags) : '',
    m.author || '',
    m.authorEmail || '',
    m.text || '',
  ];
}

function messageFromRow_(r) {
  return {
    id: String(r[0]),
    channel: String(r[1] || 'general'),
    date: toDateKey_(r[2]),
    ts: Number(r[3]) || 0,
    type: String(r[4] || 'message'),
    pinned: r[5] === true || r[5] === 'TRUE' || r[5] === 'true',
    deleted: r[6] === true || r[6] === 'TRUE' || r[6] === 'true',
    editedTs: r[7] ? Number(r[7]) : undefined,
    tags: r[8] ? JSON.parse(r[8]) : undefined,
    author: r[9] ? String(r[9]) : undefined,
    authorEmail: r[10] ? String(r[10]) : undefined,
    text: String(r[11] || ''),
  };
}

function findRowById_(id) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function upsert(m) {
  var sh = sheet_();
  var row = findRowById_(m.id);
  var data = rowFromMessage_(m);
  if (row === -1) {
    sh.appendRow(data);
  } else {
    sh.getRange(row, 1, 1, COLS.length).setValues([data]);
  }
  return { ok: true, id: m.id };
}

function upsertBatch(messages) {
  for (var i = 0; i < messages.length; i++) upsert(messages[i]);
  return { ok: true, count: messages.length };
}

function remove(id) {
  var row = findRowById_(id);
  if (row !== -1) sheet_().deleteRow(row);
  return { ok: true, id: id };
}

function allRows_() {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, COLS.length).getValues();
}

function getDates() {
  var rows = allRows_();
  var set = {};
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][6] === true || rows[i][6] === 'TRUE') continue; // skip deleted
    set[toDateKey_(rows[i][2])] = true;
  }
  var dates = Object.keys(set).sort().reverse(); // newest first
  return { ok: true, dates: dates };
}

function getByDate(date) {
  var rows = allRows_();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    if (toDateKey_(rows[i][2]) === String(date)) out.push(messageFromRow_(rows[i]));
  }
  return { ok: true, messages: out };
}

function getByChannel(channel) {
  var rows = allRows_();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]) === String(channel)) {
      var m = messageFromRow_(rows[i]);
      if (!m.deleted) out.push(m);
    }
  }
  return { ok: true, messages: out };
}

function getAll() {
  var rows = allRows_();
  var out = [];
  for (var i = 0; i < rows.length; i++) out.push(messageFromRow_(rows[i]));
  return { ok: true, messages: out };
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
