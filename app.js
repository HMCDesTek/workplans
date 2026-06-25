const STORAGE_KEY = "sustainability-workplans-v1";
const WORKPLAN_VERSION = "2025.06.20-rubric";

const SIZE_LABELS = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const BASE_TASKS = [
  { phase: "Pre Design", task: "Climate study report", hours: { small: 4, medium: 4, large: 4 }, notes: "" },
  { phase: "Pre Design", task: "Solar Radiation Study", hours: { small: 2, medium: 4, large: 6 }, notes: "" },
  { phase: "Pre Design", task: "Shade Study", hours: { small: 2, medium: 4, large: 6 }, notes: "" },
  { phase: "Pre Design", task: "Wind Study", hours: { small: 4, medium: 8, large: 12 }, notes: "" },
  { phase: "Pre Design", task: "Integrated Design Charrette (Priorities/Goals)", hours: { small: 16, medium: 24, large: 40 }, notes: "" },
  { phase: "Pre Design", task: "2030 Baseline/Target report", hours: { small: 4, medium: 4, large: 4 }, notes: "" },
  { phase: "Schematic Design", task: "Daylight analysis", hours: { small: 8, medium: 12, large: 20 }, notes: "Assumes one run and minor adjustment updates. Multiple runs or options require added time." },
  { phase: "Schematic Design", task: "Cleaning model for daylight analysis", hours: { small: 4, medium: 6, large: 8 }, notes: "" },
  { phase: "Schematic Design", task: "CALGreen Coordination", hours: { small: 2, medium: 4, large: 8 }, rate: { large: 215 }, notes: "Large-project source fee uses $215/hr." },
  { phase: "Schematic Design", task: "2030 Reporting", hours: { small: 2, medium: 3, large: 4 }, notes: "" },
  { phase: "Design Development", task: "Daylight analysis", hours: { small: 8, medium: 12, large: 20 }, notes: "Assumes one run and minor adjustment updates. Multiple runs or options require added time." },
  { phase: "Design Development", task: "Material Pledge", hours: { small: 4, medium: 10, large: 16 }, notes: "" },
  { phase: "Design Development", task: "CALGreen Coordination", hours: { small: 4, medium: 8, large: 12 }, notes: "" },
  { phase: "Design Development", task: "2030 Reporting", hours: { small: 2, medium: 3, large: 4 }, notes: "" },
  { phase: "Construction Documents", task: "Material Pledge", hours: { small: 4, medium: 10, large: 16 }, notes: "" },
  { phase: "Construction Documents", task: "CALGreen Coordination", hours: { small: 2, medium: 4, large: 8 }, notes: "" },
  { phase: "Construction Documents", task: "2030 Reporting", hours: { small: 2, medium: 3, large: 4 }, rate: { large: 215 }, notes: "Large-project source fee uses $215/hr." },
  { phase: "Bidding", task: "CALGreen Coordination", hours: { small: 1, medium: 2, large: 3 }, notes: "" },
  { phase: "Construction Admin", task: "CALGreen Coordination", hours: { small: 2, medium: 4, large: 6 }, notes: "" },
  { phase: "Construction Admin", task: "2030 Reporting", hours: { small: 4, medium: 8, large: 12 }, notes: "" },
];

const SERVICE_TEMPLATES = {
  LEED: [
    { phase: "Certification", task: "LEED scorecard and basis of design", hours: { small: 10, medium: 16, large: 24 }, notes: "Added planning allowance. Confirm project-specific fee before contracting." },
    { phase: "Certification", task: "LEED documentation coordination", hours: { small: 18, medium: 32, large: 48 }, notes: "Added planning allowance. Confirm project-specific fee before contracting." },
  ],
  CHPS: [
    { phase: "Certification", task: "CHPS criteria review and documentation plan", hours: { small: 8, medium: 14, large: 22 }, notes: "Added planning allowance. Confirm project-specific fee before contracting." },
    { phase: "Certification", task: "CHPS submittal coordination", hours: { small: 14, medium: 24, large: 38 }, notes: "Added planning allowance. Confirm project-specific fee before contracting." },
  ],
  LCA: [
    { phase: "Specialty Services", task: "Whole-building LCA setup and assumptions", hours: { small: 10, medium: 18, large: 28 }, notes: "Specialty allowance from service option list." },
    { phase: "Specialty Services", task: "LCA modeling, comparison, and summary", hours: { small: 18, medium: 30, large: 46 }, notes: "Specialty allowance from service option list." },
  ],
  "CALGreen CxA (External)": [
    { phase: "External Coordination", task: "CALGreen commissioning authority coordination", hours: { small: 4, medium: 6, large: 8 }, notes: "External CxA by others; coordination allowance only." },
  ],
  "Specialty Services": [
    { phase: "Specialty Services", task: "Project-specific sustainability specialty service", hours: { small: 8, medium: 16, large: 24 }, notes: "Placeholder for specialty scope. Edit hours before saving." },
  ],
};

const emptyPlan = () => ({
  id: makeId(),
  version: WORKPLAN_VERSION,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  projectName: "",
  projectNumber: "",
  projectManager: "",
  sustainabilityLead: "",
  dueDate: "",
  emailRecipient: "",
  buildingCount: 1,
  squareFeet: "",
  billingRate: 240,
  projectSize: "small",
  greenCertification: false,
  services: [],
  rowOverrides: {},
});

let plans = loadPlans();
let currentPlan = plans[0] || emptyPlan();
let dirty = false;

const el = {
  form: document.querySelector("#workplanForm"),
  title: document.querySelector("#currentPlanTitle"),
  savedState: document.querySelector("#savedStateLabel"),
  recordList: document.querySelector("#recordList"),
  recordSearch: document.querySelector("#recordSearch"),
  tableBody: document.querySelector("#workplanTable tbody"),
  totalHours: document.querySelector("#totalHours"),
  totalFee: document.querySelector("#totalFee"),
  summaryBuildings: document.querySelector("#summaryBuildings"),
  summarySize: document.querySelector("#summarySize"),
  phaseBars: document.querySelector("#phaseBars"),
  phaseCount: document.querySelector("#phaseCountLabel"),
  payloadPreview: document.querySelector("#payloadPreview"),
  toast: document.querySelector("#toast"),
  emailDialog: document.querySelector("#emailDialog"),
  emailReview: document.querySelector("#emailReview"),
};

bindEvents();
loadPlanIntoForm(currentPlan);
renderAll();

function bindEvents() {
  el.form.addEventListener("input", () => {
    currentPlan = readPlanFromForm(currentPlan);
    dirty = true;
    renderAll();
  });

  document.querySelector("#newPlanButton").addEventListener("click", () => {
    currentPlan = emptyPlan();
    dirty = true;
    loadPlanIntoForm(currentPlan);
    renderAll();
  });

  document.querySelector("#duplicatePlanButton").addEventListener("click", () => {
    const copy = { ...currentPlan, id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    copy.projectName = `${copy.projectName || "Untitled Workplan"} copy`;
    currentPlan = copy;
    dirty = true;
    loadPlanIntoForm(currentPlan);
    renderAll();
  });

  document.querySelector("#savePlanButton").addEventListener("click", saveCurrentPlan);
  document.querySelector("#resetRowsButton").addEventListener("click", resetRowsFromTemplate);
  document.querySelector("#exportCsvButton").addEventListener("click", () => downloadFile(csvFilename(), buildCsv(), "text/csv;charset=utf-8"));
  document.querySelector("#exportExcelButton").addEventListener("click", () => downloadFile(excelFilename(), buildExcelHtml(), "application/vnd.ms-excel;charset=utf-8"));
  document.querySelector("#emailPlanButton").addEventListener("click", openEmailReview);
  document.querySelector("#downloadEmailCsvButton").addEventListener("click", () => downloadFile(csvFilename(), buildCsv(), "text/csv;charset=utf-8"));
  document.querySelector("#downloadEmlButton").addEventListener("click", () => downloadFile(emlFilename(), buildEml(), "message/rfc822;charset=utf-8"));
  document.querySelector("#openEmailDraftButton").addEventListener("click", openMailDraft);
  document.querySelector("#copyPayloadButton").addEventListener("click", copyPayload);
  el.recordSearch.addEventListener("input", renderRecords);
}

function loadPlans() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistPlans() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function loadPlanIntoForm(plan) {
  for (const field of ["projectName", "projectNumber", "projectManager", "sustainabilityLead", "dueDate", "emailRecipient", "buildingCount", "squareFeet", "billingRate"]) {
    const input = document.querySelector(`#${field}`);
    input.value = plan[field] ?? "";
  }
  document.querySelector(`input[name="projectSize"][value="${plan.projectSize || "small"}"]`).checked = true;
  document.querySelector("#greenCertification").checked = Boolean(plan.greenCertification);
  document.querySelectorAll('input[name="services"]').forEach((input) => {
    input.checked = plan.services?.includes(input.value) || false;
  });
}

function readPlanFromForm(base) {
  const formData = new FormData(el.form);
  return {
    ...base,
    projectName: clean(formData.get("projectName")),
    projectNumber: clean(formData.get("projectNumber")),
    projectManager: clean(formData.get("projectManager")),
    sustainabilityLead: clean(formData.get("sustainabilityLead")),
    dueDate: clean(formData.get("dueDate")),
    emailRecipient: clean(formData.get("emailRecipient")),
    buildingCount: Math.max(1, parseInt(formData.get("buildingCount"), 10) || 1),
    squareFeet: clean(formData.get("squareFeet")),
    billingRate: Math.max(0, Number(formData.get("billingRate")) || 0),
    projectSize: formData.get("projectSize") || "small",
    greenCertification: formData.get("greenCertification") === "on",
    services: formData.get("greenCertification") === "on" ? formData.getAll("services") : [],
  };
}

function getTemplateRows(plan) {
  const rows = BASE_TASKS.map((task) => rowFromTemplate(task, plan, "Base rubric"));
  if (plan.greenCertification) {
    for (const service of plan.services || []) {
      for (const template of SERVICE_TEMPLATES[service] || []) {
        rows.push(rowFromTemplate(template, plan, service));
      }
    }
  }

  return rows.map((row) => {
    const override = plan.rowOverrides?.[row.key];
    if (!override) return row;
    return {
      ...row,
      active: override.active ?? row.active,
      hours: override.hours ?? row.hours,
      rate: override.rate ?? row.rate,
      notes: override.notes ?? row.notes,
    };
  });
}

function rowFromTemplate(template, plan, source) {
  const rawHours = template.hours[plan.projectSize] || 0;
  const hours = round(rawHours * plan.buildingCount);
  const rate = template.rate?.[plan.projectSize] ?? plan.billingRate;
  const key = [source, template.phase, template.task].join("::");
  return {
    key,
    source,
    phase: template.phase,
    task: template.task,
    hours,
    rate,
    notes: template.notes,
    active: true,
  };
}

function getActiveRows() {
  return getTemplateRows(currentPlan).filter((row) => row.active);
}

function summarize(rows = getActiveRows()) {
  const totalHours = round(rows.reduce((sum, row) => sum + Number(row.hours || 0), 0));
  const totalFee = round(rows.reduce((sum, row) => sum + Number(row.hours || 0) * Number(row.rate || 0), 0));
  const phases = rows.reduce((acc, row) => {
    acc[row.phase] = (acc[row.phase] || 0) + Number(row.hours || 0);
    return acc;
  }, {});
  return { totalHours, totalFee, phases };
}

function renderAll() {
  currentPlan = readPlanFromForm(currentPlan);
  renderHeader();
  renderTable();
  renderSummary();
  renderRecords();
  renderPayload();
}

function renderHeader() {
  el.title.textContent = currentPlan.projectName || "Untitled Workplan";
  const isSaved = plans.some((plan) => plan.id === currentPlan.id);
  el.savedState.textContent = dirty || !isSaved ? "Unsaved changes" : `Saved ${formatDateTime(currentPlan.updatedAt)}`;
  document.querySelector("#serviceOptions").style.opacity = currentPlan.greenCertification ? "1" : "0.52";
}

function renderTable() {
  const rows = getTemplateRows(currentPlan);
  const fragments = [];
  let lastPhase = "";
  for (const row of rows) {
    if (row.phase !== lastPhase) {
      lastPhase = row.phase;
    }
    fragments.push(`
      <tr data-key="${escapeHtml(row.key)}">
        <td><input class="row-active" type="checkbox" ${row.active ? "checked" : ""} aria-label="Use ${escapeHtml(row.task)}"></td>
        <td>${escapeHtml(row.phase)}</td>
        <td><strong>${escapeHtml(row.task)}</strong><br><small>${escapeHtml(row.source)}</small></td>
        <td><input data-field="hours" type="number" min="0" step="0.25" value="${row.hours}"></td>
        <td><input data-field="rate" type="number" min="0" step="5" value="${row.rate}"></td>
        <td class="fee-cell">${money(Number(row.hours) * Number(row.rate))}</td>
        <td><input data-field="notes" type="text" value="${escapeAttribute(row.notes)}"></td>
      </tr>
    `);
  }
  el.tableBody.innerHTML = fragments.join("");
  el.tableBody.querySelectorAll("input").forEach((input) => input.addEventListener("change", handleRowEdit));
}

function handleRowEdit(event) {
  const tr = event.target.closest("tr");
  const key = tr.dataset.key;
  const current = getTemplateRows(currentPlan).find((row) => row.key === key);
  const override = currentPlan.rowOverrides[key] || {};
  if (event.target.classList.contains("row-active")) {
    override.active = event.target.checked;
  } else {
    const field = event.target.dataset.field;
    override[field] = field === "notes" ? event.target.value : Number(event.target.value) || 0;
  }
  currentPlan.rowOverrides[key] = { ...current, ...override };
  dirty = true;
  renderAll();
}

function renderSummary() {
  const summary = summarize();
  el.totalHours.textContent = number(summary.totalHours);
  el.totalFee.textContent = money(summary.totalFee);
  el.summaryBuildings.textContent = String(currentPlan.buildingCount);
  el.summarySize.textContent = SIZE_LABELS[currentPlan.projectSize];

  const phases = Object.entries(summary.phases);
  const max = Math.max(...phases.map(([, hours]) => hours), 1);
  el.phaseCount.textContent = `${phases.length} phases`;
  el.phaseBars.innerHTML = phases.map(([phase, hours]) => `
    <div class="phase-row">
      <header><strong>${escapeHtml(phase)}</strong><span>${number(hours)} hrs</span></header>
      <div class="phase-track"><div class="phase-fill" style="width:${Math.max(3, (hours / max) * 100)}%"></div></div>
    </div>
  `).join("");
}

function renderRecords() {
  const term = el.recordSearch.value.trim().toLowerCase();
  const filtered = plans
    .filter((plan) => `${plan.projectName} ${plan.projectNumber} ${plan.projectManager}`.toLowerCase().includes(term))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  el.recordList.innerHTML = filtered.length ? filtered.map((plan) => {
    const summary = summarize(getTemplateRows(plan).filter((row) => row.active));
    return `
      <button class="record-card ${plan.id === currentPlan.id ? "active" : ""}" data-id="${plan.id}" type="button">
        <strong>${escapeHtml(plan.projectName || "Untitled Workplan")}</strong>
        <span>${escapeHtml(SIZE_LABELS[plan.projectSize] || "Small")} | ${plan.buildingCount || 1} building(s) | ${number(summary.totalHours)} hrs | ${money(summary.totalFee)}</span>
        <span>${formatDateTime(plan.updatedAt)}</span>
      </button>
    `;
  }).join("") : `<p>No saved workplans yet.</p>`;

  el.recordList.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = plans.find((plan) => plan.id === button.dataset.id);
      if (!selected) return;
      currentPlan = clonePlan(selected);
      dirty = false;
      loadPlanIntoForm(currentPlan);
      renderAll();
    });
  });
}

function renderPayload() {
  const payload = buildPayload();
  el.payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

function saveCurrentPlan() {
  currentPlan = readPlanFromForm(currentPlan);
  currentPlan.updatedAt = new Date().toISOString();
  const index = plans.findIndex((plan) => plan.id === currentPlan.id);
  if (index >= 0) {
    plans[index] = clonePlan(currentPlan);
  } else {
    plans.push(clonePlan(currentPlan));
  }
  persistPlans();
  dirty = false;
  renderAll();
  showToast("Workplan saved");
}

function resetRowsFromTemplate() {
  currentPlan.rowOverrides = {};
  dirty = true;
  renderAll();
  showToast("Rows reset from selected template");
}

function buildPayload() {
  const rows = getActiveRows();
  const summary = summarize(rows);
  return {
    workplanId: currentPlan.id,
    version: WORKPLAN_VERSION,
    project: {
      name: currentPlan.projectName,
      number: currentPlan.projectNumber,
      manager: currentPlan.projectManager,
      sustainabilityLead: currentPlan.sustainabilityLead,
      dueDate: currentPlan.dueDate || null,
      squareFeet: currentPlan.squareFeet ? Number(currentPlan.squareFeet) : null,
      buildingCount: currentPlan.buildingCount,
      projectSize: currentPlan.projectSize,
    },
    scopeOptions: {
      greenCertification: currentPlan.greenCertification,
      services: currentPlan.services,
    },
    financials: {
      billingRate: currentPlan.billingRate,
      totalHours: summary.totalHours,
      estimatedFee: summary.totalFee,
      phaseHours: summary.phases,
    },
    rows: rows.map((row) => ({
      phase: row.phase,
      task: row.task,
      source: row.source,
      hours: Number(row.hours),
      rate: Number(row.rate),
      fee: round(Number(row.hours) * Number(row.rate)),
      notes: row.notes,
    })),
    integration: {
      databricksAccessLayer: "planned",
      sigmaAnalyticsUse: "base workplan plus actuals delta tracking",
    },
    updatedAt: currentPlan.updatedAt,
  };
}

function buildCsv() {
  const payload = buildPayload();
  const meta = [
    ["Project Name", payload.project.name],
    ["Project Number", payload.project.number],
    ["Project Manager", payload.project.manager],
    ["Sustainability Lead", payload.project.sustainabilityLead],
    ["Due Date", payload.project.dueDate || ""],
    ["Project Size", SIZE_LABELS[payload.project.projectSize]],
    ["Building Count", payload.project.buildingCount],
    ["Square Feet", payload.project.squareFeet || ""],
    ["Green Building Certification", payload.scopeOptions.greenCertification ? "Yes" : "No"],
    ["Services", payload.scopeOptions.services.join("; ")],
    ["Total Hours", payload.financials.totalHours],
    ["Estimated Fee", payload.financials.estimatedFee],
  ];
  const rows = [
    ["Sustainability Workplan"],
    ...meta,
    [],
    ["Phase", "Task", "Source", "Hours", "Rate", "Fee", "Notes"],
    ...payload.rows.map((row) => [row.phase, row.task, row.source, row.hours, row.rate, row.fee, row.notes]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildExcelHtml() {
  const payload = buildPayload();
  const rows = payload.rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.phase)}</td>
      <td>${escapeHtml(row.task)}</td>
      <td>${escapeHtml(row.source)}</td>
      <td>${row.hours}</td>
      <td>${row.rate}</td>
      <td>${row.fee}</td>
      <td>${escapeHtml(row.notes)}</td>
    </tr>
  `).join("");
  return `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <h1>Sustainability Workplan</h1>
        <table border="1">
          <tr><th>Project</th><td>${escapeHtml(payload.project.name)}</td></tr>
          <tr><th>Project Number</th><td>${escapeHtml(payload.project.number)}</td></tr>
          <tr><th>Total Hours</th><td>${payload.financials.totalHours}</td></tr>
          <tr><th>Estimated Fee</th><td>${payload.financials.estimatedFee}</td></tr>
        </table>
        <br>
        <table border="1">
          <thead><tr><th>Phase</th><th>Task</th><th>Source</th><th>Hours</th><th>Rate</th><th>Fee</th><th>Notes</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

function openEmailReview() {
  saveCurrentPlan();
  const payload = buildPayload();
  el.emailReview.innerHTML = [
    ["Recipient", currentPlan.emailRecipient || "Not set"],
    ["Project", payload.project.name || "Untitled Workplan"],
    ["Template", SIZE_LABELS[payload.project.projectSize]],
    ["Buildings", payload.project.buildingCount],
    ["Services", payload.scopeOptions.services.join(", ") || "Base scope"],
    ["Total", `${number(payload.financials.totalHours)} hrs / ${money(payload.financials.estimatedFee)}`],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("");
  el.emailDialog.showModal();
}

function openMailDraft() {
  const payload = buildPayload();
  const subject = `Sustainability workplan - ${payload.project.name || "Untitled Workplan"}`;
  const body = [
    `Hi,`,
    ``,
    `Please review the sustainability workplan for ${payload.project.name || "this project"}.`,
    ``,
    `Project size: ${SIZE_LABELS[payload.project.projectSize]}`,
    `Building count: ${payload.project.buildingCount}`,
    `Green Building certification: ${payload.scopeOptions.greenCertification ? "Yes" : "No"}`,
    `Services: ${payload.scopeOptions.services.join(", ") || "Base scope"}`,
    `Total hours: ${number(payload.financials.totalHours)}`,
    `Estimated fee: ${money(payload.financials.estimatedFee)}`,
    ``,
    `A CSV or .eml package can be downloaded from the workplan tool for attachment.`,
  ].join("\n");
  const href = `mailto:${encodeURIComponent(currentPlan.emailRecipient || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
}

function buildEml() {
  const payload = buildPayload();
  const boundary = `workplan-${Date.now()}`;
  const csv = buildCsv();
  const encodedCsv = btoa(unescape(encodeURIComponent(csv))).replace(/(.{76})/g, "$1\r\n");
  const subject = `Sustainability workplan - ${payload.project.name || "Untitled Workplan"}`;
  const text = [
    `Please review the attached sustainability workplan.`,
    ``,
    `Project: ${payload.project.name || "Untitled Workplan"}`,
    `Total hours: ${number(payload.financials.totalHours)}`,
    `Estimated fee: ${money(payload.financials.estimatedFee)}`,
  ].join("\r\n");
  return [
    `To: ${currentPlan.emailRecipient || ""}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    ``,
    text,
    ``,
    `--${boundary}`,
    `Content-Type: text/csv; name="${csvFilename()}"`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="${csvFilename()}"`,
    ``,
    encodedCsv,
    ``,
    `--${boundary}--`,
  ].join("\r\n");
}

async function copyPayload() {
  const text = JSON.stringify(buildPayload(), null, 2);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast("Payload copied");
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const chunk = () => Math.random().toString(16).slice(2);
  return `${Date.now().toString(16)}-${chunk()}-${chunk()}`;
}

function clonePlan(plan) {
  if (globalThis.structuredClone) return structuredClone(plan);
  return JSON.parse(JSON.stringify(plan));
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast(`${filename} downloaded`);
}

function csvFilename() {
  return `${slug(currentPlan.projectName || "sustainability-workplan")}.csv`;
}

function excelFilename() {
  return `${slug(currentPlan.projectName || "sustainability-workplan")}.xls`;
}

function emlFilename() {
  return `${slug(currentPlan.projectName || "sustainability-workplan")}.eml`;
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "workplan";
}

function clean(value) {
  return String(value || "").trim();
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function number(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value || 0);
}

function formatDateTime(value) {
  if (!value) return "not saved";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => el.toast.classList.remove("show"), 2200);
}
