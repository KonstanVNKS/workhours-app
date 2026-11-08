// =====================================================================================
// model.js — the web app's DATA and STORAGE layer, plus small formatting helpers.
// Same role as Model.kt in the Android app:
//
//   • Shift      : { id, start, end, breakMinutes, rate, note }  (start/end = epoch millis)
//   • Settings   : { rate, defaultBreak, currency, activeStart }
//   • Store      : reads/writes shifts + settings in the browser's localStorage
//   • Helpers    : date/time conversion and text formatting used by the screens
//   • PERIODS    : the Week / Month / Year filter used on the home screen
//
// There is NO server or database: everything is saved in this browser, on this device.
// Nothing in this file draws anything on screen; that's app.js.
// =====================================================================================
"use strict";

// ---------------------------------------------------------------------------------
// Shift calculations
// ---------------------------------------------------------------------------------

/** Paid minutes = (end − start) − break, never negative. */
function workedMinutes(s) {
  return Math.max(0, Math.floor((s.end - s.start) / 60000) - s.breakMinutes);
}

/** Money earned = paid hours × hourly rate.
 *  ► To add overtime, night or Sunday bonuses, this is the place to change the formula. */
function earnings(s) {
  return (workedMinutes(s) / 60) * s.rate;
}

/** Newest shift first. */
function sortShifts(list) {
  return [...list].sort((a, b) => b.start - a.start);
}

// ---------------------------------------------------------------------------------
// Storage (localStorage = a small key/value store inside the browser)
// ---------------------------------------------------------------------------------

const SHIFTS_KEY = "workhours.shifts";
const SETTINGS_KEY = "workhours.settings";

/** What a fresh install starts with. activeStart = clock-in time, or null. */
const DEFAULT_SETTINGS = { rate: 0, defaultBreak: 0, currency: "€", activeStart: null };

const Store = {
  /** False when the browser refuses storage (e.g. some Private Browsing modes). */
  available: (() => {
    try {
      localStorage.setItem("workhours.test", "1");
      localStorage.removeItem("workhours.test");
      return true;
    } catch {
      return false;
    }
  })(),

  /** Reads all shifts. Returns [] on first launch. */
  loadShifts() {
    let raw = null;
    try {
      raw = localStorage.getItem(SHIFTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((o) => ({
        id: Number(o.id),
        start: Number(o.start),
        end: Number(o.end),
        breakMinutes: Number(o.break) || 0,
        rate: Number(o.rate) || 0,
        note: String(o.note ?? ""),
      }));
    } catch {
      // Damaged data: keep a copy instead of overwriting it at the next save.
      try { if (raw) localStorage.setItem(SHIFTS_KEY + ".corrupt-" + Date.now(), raw); } catch { /* ignore */ }
      return [];
    }
  },

  /** Writes all shifts. Called after every add/edit/delete/import. */
  saveShifts(shifts) {
    const data = shifts.map((s) => ({
      id: s.id, start: s.start, end: s.end, break: s.breakMinutes, rate: s.rate, note: s.note,
    }));
    try { localStorage.setItem(SHIFTS_KEY, JSON.stringify(data)); } catch { /* storage full or blocked */ }
  },

  /** Reads settings, filling in defaults for anything missing. */
  loadSettings() {
    try {
      const o = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return {
        rate: Number(o.rate) || 0,
        defaultBreak: Number(o.defaultBreak) || 0,
        currency: typeof o.currency === "string" ? o.currency : DEFAULT_SETTINGS.currency,
        activeStart: Number(o.activeStart) > 0 ? Number(o.activeStart) : null,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  /** Writes settings. Called every time a setting changes or you clock in/out. */
  saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  },
};

// ---------------------------------------------------------------------------------
// Date helpers. A "day" is a Date at local midnight. Building dates from
// (year, month, day) instead of adding milliseconds keeps daylight-saving changes correct.
// ---------------------------------------------------------------------------------

const pad2 = (n) => String(n).padStart(2, "0");

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

/** Date → "2026-11-08" (the format of <input type="date"> and of the CSV file). */
function toISODate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

/** "2026-11-08" → Date at local midnight, or null. */
function parseISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

/** "09:30" → 570 (minutes after midnight), or null. */
function parseHHMM(s) {
  const m = /^(\d{1,2}):(\d{2})/.exec(s || "");
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return +m[1] * 60 + +m[2];
}

/** A day + minutes after midnight → epoch millis. */
function atMinutes(day, mins) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(mins / 60), mins % 60).getTime();
}

/** Epoch millis with the seconds dropped (used to tell whether a time was edited). */
function floorToMinute(ms) { const d = new Date(ms); d.setSeconds(0, 0); return d.getTime(); }

// ---------------------------------------------------------------------------------
// Formatting. Day and month names follow the phone's language (French phone → French).
// ---------------------------------------------------------------------------------

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDate = (d, opts) => d.toLocaleDateString(undefined, opts);

/** Epoch millis → "09:30". */
function fmtTime(ms) { const d = new Date(ms); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

/** Minutes → "7h30". */
function fmtMinutes(m) { return `${Math.floor(m / 60)}h${pad2(m % 60)}`; }

/** "Sat 8 Nov" (order and names follow the phone's language). */
function fmtDay(ms) { return capitalize(fmtDate(new Date(ms), { weekday: "short", day: "numeric", month: "short" })); }

/** Amount → "95,00 €" (decimal separator follows the phone's language). */
const moneyFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function money(x, currency) { return `${moneyFormat.format(x)} ${currency}`.trim(); }

/** Rate → text for an input field ("" when the rate is 0, so the field shows empty). */
function fmtRate(r) { return r === 0 ? "" : r.toFixed(2); }

/** Parses "14.95" or "14,95" → 14.95; returns null if it's not a number. */
function parseDecimal(s) {
  const t = String(s).trim().replace(/,/g, ".");
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
}

/** Makes user text safe to put inside HTML. */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// ---------------------------------------------------------------------------------
// The Week / Month / Year selector on the home screen.
//   start(d)    : first day of the period containing d (weeks start on Monday)
//   shift(s, n) : move n periods forward (1) or back (-1)
//   title(s)    : text shown between the arrows
// ---------------------------------------------------------------------------------

const PERIODS = {
  week: {
    start(d) { const x = startOfDay(d); return addDays(x, -((x.getDay() + 6) % 7)); }, // ► +6 → +0 for Sunday
    shift(s, n) { return addDays(s, 7 * n); },
    title(s) {
      const e = addDays(s, 6);
      return `${fmtDate(s, { day: "numeric", month: "short" })} – ${fmtDate(e, { day: "numeric", month: "short", year: "numeric" })}`;
    },
  },
  month: {
    start(d) { return new Date(d.getFullYear(), d.getMonth(), 1); },
    shift(s, n) { return new Date(s.getFullYear(), s.getMonth() + n, 1); },
    title(s) { return capitalize(fmtDate(s, { month: "long", year: "numeric" })); },
  },
  year: {
    start(d) { return new Date(d.getFullYear(), 0, 1); },
    shift(s, n) { return new Date(s.getFullYear() + n, 0, 1); },
    title(s) { return String(s.getFullYear()); },
  },
};
