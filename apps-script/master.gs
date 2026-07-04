/**
 * Murmur — MASTER Apps Script (authentication + users + shared-channel directory)
 * ----------------------------------------------------------------
 * Deploy this bound to a NEW Google Sheet that acts as your master DB.
 *
 * It stores TWO tables, both privacy-preserving:
 *   users:    email, salt, verifier, enc(connection), keyring(enc), timestamps
 *   channels: channelId, name, ownerEmail, members(JSON), enc(connection), timestamps
 *
 * Everything sensitive (a user's private-sheet connection, their channel keys,
 * a shared channel's connection) is encrypted IN THE BROWSER before it arrives.
 * This sheet only ever holds ciphertext + access lists, so its owner cannot read
 * any user's data or reach any private/shared sheet.
 *
 * DEPLOY:
 *   1. New Google Sheet -> Extensions ▸ Apps Script. Paste this. Save.
 *   2. Deploy ▸ New deployment ▸ Web app. Execute as: Me. Access: Anyone.
 *   3. Copy the Web app URL into Murmur's NEXT_PUBLIC_MASTER_SCRIPT_URL.
 */

var USERS_SHEET = 'users';
var CHANNELS_SHEET = 'channels';

function doGet(e) {
  return json({ ok: true, service: 'murmur-master', version: '2.0' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    var req = JSON.parse(e.postData.contents);
    var res;
    switch (req.action) {
      case 'ping':             res = { ok: true, service: 'murmur-master', version: '2.0' }; break;
      case 'getSalt':          res = getSalt(req); break;
      case 'register':         res = register(req); break;
      case 'login':            res = login(req); break;
      case 'updateConnection': res = updateConnection(req); break;
      case 'setKeyring':       res = setKeyring(req); break;
      case 'shareChannel':     res = shareChannel(req); break;
      case 'joinChannel':      res = joinChannel(req); break;
      case 'listChannels':     res = listChannels(req); break;
      case 'addMember':        res = addMember(req); break;
      case 'removeMember':     res = removeMember(req); break;
      case 'unshareChannel':   res = unshareChannel(req); break;
      default:                 res = { ok: false, error: 'unknown_action' };
    }
    return json(res);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ----------------- users ----------------- */

function usersSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(USERS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(USERS_SHEET);
    sh.appendRow(['email', 'salt', 'verifier', 'enc', 'keyring', 'createdAt', 'updatedAt']);
  }
  return sh;
}

function findUserRow_(email) {
  var sh = usersSheet_();
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var emails = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === String(email).toLowerCase()) return i + 2;
  }
  return -1;
}

/** Returns the user row values if email+verifier match, else null. */
function auth_(email, verifier) {
  var row = findUserRow_(email);
  if (row === -1) return null;
  var vals = usersSheet_().getRange(row, 1, 1, 7).getValues()[0];
  if (String(vals[2]) !== String(verifier)) return null;
  return { row: row, vals: vals };
}

function getSalt(req) {
  var row = findUserRow_(String(req.email || '').trim());
  if (row === -1) return { ok: false, error: 'not_found' };
  return { ok: true, salt: usersSheet_().getRange(row, 2).getValue() };
}

function register(req) {
  var email = String(req.email || '').trim();
  if (!email) return { ok: false, error: 'email_required' };
  if (!req.salt || !req.verifier || !req.enc) return { ok: false, error: 'missing_fields' };
  if (findUserRow_(email) !== -1) return { ok: false, error: 'email_exists' };
  var now = new Date().toISOString();
  usersSheet_().appendRow([email, req.salt, req.verifier, req.enc, '', now, now]);
  return { ok: true };
}

function login(req) {
  var a = auth_(String(req.email || '').trim(), req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  return { ok: true, enc: a.vals[3], keyring: a.vals[4] || '' };
}

function updateConnection(req) {
  var a = auth_(String(req.email || '').trim(), req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  usersSheet_().getRange(a.row, 4).setValue(req.enc);
  usersSheet_().getRange(a.row, 7).setValue(new Date().toISOString());
  return { ok: true };
}

function setKeyring(req) {
  var a = auth_(String(req.email || '').trim(), req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  usersSheet_().getRange(a.row, 5).setValue(req.enc);
  usersSheet_().getRange(a.row, 7).setValue(new Date().toISOString());
  return { ok: true };
}

/* ----------------- channels ----------------- */

function channelsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CHANNELS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(CHANNELS_SHEET);
    sh.appendRow(['channelId', 'name', 'ownerEmail', 'members', 'enc', 'createdAt', 'updatedAt']);
  }
  return sh;
}

function findChannelRow_(channelId) {
  var sh = channelsSheet_();
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(channelId)) return i + 2;
  }
  return -1;
}

function channelObj_(vals, email) {
  var members = vals[3] ? JSON.parse(vals[3]) : [];
  return {
    channelId: String(vals[0]),
    name: String(vals[1]),
    ownerEmail: String(vals[2]),
    members: members,
    enc: vals[4],
    isOwner: String(vals[2]).toLowerCase() === String(email).toLowerCase(),
  };
}

/** Owner publishes a channel (or updates its name/enc). */
function shareChannel(req) {
  var email = String(req.email || '').trim();
  var a = auth_(email, req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  if (!req.channelId || !req.enc) return { ok: false, error: 'missing_fields' };

  var sh = channelsSheet_();
  var row = findChannelRow_(req.channelId);
  var now = new Date().toISOString();
  if (row === -1) {
    sh.appendRow([req.channelId, req.name || '', email, JSON.stringify([email]), req.enc, now, now]);
  } else {
    var vals = sh.getRange(row, 1, 1, 7).getValues()[0];
    if (String(vals[2]).toLowerCase() !== email.toLowerCase()) return { ok: false, error: 'not_owner' };
    sh.getRange(row, 2).setValue(req.name || vals[1]);
    sh.getRange(row, 5).setValue(req.enc);
    sh.getRange(row, 7).setValue(now);
  }
  return { ok: true };
}

/** Authenticated user joins a channel they hold an invite code for. */
function joinChannel(req) {
  var email = String(req.email || '').trim();
  var a = auth_(email, req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  var row = findChannelRow_(req.channelId);
  if (row === -1) return { ok: false, error: 'channel_not_found' };
  var sh = channelsSheet_();
  var vals = sh.getRange(row, 1, 1, 7).getValues()[0];
  var members = vals[3] ? JSON.parse(vals[3]) : [];
  var lc = email.toLowerCase();
  var has = members.some(function (m) { return String(m).toLowerCase() === lc; });
  if (!has) {
    members.push(email);
    sh.getRange(row, 4).setValue(JSON.stringify(members));
    sh.getRange(row, 7).setValue(new Date().toISOString());
  }
  return { ok: true, channel: channelObj_(vals, email) };
}

/** All channels the user is a member of (with encrypted connection + member list). */
function listChannels(req) {
  var email = String(req.email || '').trim();
  var a = auth_(email, req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  var sh = channelsSheet_();
  var last = sh.getLastRow();
  var out = [];
  if (last >= 2) {
    var rows = sh.getRange(2, 1, last - 1, 7).getValues();
    var lc = email.toLowerCase();
    for (var i = 0; i < rows.length; i++) {
      var members = rows[i][3] ? JSON.parse(rows[i][3]) : [];
      var member = members.some(function (m) { return String(m).toLowerCase() === lc; });
      if (member) out.push(channelObj_(rows[i], email));
    }
  }
  return { ok: true, channels: out };
}

function addMember(req) {
  return mutateMembers_(req, true);
}
function removeMember(req) {
  return mutateMembers_(req, false);
}

function mutateMembers_(req, add) {
  var email = String(req.email || '').trim();
  var a = auth_(email, req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  var row = findChannelRow_(req.channelId);
  if (row === -1) return { ok: false, error: 'channel_not_found' };
  var sh = channelsSheet_();
  var vals = sh.getRange(row, 1, 1, 7).getValues()[0];
  if (String(vals[2]).toLowerCase() !== email.toLowerCase()) return { ok: false, error: 'not_owner' };

  var members = vals[3] ? JSON.parse(vals[3]) : [];
  var target = String(req.member || '').trim().toLowerCase();
  if (!target) return { ok: false, error: 'member_required' };
  var idx = -1;
  for (var i = 0; i < members.length; i++) {
    if (String(members[i]).toLowerCase() === target) { idx = i; break; }
  }
  if (add && idx === -1) members.push(req.member.trim());
  if (!add && idx !== -1) {
    if (String(members[idx]).toLowerCase() === String(vals[2]).toLowerCase())
      return { ok: false, error: 'cannot_remove_owner' };
    members.splice(idx, 1);
  }
  sh.getRange(row, 4).setValue(JSON.stringify(members));
  sh.getRange(row, 7).setValue(new Date().toISOString());
  return { ok: true, members: members };
}

function unshareChannel(req) {
  var email = String(req.email || '').trim();
  var a = auth_(email, req.verifier);
  if (!a) return { ok: false, error: 'invalid_credentials' };
  var row = findChannelRow_(req.channelId);
  if (row === -1) return { ok: true };
  var sh = channelsSheet_();
  var vals = sh.getRange(row, 1, 1, 7).getValues()[0];
  if (String(vals[2]).toLowerCase() !== email.toLowerCase()) return { ok: false, error: 'not_owner' };
  sh.deleteRow(row);
  return { ok: true };
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
