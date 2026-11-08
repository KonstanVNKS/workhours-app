// =====================================================================================
// app.js — the screens and buttons. Same role as WorkViewModel.kt + the *Screen.kt files.
//
// Flow:  button tapped → action function below → data updated + saved via Store
//        → render…() redraws the part of the screen that changed.
// =====================================================================================
"use strict";

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------------
let shifts = sortShifts(Store.loadShifts()); // newest first
let settings = Store.loadSettings();
let period = "month";      // ► change to "week" to open on the week view
let anchor = new Date();   // a day inside the period being viewed
let confirmDiscard = false;
let editing = null;        // shift open in the dialog (null = adding a new one)
let confirmDelete = false;

// ---------------------------------------------------------------------------------
// Actions (same rules as WorkViewModel.kt)
// ---------------------------------------------------------------------------------
function setShifts(list) { shifts = sortShifts(list); Store.saveShifts(shifts); }
function nextId() { return shifts.reduce((m, s) => Math.max(m, s.id), 0) + 1; }
function updateSettings(patch) { settings = { ...settings, ...patch }; Store.saveSettings(settings); }

function clockIn() { confirmDiscard = false; updateSettings({ activeStart: Date.now() }); }
function discardClockIn() { updateSettings({ activeStart: null }); }

/** Turns the running clock-in into a saved shift ending now. */
function clockOut() {
  const start = settings.activeStart;
  if (start == null) return;
  const end = Date.now();
  const minutes = Math.floor((end - start) / 60000);
  // Only deduct the default break when the shift is longer than the break itself.
  const brk = minutes > settings.defaultBreak ? settings.defaultBreak : 0;
  setShifts([...shifts, { id: nextId(), start, end, breakMinutes: brk, rate: settings.rate, note: "" }]);
  updateSettings({ activeStart: null });
}

/** id 0 = new shift, otherwise replaces the existing one. */
function upsert(shift) {
  if (shift.id === 0) setShifts([...shifts, { ...shift, id: nextId() }]);
  else setShifts(shifts.map((s) => (s.id === shift.id ? shift : s)));
}

function deleteShift(id) { setShifts(shifts.filter((s) => s.id !== id)); }

/** Adds shifts from CSV text, skipping ones with exactly the same start and end. */
function importCsv(text) {
  const parsed = Csv.parse(text, settings.rate, settings.defaultBreak);
  const existing = new Set(shifts.map((s) => `${s.start}-${s.end}`));
  let id = nextId();
  const fresh = [];
  for (const s of parsed.shifts) {
    const key = `${s.start}-${s.end}`;
    if (existing.has(key)) continue;
    existing.add(key);
    fresh.push({ ...s, id: id++ });
  }
  if (fresh.length) setShifts([...shifts, ...fresh]);
  return { added: fresh.length, duplicates: parsed.shifts.length - fresh.length, badLines: parsed.badLines };
}

// ---------------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------------
function renderHome() {
  renderClock();
  $("rateReminder").hidden = settings.rate !== 0;

  for (const b of document.querySelectorAll(".segmented button")) {
    b.setAttribute("aria-pressed", String(b.dataset.period === period));
  }

  const p = PERIODS[period];
  const from = p.start(anchor);
  const to = p.shift(from, 1);
  $("periodTitle").textContent = p.title(from);

  // Only the shifts that started inside [from, to).
  const inPeriod = shifts.filter((s) => {
    const d = startOfDay(new Date(s.start)).getTime();
    return d >= from.getTime() && d < to.getTime();
  });

  const minutes = inPeriod.reduce((t, s) => t + workedMinutes(s), 0);
  const earned = inPeriod.reduce((t, s) => t + earnings(s), 0);
  $("sumHours").textContent = fmtMinutes(minutes);
  $("sumEarned").textContent = money(earned, settings.currency);
  $("sumCount").textContent = String(inPeriod.length);

  $("emptyMsg").hidden = inPeriod.length > 0;
  $("shiftList").innerHTML = inPeriod.map((s) => {
    const brk = s.breakMinutes > 0 ? ` · ${s.breakMinutes}m break` : "";
    const note = s.note ? `<span class="muted note">${escapeHtml(s.note)}</span>` : "";
    return `<li><button class="card shift" data-id="${s.id}">
      <div class="shift-main">
        <strong>${escapeHtml(fmtDay(s.start))}</strong>
        <span class="muted">${fmtTime(s.start)} – ${fmtTime(s.end)}${brk}</span>
        ${note}
      </div>
      <div class="shift-side">
        <strong>${fmtMinutes(workedMinutes(s))}</strong>
        <span class="money">${escapeHtml(money(earnings(s), settings.currency))}</span>
      </div>
    </button></li>`;
  }).join("");
}

/** The big card at the top: "Clock in", or the live timer with Discard / Clock out. */
function renderClock() {
  const active = settings.activeStart;
  $("clockCard").innerHTML = active == null
    ? `<p class="clock-label">Not clocked in</p>
       <button class="btn filled big" data-action="clockIn">Clock in</button>`
    : `<p class="clock-label active">Clocked in at ${fmtTime(active)}</p>
       <p class="timer" id="timer"></p>
       <p class="so-far" id="soFar"></p>
       <div class="row">
         <button class="btn outlined big" data-action="discard">${confirmDiscard ? "Tap to confirm" : "Discard"}</button>
         <button class="btn danger-filled big" data-action="clockOut">Clock out</button>
       </div>`;
  tick();
}

/** Updates the H:MM:SS timer (runs every second). */
function tick() {
  const active = settings.activeStart;
  const timer = $("timer");
  if (active == null || !timer) return;
  const secs = Math.max(0, Math.floor((Date.now() - active) / 1000));
  timer.textContent = `${Math.floor(secs / 3600)}:${pad2(Math.floor(secs / 60) % 60)}:${pad2(secs % 60)}`;
  // Gross estimate: elapsed time × rate (the default break isn't subtracted yet).
  $("soFar").textContent = settings.rate > 0 ? "≈ " + money((secs / 3600) * settings.rate, settings.currency) : "";
}
setInterval(tick, 1000);

$("clockCard").addEventListener("click", (e) => {
  const action = e.target.closest("button")?.dataset.action;
  if (action === "clockIn") clockIn();
  else if (action === "clockOut") clockOut();
  else if (action === "discard") {
    // Two taps, to avoid accidents.
    if (confirmDiscard) discardClockIn(); else confirmDiscard = true;
  } else return;
  renderHome();
});

document.querySelector(".segmented").addEventListener("click", (e) => {
  const p = e.target.closest("button")?.dataset.period;
  if (p) { period = p; renderHome(); }
});
$("prevPeriod").addEventListener("click", () => { anchor = PERIODS[period].shift(PERIODS[period].start(anchor), -1); renderHome(); });
$("nextPeriod").addEventListener("click", () => { anchor = PERIODS[period].shift(PERIODS[period].start(anchor), 1); renderHome(); });
$("periodTitle").addEventListener("click", () => { anchor = new Date(); renderHome(); });

$("shiftList").addEventListener("click", (e) => {
  const id = Number(e.target.closest("button")?.dataset.id);
  const s = shifts.find((x) => x.id === id);
  if (s) openDialog(s);
});
$("addShift").addEventListener("click", () => openDialog(null));
$("rateReminder").addEventListener("click", openSettings);

// ---------------------------------------------------------------------------------
// Add / Edit dialog (same rules as ShiftDialog.kt)
// ---------------------------------------------------------------------------------
const dlg = $("shiftDialog");

function openDialog(shift) {
  editing = shift;
  confirmDelete = false;
  const st = shift ? new Date(shift.start) : null;
  const en = shift ? new Date(shift.end) : null;
  const hhmm = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  $("dlgTitle").textContent = shift ? "Edit shift" : "Add shift";
  $("fDate").value = toISODate(st ?? new Date());
  $("fStart").value = st ? hhmm(st) : "09:00"; // ► your usual start/end for new shifts
  $("fEnd").value = en ? hhmm(en) : "17:00";
  $("fBreak").value = String(shift ? shift.breakMinutes : settings.defaultBreak);
  $("fRate").value = fmtRate(shift ? shift.rate : settings.rate);
  $("fNote").value = shift?.note ?? "";
  $("fRateLabel").textContent = `Rate (${settings.currency}/h)`;
  $("fDelete").hidden = !shift;
  $("fDelete").textContent = "Delete shift";
  updateDialog();
  dlg.showModal();
}

/** Reads the form. Returns { valid, overnight, shift }. */
function readForm() {
  const day = parseISODate($("fDate").value);
  const sm = parseHHMM($("fStart").value);
  const em = parseHHMM($("fEnd").value);
  const bt = $("fBreak").value.trim();
  const brk = bt === "" ? 0 : /^\d+$/.test(bt) ? parseInt(bt, 10) : null;
  const rt = $("fRate").value.trim();
  const rate = rt === "" ? 0 : parseDecimal(rt);
  const overnight = sm != null && em != null && em <= sm; // end ≤ start → ends the next day
  const rateOk = rate != null && rate >= 0;
  if (!day || sm == null || em == null || brk == null || !rateOk) return { valid: false, overnight, rateOk };

  const startMs = atMinutes(day, sm);
  const endMs = atMinutes(overnight ? addDays(day, 1) : day, em);
  // If a time wasn't changed, keep the original to the second (clocked-in shifts stay exact).
  const s = editing && floorToMinute(editing.start) === startMs ? editing.start : startMs;
  const e = editing && floorToMinute(editing.end) === endMs ? editing.end : endMs;
  return {
    valid: true, overnight, rateOk,
    shift: { id: editing?.id ?? 0, start: s, end: Math.max(e, s), breakMinutes: brk, rate, note: $("fNote").value.trim() },
  };
}

/** Refreshes the "(next day)" label, the red rate field, the preview and the Save button. */
function updateDialog() {
  const r = readForm();
  $("fEndLabel").textContent = "End" + (r.overnight ? " (next day)" : "");
  $("fRate").classList.toggle("invalid", !r.rateOk);
  $("fPreview").textContent = r.valid
    ? `Worked ${fmtMinutes(workedMinutes(r.shift))} · ${money(earnings(r.shift), settings.currency)}`
    : "";
  $("fSave").disabled = !r.valid;
}

$("shiftForm").addEventListener("input", (e) => {
  if (e.target.id === "fBreak") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  updateDialog();
});
$("shiftForm").addEventListener("change", updateDialog);
$("shiftForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const r = readForm();
  if (!r.valid) return;
  upsert(r.shift);
  dlg.close();
  renderHome();
});
$("fCancel").addEventListener("click", () => dlg.close());
// Tapping the dark area outside the dialog closes it.
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
$("fDelete").addEventListener("click", () => {
  if (!confirmDelete) { confirmDelete = true; $("fDelete").textContent = "Tap again to delete"; return; }
  deleteShift(editing.id);
  dlg.close();
  renderHome();
});

// ---------------------------------------------------------------------------------
// Settings screen (each change is saved immediately; there is no Save button)
// ---------------------------------------------------------------------------------
function fillSettings() {
  $("setRate").value = fmtRate(settings.rate);
  $("setRate").classList.remove("invalid");
  $("setCurrency").value = settings.currency;
  $("setBreak").value = String(settings.defaultBreak);
}

$("setRate").addEventListener("input", (e) => {
  const t = e.target.value;
  const r = parseDecimal(t);
  if (t.trim() === "") updateSettings({ rate: 0 });
  else if (r != null && r >= 0) updateSettings({ rate: r });
  e.target.classList.toggle("invalid", t.trim() !== "" && r == null);
});
$("setCurrency").addEventListener("input", (e) => updateSettings({ currency: e.target.value.trim() }));
$("setBreak").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  updateSettings({ defaultBreak: parseInt(e.target.value, 10) || 0 });
});

$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  e.target.value = ""; // so picking the same file again still triggers
  if (!file) return;
  try {
    const r = importCsv(await file.text());
    const extra = [];
    if (r.duplicates > 0) extra.push(`${r.duplicates} already present`);
    if (r.badLines > 0) extra.push(`${r.badLines} unreadable lines`);
    toast(`Imported ${r.added} shifts` + (extra.length ? ` (${extra.join(", ")})` : ""));
  } catch (err) {
    toast("Import failed: " + err.message);
  }
});

$("exportBtn").addEventListener("click", async () => {
  const name = `work-hours-${toISODate(new Date())}.csv`;
  const file = new File([Csv.export(shifts)], name, { type: "text/csv" });
  // iPhone: the Share sheet lets you "Save to Files", AirDrop or mail it.
  if (isIOS() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      toast(`Exported ${shifts.length} shifts`);
    } catch (err) {
      if (err.name !== "AbortError") toast("Export failed: " + err.message);
    }
    return;
  }
  // Everywhere else: a normal download.
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast(`Exported ${shifts.length} shifts`);
});

// ---------------------------------------------------------------------------------
// Switching screens. Settings gets its own history entry, so the iPhone back swipe
// and Android's back button return to Home instead of leaving the app.
// ---------------------------------------------------------------------------------
function showView() {
  const onSettings = location.hash === "#settings";
  $("home").hidden = onSettings;
  $("settings").hidden = !onSettings;
  if (onSettings) fillSettings(); else renderHome();
  window.scrollTo(0, 0);
}
function openSettings() { history.pushState({ settings: true }, "", "#settings"); showView(); }
function closeSettings() {
  if (history.state?.settings) history.back(); // popstate → showView()
  else { history.replaceState(null, "", location.pathname + location.search); showView(); }
}
$("openSettings").addEventListener("click", openSettings);
$("closeSettings").addEventListener("click", closeSettings);
window.addEventListener("popstate", showView);

// ---------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isInstalled() {
  return navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
}

// ---------------------------------------------------------------------------------
// Start-up
// ---------------------------------------------------------------------------------
$("storageWarning").hidden = Store.available;

// iPhone install tip, until dismissed or installed.
let tipDismissed = false;
try { tipDismissed = localStorage.getItem("workhours.tipDismissed") === "1"; } catch { /* ignore */ }
$("installTip").hidden = !(isIOS() && !isInstalled() && !tipDismissed);
$("dismissTip").addEventListener("click", () => {
  $("installTip").hidden = true;
  try { localStorage.setItem("workhours.tipDismissed", "1"); } catch { /* ignore */ }
});

// If the app is open in two tabs, keep them in sync.
window.addEventListener("storage", (e) => {
  if (!e.key?.startsWith("workhours.")) return;
  shifts = sortShifts(Store.loadShifts());
  settings = Store.loadSettings();
  if (!$("home").hidden) renderHome();
});

// Coming back to the app (e.g. after locking the phone): redraw so the date/timer are current.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !$("home").hidden) renderHome();
});

// Ask the browser not to clear our data when the device is low on space.
navigator.storage?.persist?.().catch(() => {});

// Offline support (only works when served over https or from localhost).
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

showView();
