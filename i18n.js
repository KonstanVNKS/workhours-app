// =====================================================================================
// i18n.js — translations. Every text shown in the app lives here, once per language.
//
//   t("key")          → the text in the current language (falls back to English)
//   t("key", a, b)    → for texts with numbers/values in them (written as functions below)
//   In index.html:  data-i18n="key"        → sets the element's text
//                   data-i18n-html="key"   → same, but allows <b>bold</b>
//                   data-i18n-aria="key"   → sets aria-label (read aloud by screen readers)
//                   data-i18n-title="key" / data-i18n-placeholder="key"
//
// ► To add a language: add it to LANGUAGES, copy the `en` block in STRINGS and translate it.
// ► To change a text: edit it here (in every language).
// =====================================================================================
"use strict";

/** code = our id; name = shown in the menu; locale = used for dates and numbers. */
const LANGUAGES = [
  { code: "en", name: "English", locale: "en-GB" },
  { code: "fr", name: "Français", locale: "fr-FR" },
  { code: "nl", name: "Nederlands", locale: "nl-NL" },
  { code: "es", name: "Español", locale: "es-ES" },
  { code: "pt", name: "Português", locale: "pt-PT" },
  { code: "zh", name: "中文", locale: "zh-CN" },
  { code: "ja", name: "日本語", locale: "ja-JP" },
];

const STRINGS = {
  en: {
    settings: "Settings", back: "Back", prev: "Previous", next: "Next", addShift: "Add shift", dismiss: "Dismiss", period: "Period",
    installTip: "Install it: tap <b>Share</b> then <b>Add to Home Screen</b>. It then opens like a normal app and works offline.",
    storageWarning: "This browser is blocking storage (Private Browsing?), so your shifts won't be saved.",
    notClockedIn: "Not clocked in", clockedInAt: (t) => `Clocked in at ${t}`,
    clockIn: "Clock in", clockOut: "Clock out", discard: "Discard", confirmDiscard: "Tap to confirm",
    rateReminder: "Set your hourly rate in Settings to see your earnings.",
    week: "Week", month: "Month", year: "Year", backToToday: "Back to today",
    hours: "Hours", earned: "Earned", shifts: "Shifts", noShifts: "No shifts in this period.",
    breakInfo: (m) => `${m}m break`,
    language: "Language", pay: "Pay", hourlyRate: "Hourly rate", ratePlaceholder: "e.g. 14.95", currency: "Currency",
    rateHint: "New shifts use this rate. Existing shifts keep the rate they were saved with; tap a shift to change it.",
    defaultBreak: "Default unpaid break (minutes)",
    data: "Data",
    dataPrivacy: "Your shifts are saved <b>only on this device, in this browser</b>. Nobody else can see them. On iPhone, add the app to your Home Screen so Safari doesn't clear the data, and export a CSV now and then as a backup.",
    importHelp: "Import a CSV with columns: date, start, end, break minutes, rate, note. Only date, start and end are required; ',' or ';' separators both work. Shifts that already exist are skipped. Files exported from the Android app work here too.",
    importCsv: "Import CSV", exportCsv: "Export CSV", guide: "User guide (in French)",
    shyfter: "Shyfter's API only accepts keys created by an account admin, so automatic sync isn't available with a regular employee login. Use Clock in / Clock out here alongside Shyfter, or import a CSV export of your clockings.",
    editShift: "Edit shift", date: "Date", start: "Start", end: "End", endNextDay: "End (next day)",
    breakMin: "Break (min)", rate: (c) => `Rate (${c}/h)`, note: "Note (optional)",
    worked: (h, m) => `Worked ${h} · ${m}`,
    deleteShift: "Delete shift", confirmDelete: "Tap again to delete", cancel: "Cancel", save: "Save",
    imported: (n) => `Imported ${n} shift${n === 1 ? "" : "s"}`,
    alreadyPresent: (n) => `${n} already present`,
    unreadable: (n) => `${n} unreadable line${n === 1 ? "" : "s"}`,
    exported: (n) => `Exported ${n} shift${n === 1 ? "" : "s"}`,
    importFailed: "Import failed: ", exportFailed: "Export failed: ",
  },

  fr: {
    settings: "Réglages", back: "Retour", prev: "Précédent", next: "Suivant", addShift: "Ajouter un service", dismiss: "Fermer", period: "Période",
    installTip: "Pour l'installer : touchez <b>Partager</b> puis <b>Sur l'écran d'accueil</b>. Elle s'ouvrira comme une vraie app, même sans internet.",
    storageWarning: "Ce navigateur bloque l'enregistrement (navigation privée ?) : vos services ne seront pas sauvegardés.",
    notClockedIn: "Pas en service", clockedInAt: (t) => `En service depuis ${t}`,
    clockIn: "Pointer l'arrivée", clockOut: "Pointer le départ", discard: "Annuler", confirmDiscard: "Confirmer",
    rateReminder: "Indiquez votre taux horaire dans les Réglages pour voir vos gains.",
    week: "Semaine", month: "Mois", year: "Année", backToToday: "Revenir à aujourd'hui",
    hours: "Heures", earned: "Gagné", shifts: "Services", noShifts: "Aucun service sur cette période.",
    breakInfo: (m) => `pause ${m} min`,
    language: "Langue", pay: "Salaire", hourlyRate: "Taux horaire", ratePlaceholder: "ex. 14,95", currency: "Devise",
    rateHint: "Les nouveaux services utilisent ce taux. Les services existants gardent le leur ; touchez un service pour le modifier.",
    defaultBreak: "Pause non payée par défaut (minutes)",
    data: "Données",
    dataPrivacy: "Vos services sont enregistrés <b>uniquement sur cet appareil, dans ce navigateur</b>. Personne d'autre ne peut les voir. Sur iPhone, ajoutez l'app à l'écran d'accueil pour que Safari n'efface pas les données, et exportez un CSV de temps en temps comme sauvegarde.",
    importHelp: "Importez un CSV avec les colonnes : date, début, fin, minutes de pause, taux, note. Seuls la date, le début et la fin sont obligatoires ; les séparateurs ',' et ';' fonctionnent. Les services déjà présents sont ignorés. Les fichiers exportés depuis l'app Android fonctionnent aussi.",
    importCsv: "Importer CSV", exportCsv: "Exporter CSV", guide: "Mode d'emploi",
    shyfter: "L'API de Shyfter n'accepte que des clés créées par un administrateur du compte : la synchronisation automatique n'est donc pas possible avec un compte employé. Pointez ici en parallèle de Shyfter, ou importez un export CSV de vos pointages.",
    editShift: "Modifier le service", date: "Date", start: "Début", end: "Fin", endNextDay: "Fin (lendemain)",
    breakMin: "Pause (min)", rate: (c) => `Taux (${c}/h)`, note: "Note (facultatif)",
    worked: (h, m) => `Travaillé ${h} · ${m}`,
    deleteShift: "Supprimer le service", confirmDelete: "Toucher à nouveau pour supprimer", cancel: "Annuler", save: "Enregistrer",
    imported: (n) => `${n} service${n > 1 ? "s" : ""} importé${n > 1 ? "s" : ""}`,
    alreadyPresent: (n) => `${n} déjà présent${n > 1 ? "s" : ""}`,
    unreadable: (n) => `${n} ligne${n > 1 ? "s" : ""} illisible${n > 1 ? "s" : ""}`,
    exported: (n) => `${n} service${n > 1 ? "s" : ""} exporté${n > 1 ? "s" : ""}`,
    importFailed: "Échec de l'import : ", exportFailed: "Échec de l'export : ",
  },

  nl: {
    settings: "Instellingen", back: "Terug", prev: "Vorige", next: "Volgende", addShift: "Dienst toevoegen", dismiss: "Sluiten", period: "Periode",
    installTip: "Installeren: tik op <b>Deel</b> en dan op <b>Zet op beginscherm</b>. Daarna opent het als een gewone app en werkt het offline.",
    storageWarning: "Deze browser blokkeert opslag (privénavigatie?), dus je diensten worden niet bewaard.",
    notClockedIn: "Niet ingeklokt", clockedInAt: (t) => `Ingeklokt om ${t}`,
    clockIn: "Inklokken", clockOut: "Uitklokken", discard: "Annuleren", confirmDiscard: "Tik om te bevestigen",
    rateReminder: "Stel je uurloon in bij Instellingen om je verdiensten te zien.",
    week: "Week", month: "Maand", year: "Jaar", backToToday: "Terug naar vandaag",
    hours: "Uren", earned: "Verdiend", shifts: "Diensten", noShifts: "Geen diensten in deze periode.",
    breakInfo: (m) => `${m} min pauze`,
    language: "Taal", pay: "Loon", hourlyRate: "Uurloon", ratePlaceholder: "bv. 14,95", currency: "Valuta",
    rateHint: "Nieuwe diensten gebruiken dit uurloon. Bestaande diensten houden hun eigen uurloon; tik op een dienst om het te wijzigen.",
    defaultBreak: "Standaard onbetaalde pauze (minuten)",
    data: "Gegevens",
    dataPrivacy: "Je diensten worden <b>alleen op dit apparaat, in deze browser</b> bewaard. Niemand anders kan ze zien. Zet de app op je iPhone op het beginscherm zodat Safari de gegevens niet wist, en exporteer af en toe een CSV als back-up.",
    importHelp: "Importeer een CSV met de kolommen: datum, begin, einde, pauzeminuten, uurloon, notitie. Alleen datum, begin en einde zijn verplicht; ',' en ';' als scheidingsteken werken allebei. Diensten die al bestaan worden overgeslagen. Bestanden uit de Android-app werken hier ook.",
    importCsv: "CSV importeren", exportCsv: "CSV exporteren", guide: "Handleiding (in het Frans)",
    shyfter: "De API van Shyfter accepteert alleen sleutels die een accountbeheerder aanmaakt, dus automatisch synchroniseren kan niet met een gewoon werknemersaccount. Klok hier in en uit naast Shyfter, of importeer een CSV-export van je prikklokregistraties.",
    editShift: "Dienst bewerken", date: "Datum", start: "Begin", end: "Einde", endNextDay: "Einde (volgende dag)",
    breakMin: "Pauze (min)", rate: (c) => `Uurloon (${c}/u)`, note: "Notitie (optioneel)",
    worked: (h, m) => `Gewerkt ${h} · ${m}`,
    deleteShift: "Dienst verwijderen", confirmDelete: "Tik nogmaals om te verwijderen", cancel: "Annuleren", save: "Opslaan",
    imported: (n) => `${n} ${n === 1 ? "dienst" : "diensten"} geïmporteerd`,
    alreadyPresent: (n) => `${n} al aanwezig`,
    unreadable: (n) => `${n} onleesbare ${n === 1 ? "regel" : "regels"}`,
    exported: (n) => `${n} ${n === 1 ? "dienst" : "diensten"} geëxporteerd`,
    importFailed: "Importeren mislukt: ", exportFailed: "Exporteren mislukt: ",
  },

  es: {
    settings: "Ajustes", back: "Atrás", prev: "Anterior", next: "Siguiente", addShift: "Añadir turno", dismiss: "Cerrar", period: "Periodo",
    installTip: "Para instalarla: toca <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>. Se abrirá como una app normal y funcionará sin conexión.",
    storageWarning: "Este navegador bloquea el almacenamiento (¿navegación privada?), así que tus turnos no se guardarán.",
    notClockedIn: "Sin fichar", clockedInAt: (t) => `Entrada fichada a las ${t}`,
    clockIn: "Fichar entrada", clockOut: "Fichar salida", discard: "Descartar", confirmDiscard: "Toca para confirmar",
    rateReminder: "Indica tu tarifa por hora en Ajustes para ver lo que ganas.",
    week: "Semana", month: "Mes", year: "Año", backToToday: "Volver a hoy",
    hours: "Horas", earned: "Ganado", shifts: "Turnos", noShifts: "No hay turnos en este periodo.",
    breakInfo: (m) => `${m} min de pausa`,
    language: "Idioma", pay: "Sueldo", hourlyRate: "Tarifa por hora", ratePlaceholder: "p. ej. 14,95", currency: "Moneda",
    rateHint: "Los turnos nuevos usan esta tarifa. Los turnos existentes conservan la suya; toca un turno para cambiarla.",
    defaultBreak: "Pausa no pagada por defecto (minutos)",
    data: "Datos",
    dataPrivacy: "Tus turnos se guardan <b>solo en este dispositivo, en este navegador</b>. Nadie más puede verlos. En iPhone, añade la app a la pantalla de inicio para que Safari no borre los datos, y exporta un CSV de vez en cuando como copia de seguridad.",
    importHelp: "Importa un CSV con las columnas: fecha, inicio, fin, minutos de pausa, tarifa, nota. Solo la fecha, el inicio y el fin son obligatorios; sirven los separadores ',' y ';'. Los turnos que ya existen se omiten. Los archivos exportados desde la app de Android también funcionan.",
    importCsv: "Importar CSV", exportCsv: "Exportar CSV", guide: "Guía de uso (en francés)",
    shyfter: "La API de Shyfter solo acepta claves creadas por un administrador de la cuenta, así que la sincronización automática no es posible con una cuenta de empleado. Ficha aquí además de en Shyfter, o importa una exportación CSV de tus fichajes.",
    editShift: "Editar turno", date: "Fecha", start: "Inicio", end: "Fin", endNextDay: "Fin (día siguiente)",
    breakMin: "Pausa (min)", rate: (c) => `Tarifa (${c}/h)`, note: "Nota (opcional)",
    worked: (h, m) => `Trabajado ${h} · ${m}`,
    deleteShift: "Eliminar turno", confirmDelete: "Toca otra vez para eliminar", cancel: "Cancelar", save: "Guardar",
    imported: (n) => `${n} ${n === 1 ? "turno importado" : "turnos importados"}`,
    alreadyPresent: (n) => `${n} ya ${n === 1 ? "existía" : "existían"}`,
    unreadable: (n) => `${n} ${n === 1 ? "línea ilegible" : "líneas ilegibles"}`,
    exported: (n) => `${n} ${n === 1 ? "turno exportado" : "turnos exportados"}`,
    importFailed: "Error al importar: ", exportFailed: "Error al exportar: ",
  },

  pt: {
    settings: "Definições", back: "Voltar", prev: "Anterior", next: "Seguinte", addShift: "Adicionar turno", dismiss: "Fechar", period: "Período",
    installTip: "Para instalar: toque em <b>Partilhar</b> e depois em <b>Adicionar ao ecrã principal</b>. Abre como uma app normal e funciona sem internet.",
    storageWarning: "Este navegador está a bloquear o armazenamento (navegação privada?), por isso os seus turnos não serão guardados.",
    notClockedIn: "Sem entrada registada", clockedInAt: (t) => `Entrada registada às ${t}`,
    clockIn: "Registar entrada", clockOut: "Registar saída", discard: "Descartar", confirmDiscard: "Toque para confirmar",
    rateReminder: "Defina o seu valor por hora nas Definições para ver quanto ganhou.",
    week: "Semana", month: "Mês", year: "Ano", backToToday: "Voltar a hoje",
    hours: "Horas", earned: "Ganho", shifts: "Turnos", noShifts: "Sem turnos neste período.",
    breakInfo: (m) => `pausa de ${m} min`,
    language: "Idioma", pay: "Salário", hourlyRate: "Valor por hora", ratePlaceholder: "ex. 14,95", currency: "Moeda",
    rateHint: "Os novos turnos usam este valor. Os turnos existentes mantêm o seu; toque num turno para o alterar.",
    defaultBreak: "Pausa não paga predefinida (minutos)",
    data: "Dados",
    dataPrivacy: "Os seus turnos ficam guardados <b>apenas neste dispositivo, neste navegador</b>. Mais ninguém os pode ver. No iPhone, adicione a app ao ecrã principal para que o Safari não apague os dados, e exporte um CSV de vez em quando como cópia de segurança.",
    importHelp: "Importe um CSV com as colunas: data, início, fim, minutos de pausa, valor, nota. Só a data, o início e o fim são obrigatórios; os separadores ',' e ';' funcionam. Os turnos que já existem são ignorados. Os ficheiros exportados da app Android também funcionam.",
    importCsv: "Importar CSV", exportCsv: "Exportar CSV", guide: "Guia de utilização (em francês)",
    shyfter: "A API do Shyfter só aceita chaves criadas por um administrador da conta, por isso a sincronização automática não é possível com uma conta de funcionário. Registe aqui as entradas e saídas em paralelo com o Shyfter, ou importe uma exportação CSV dos seus registos.",
    editShift: "Editar turno", date: "Data", start: "Início", end: "Fim", endNextDay: "Fim (dia seguinte)",
    breakMin: "Pausa (min)", rate: (c) => `Valor (${c}/h)`, note: "Nota (opcional)",
    worked: (h, m) => `Trabalhado ${h} · ${m}`,
    deleteShift: "Eliminar turno", confirmDelete: "Toque novamente para eliminar", cancel: "Cancelar", save: "Guardar",
    imported: (n) => `${n} ${n === 1 ? "turno importado" : "turnos importados"}`,
    alreadyPresent: (n) => `${n} já ${n === 1 ? "existia" : "existiam"}`,
    unreadable: (n) => `${n} ${n === 1 ? "linha ilegível" : "linhas ilegíveis"}`,
    exported: (n) => `${n} ${n === 1 ? "turno exportado" : "turnos exportados"}`,
    importFailed: "Falha ao importar: ", exportFailed: "Falha ao exportar: ",
  },

  zh: {
    settings: "设置", back: "返回", prev: "上一个", next: "下一个", addShift: "添加班次", dismiss: "关闭", period: "时间段",
    installTip: "安装方法：点按<b>分享</b>，然后选择<b>添加到主屏幕</b>。之后它会像普通 App 一样打开，并可离线使用。",
    storageWarning: "此浏览器阻止了存储（是否处于无痕浏览？），你的班次将不会被保存。",
    notClockedIn: "未打卡", clockedInAt: (t) => `已于 ${t} 上班打卡`,
    clockIn: "上班打卡", clockOut: "下班打卡", discard: "放弃", confirmDiscard: "点按确认",
    rateReminder: "请在设置中填写时薪，以查看收入。",
    week: "周", month: "月", year: "年", backToToday: "回到今天",
    hours: "工时", earned: "收入", shifts: "班次", noShifts: "此时间段内没有班次。",
    breakInfo: (m) => `休息 ${m} 分钟`,
    language: "语言", pay: "工资", hourlyRate: "时薪", ratePlaceholder: "例如 14.95", currency: "货币",
    rateHint: "新班次使用此时薪。已有班次保留保存时的时薪；点按班次即可修改。",
    defaultBreak: "默认无薪休息（分钟）",
    data: "数据",
    dataPrivacy: "你的班次<b>只保存在这台设备的这个浏览器中</b>，其他人无法看到。在 iPhone 上，请把 App 添加到主屏幕，以免 Safari 清除数据，并不时导出 CSV 作为备份。",
    importHelp: "导入包含以下列的 CSV：日期、开始、结束、休息分钟数、时薪、备注。只有日期、开始和结束是必填项；分隔符可以是 ',' 或 ';'。已存在的班次会被跳过。从 Android App 导出的文件也可以使用。",
    importCsv: "导入 CSV", exportCsv: "导出 CSV", guide: "使用说明（法语）",
    shyfter: "Shyfter 的 API 只接受账户管理员创建的密钥，因此普通员工账号无法自动同步。你可以在使用 Shyfter 的同时在这里打卡，或导入打卡记录的 CSV 导出文件。",
    editShift: "编辑班次", date: "日期", start: "开始", end: "结束", endNextDay: "结束（次日）",
    breakMin: "休息（分钟）", rate: (c) => `时薪（${c}/小时）`, note: "备注（可选）",
    worked: (h, m) => `工作 ${h} · ${m}`,
    deleteShift: "删除班次", confirmDelete: "再次点按以删除", cancel: "取消", save: "保存",
    imported: (n) => `已导入 ${n} 个班次`,
    alreadyPresent: (n) => `${n} 个已存在`,
    unreadable: (n) => `${n} 行无法读取`,
    exported: (n) => `已导出 ${n} 个班次`,
    importFailed: "导入失败：", exportFailed: "导出失败：",
  },

  ja: {
    settings: "設定", back: "戻る", prev: "前へ", next: "次へ", addShift: "シフトを追加", dismiss: "閉じる", period: "期間",
    installTip: "インストール方法：<b>共有</b>をタップし、<b>ホーム画面に追加</b>を選びます。通常のアプリのように開き、オフラインでも使えます。",
    storageWarning: "このブラウザは保存をブロックしています（プライベートブラウズ？）。シフトは保存されません。",
    notClockedIn: "未出勤", clockedInAt: (t) => `${t} に出勤`,
    clockIn: "出勤", clockOut: "退勤", discard: "取り消す", confirmDiscard: "タップして確定",
    rateReminder: "設定で時給を入力すると収入が表示されます。",
    week: "週", month: "月", year: "年", backToToday: "今日に戻る",
    hours: "勤務時間", earned: "収入", shifts: "シフト", noShifts: "この期間のシフトはありません。",
    breakInfo: (m) => `休憩 ${m} 分`,
    language: "言語", pay: "給与", hourlyRate: "時給", ratePlaceholder: "例: 14.95", currency: "通貨",
    rateHint: "新しいシフトにはこの時給が使われます。既存のシフトは保存時の時給のままです。変更するにはシフトをタップしてください。",
    defaultBreak: "デフォルトの無給休憩（分）",
    data: "データ",
    dataPrivacy: "シフトは<b>この端末のこのブラウザにのみ</b>保存され、他の人には見えません。iPhone では、Safari にデータを消去されないようアプリをホーム画面に追加し、ときどき CSV を書き出してバックアップしてください。",
    importHelp: "次の列を含む CSV を読み込めます：日付、開始、終了、休憩（分）、時給、メモ。必須は日付・開始・終了のみで、区切り文字は ',' と ';' のどちらでも使えます。既に存在するシフトはスキップされます。Android アプリから書き出したファイルも使えます。",
    importCsv: "CSV を読み込む", exportCsv: "CSV を書き出す", guide: "使い方ガイド（フランス語）",
    shyfter: "Shyfter の API はアカウント管理者が作成したキーしか受け付けないため、一般の従業員アカウントでは自動同期できません。Shyfter と並行してここで出退勤を記録するか、打刻データの CSV を読み込んでください。",
    editShift: "シフトを編集", date: "日付", start: "開始", end: "終了", endNextDay: "終了（翌日）",
    breakMin: "休憩（分）", rate: (c) => `時給（${c}/時）`, note: "メモ（任意）",
    worked: (h, m) => `勤務 ${h} · ${m}`,
    deleteShift: "シフトを削除", confirmDelete: "もう一度タップして削除", cancel: "キャンセル", save: "保存",
    imported: (n) => `${n} 件のシフトを読み込みました`,
    alreadyPresent: (n) => `${n} 件は登録済み`,
    unreadable: (n) => `${n} 行を読み取れません`,
    exported: (n) => `${n} 件のシフトを書き出しました`,
    importFailed: "読み込みに失敗しました：", exportFailed: "書き出しに失敗しました：",
  },
};

const LANG_KEY = "workhours.lang";

/** Saved choice, else the phone's language if we have it, else English. */
let lang = (() => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && STRINGS[saved]) return saved;
  } catch { /* ignore */ }
  for (const l of navigator.languages || [navigator.language || ""]) {
    const code = l.toLowerCase().slice(0, 2);
    if (STRINGS[code]) return code;
  }
  return "en";
})();

/** The locale used for dates and numbers, e.g. "fr-FR". */
function currentLocale() { return LANGUAGES.find((l) => l.code === lang).locale; }

/** Text for `key` in the current language (English if missing). */
function t(key, ...args) {
  const v = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return typeof v === "function" ? v(...args) : v;
}

/** Changes the language, remembers it, and re-translates the page. */
function setLanguage(code) {
  if (!STRINGS[code]) return;
  lang = code;
  try { localStorage.setItem(LANG_KEY, code); } catch { /* ignore */ }
  applyTranslations();
}

/** Fills every element marked with data-i18n… in index.html. */
function applyTranslations() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-html]")) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", t(el.dataset.i18nAria));
  for (const el of document.querySelectorAll("[data-i18n-title]")) el.title = t(el.dataset.i18nTitle);
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) el.placeholder = t(el.dataset.i18nPlaceholder);
}
