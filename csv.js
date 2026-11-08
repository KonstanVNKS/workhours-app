// =====================================================================================
// csv.js — converts shifts to/from CSV text (the format Excel / Google Sheets open).
// Same format as Csv.kt in the Android app, so files move freely between the two.
//
//     date,start,end,break_minutes,hourly_rate,note,hours,earnings
//     2026-11-08,09:00,17:30,30,14.95,Saturday shift,8.00,119.60
//
//   • Only date, start and end are required. A missing break or rate uses your Settings.
//   • hours and earnings are written on export for convenience but ignored on import.
//   • Accepted dates: 2026-11-08, 08/11/2026, 08-11-2026, 08.11.2026
//   • Accepted times: 09:00, 09:00:00, 9h00, 9.00
//   • If end is earlier than start (e.g. 22:00 → 02:00) the shift ends the next day.
// =====================================================================================
"use strict";

const BOM = String.fromCharCode(0xfeff); // invisible marker so Excel reads € and accents correctly

const Csv = {
  /** Builds the CSV text for all shifts, oldest first. */
  export(shifts) {
    let out = BOM;
    out += "date,start,end,break_minutes,hourly_rate,note,hours,earnings\n";
    for (const s of [...shifts].sort((a, b) => a.start - b.start)) {
      out += [
        toISODate(new Date(s.start)),
        fmtTime(s.start),
        fmtTime(s.end),
        s.breakMinutes,
        s.rate.toFixed(2),
        quote(s.note),
        (workedMinutes(s) / 60).toFixed(2),
        earnings(s).toFixed(2),
      ].join(",") + "\n";
    }
    return out;
  },

  /**
   * Reads CSV text into shifts (with id 0; app.js assigns real ids).
   * Returns { shifts, badLines }.
   */
  parse(text, defaultRate, defaultBreak) {
    const lines = (text.startsWith(BOM) ? text.slice(1) : text).split(/\r\n|\n|\r/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return { shifts: [], badLines: 0 };

    // Guess the separator: Belgian/French Excel uses ';', most others use ','.
    const count = (ch) => lines[0].split(ch).length - 1;
    const delim = count(";") > count(",") ? ";" : ",";

    const shifts = [];
    let bad = 0;
    lines.forEach((line, idx) => {
      const f = split(line, delim);
      const date = f[0] != null ? parseDate(f[0]) : null;
      const start = f[1] != null ? parseTime(f[1]) : null; // seconds after midnight
      const end = f[2] != null ? parseTime(f[2]) : null;
      if (!date || start == null || end == null) {
        if (idx > 0) bad++; // an unreadable FIRST line is just the header
        return;
      }
      const endDay = end > start ? date : addDays(date, 1); // overnight
      const brk = f[3]?.trim();
      shifts.push({
        id: 0,
        start: atSeconds(date, start),
        end: atSeconds(endDay, end),
        breakMinutes: /^[+-]?\d+$/.test(brk ?? "") ? parseInt(brk, 10) : defaultBreak,
        rate: (f[4] != null ? parseDecimal(f[4]) : null) ?? defaultRate,
        note: f[5]?.trim() ?? "",
      });
    });
    return { shifts, badLines: bad };
  },
};

/** "2026-11-08", "08/11/2026", "08-11-2026" or "08.11.2026" → Date, or null. */
function parseDate(s) {
  const t = s.trim();
  let y, m, d, r;
  if ((r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t))) [y, m, d] = [+r[1], +r[2], +r[3]];
  else if ((r = /^(\d{1,2})([/.-])(\d{1,2})\2(\d{4})$/.exec(t))) [d, m, y] = [+r[1], +r[3], +r[4]];
  else return null;
  const date = new Date(y, m - 1, d);
  // Reject impossible dates like 31/02 (JavaScript would silently roll them over).
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

/** "09:00", "09:00:00", "9h00" or "9.00" → seconds after midnight, or null. */
function parseTime(s) {
  const t = s.trim();
  const r = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t) || /^(\d{1,2})[h.](\d{2})()$/.exec(t);
  if (!r) return null;
  const [h, m, sec] = [+r[1], +r[2], +(r[3] || 0)];
  return h < 24 && m < 60 && sec < 60 ? h * 3600 + m * 60 + sec : null;
}

function atSeconds(day, secs) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(),
    Math.floor(secs / 3600), Math.floor(secs / 60) % 60, secs % 60).getTime();
}

/** Wraps text in quotes if it contains a separator/quote/newline, as the CSV standard requires. */
function quote(s) {
  return /[,;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Splits one CSV line into fields, respecting "quoted, text". */
function split(line, delim) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes && c === '"' && line[i + 1] === '"') { cur += '"'; i++; } // "" = literal quote
    else if (c === '"') inQuotes = !inQuotes;
    else if (c === delim && !inQuotes) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
