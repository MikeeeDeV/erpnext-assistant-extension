// ERPNext Assistant - Side Panel Script

let currentTab = null;
let chartInstance = null;
let currentData = [];
let currentDoctype = 'Sales Invoice';

// ---- Helpers ----
function getBaseUrl(url) {
  try { return new URL(url).origin; } catch { return null; }
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 2500);
}

async function erpFetch(path, opts = {}) {
  const base = getBaseUrl(currentTab?.url);
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, { credentials: 'include', ...opts });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---- Tab Navigation ----
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ---- Chart Builder ----
async function buildChart() {
  const doctype = document.getElementById('chartDoctype').value;
  const chartType = document.getElementById('chartType').value;
  const base = getBaseUrl(currentTab?.url);
  if (!base) { showToast('No ERPNext tab found'); return; }

  document.getElementById('chartMessage').style.display = 'none';

  // Fetch last 10 records
  const fields = encodeURIComponent('["name","modified","grand_total","status","docstatus"]');
  const data = await erpFetch(`/api/resource/${encodeURIComponent(doctype)}?fields=${fields}&limit=12&order_by=modified+desc`);

  if (!data?.data || data.data.length === 0) {
    document.getElementById('chartMessage').style.display = 'block';
    document.getElementById('chartMessage').textContent = `No ${doctype} records found.`;
    return;
  }

  const records = data.data;
  currentData = records;
  currentDoctype = doctype;

  let labels, values, bgColors;

  if (chartType === 'doughnut' || chartType === 'pie') {
    // Status distribution
    const counts = {};
    records.forEach(r => {
      const s = r.status || (r.docstatus === 0 ? 'Draft' : r.docstatus === 1 ? 'Submitted' : 'Cancelled');
      counts[s] = (counts[s] || 0) + 1;
    });
    labels = Object.keys(counts);
    values = Object.values(counts);
    bgColors = ['#36B54A','#27ADE1','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
  } else {
    // Time series or amounts
    labels = records.map(r => r.name.slice(-8));
    values = records.map(r => parseFloat(r.grand_total || r.base_grand_total || 1));
    bgColors = records.map((_, i) => i % 2 === 0 ? '#36B54A' : '#27ADE1');
  }

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('mainChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [{
        label: doctype,
        data: values,
        backgroundColor: bgColors,
        borderColor: chartType === 'line' ? '#36B54A' : bgColors,
        borderWidth: chartType === 'line' ? 2.5 : 1.5,
        borderRadius: chartType === 'bar' ? 6 : 0,
        fill: chartType === 'line' ? { target: 'origin', above: 'rgba(54,181,74,0.08)' } : false,
        tension: 0.4,
        pointBackgroundColor: '#36B54A',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === 'doughnut' || chartType === 'pie',
          position: 'bottom',
          labels: { font: { family: 'DM Sans', size: 11 }, padding: 10 }
        },
        tooltip: {
          backgroundColor: '#1a2e1c',
          titleFont: { family: 'DM Sans', weight: 'bold' },
          bodyFont: { family: 'DM Mono' },
        }
      },
      scales: chartType === 'doughnut' || chartType === 'pie' ? {} : {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { color: '#e2ede3' }, ticks: { font: { family: 'DM Mono', size: 10 } } }
      }
    }
  });

  showToast(`Chart built for ${doctype}`, 'green');
}

document.getElementById('buildChart').addEventListener('click', buildChart);

// ---- Export ----
function exportCSV() {
  if (!currentData.length) { showToast('Build a chart or load data first'); return; }
  const keys = Object.keys(currentData[0]);
  const csv = [keys.join(','), ...currentData.map(r => keys.map(k => `"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  downloadFile(csv, `${currentDoctype}_export_${Date.now()}.csv`, 'text/csv');
  showToast('CSV exported!', 'green');
}

function exportXLSX() {
  if (!currentData.length) { showToast('Build a chart or load data first'); return; }
  // Simple TSV as XLSX fallback (proper XLSX requires library)
  const keys = Object.keys(currentData[0]);
  const tsv = [keys.join('\t'), ...currentData.map(r => keys.map(k => String(r[k]??'')).join('\t'))].join('\n');
  downloadFile(tsv, `${currentDoctype}_export_${Date.now()}.xls`, 'application/vnd.ms-excel');
  showToast('XLSX exported!', 'blue');
}

function exportJSON() {
  if (!currentData.length) { showToast('Build a chart or load data first'); return; }
  downloadFile(JSON.stringify(currentData, null, 2), `${currentDoctype}_export_${Date.now()}.json`, 'application/json');
  showToast('JSON exported!', 'green');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('exportCSV').addEventListener('click', exportCSV);
document.getElementById('exportXLSX').addEventListener('click', exportXLSX);
document.getElementById('exportJSON').addEventListener('click', exportJSON);

// ---- Data Tab ----
async function loadData() {
  const doctype = document.getElementById('dataDoctype').value;
  currentDoctype = doctype;

  document.getElementById('dataEmpty').style.display = 'none';
  document.getElementById('dataTableWrap').style.display = 'none';
  document.getElementById('dataLoading').style.display = 'block';
  document.getElementById('dataSummary').style.display = 'none';

  const fields = encodeURIComponent('["name","status","docstatus","modified","grand_total","customer","supplier","item_name","customer_name"]');
  const data = await erpFetch(`/api/resource/${encodeURIComponent(doctype)}?fields=${fields}&limit=20&order_by=modified+desc`);

  document.getElementById('dataLoading').style.display = 'none';

  if (!data?.data || data.data.length === 0) {
    document.getElementById('dataEmpty').style.display = 'block';
    document.getElementById('dataEmpty').textContent = `No records found for ${doctype}`;
    return;
  }

  currentData = data.data;
  const records = data.data;

  // Summary
  const drafts = records.filter(r => r.docstatus === 0).length;
  const submitted = records.filter(r => r.docstatus === 1).length;
  document.getElementById('sumTotal').textContent = records.length;
  document.getElementById('sumDraft').textContent = drafts;
  document.getElementById('sumSubmitted').textContent = submitted;
  document.getElementById('dataSummary').style.display = 'grid';

  // Table columns — pick the best ones from record
  const allKeys = Object.keys(records[0]).filter(k => records[0][k] !== null && records[0][k] !== '');
  const priorityCols = ['name','customer','supplier','customer_name','item_name','status','grand_total','modified'];
  const cols = [...priorityCols.filter(k => allKeys.includes(k)), ...allKeys.filter(k => !priorityCols.includes(k))].slice(0, 5);

  const head = document.getElementById('dataHead');
  const body = document.getElementById('dataBody');

  head.innerHTML = `<tr>${cols.map(c => `<th>${c.replace(/_/g,' ')}</th>`).join('')}</tr>`;
  body.innerHTML = records.map(r =>
    `<tr>${cols.map(c => `<td>${escapeHtml(r[c] ?? '—')}</td>`).join('')}</tr>`
  ).join('');

  document.getElementById('dataTableWrap').style.display = 'block';
}

document.getElementById('loadData').addEventListener('click', loadData);

// ---- Entry Tab ----
const entryForms = {
  'Sales Invoice': [
    { id: 'customer', label: 'Customer', type: 'text', placeholder: 'Customer name…' },
    { id: 'posting_date', label: 'Date', type: 'date', placeholder: '' },
    { id: 'due_date', label: 'Due Date', type: 'date', placeholder: '' },
    { id: 'remarks', label: 'Remarks', type: 'text', placeholder: 'Optional notes…' },
  ],
  'Sales Order': [
    { id: 'customer', label: 'Customer', type: 'text', placeholder: 'Customer name…' },
    { id: 'transaction_date', label: 'Date', type: 'date', placeholder: '' },
    { id: 'delivery_date', label: 'Delivery Date', type: 'date', placeholder: '' },
    { id: 'order_type', label: 'Order Type', type: 'select', options: ['Sales','Maintenance','Shopping Cart'] },
  ],
  'Purchase Order': [
    { id: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Supplier name…' },
    { id: 'transaction_date', label: 'Date', type: 'date', placeholder: '' },
    { id: 'schedule_date', label: 'Required By', type: 'date', placeholder: '' },
  ],
  'Customer': [
    { id: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'Full name…' },
    { id: 'customer_type', label: 'Type', type: 'select', options: ['Company','Individual'] },
    { id: 'customer_group', label: 'Group', type: 'text', placeholder: 'e.g. Commercial' },
    { id: 'territory', label: 'Territory', type: 'text', placeholder: 'e.g. Egypt' },
  ],
  'Item': [
    { id: 'item_name', label: 'Item Name', type: 'text', placeholder: 'Product name…' },
    { id: 'item_group', label: 'Item Group', type: 'text', placeholder: 'e.g. Products' },
    { id: 'is_stock_item', label: 'Stock Item', type: 'select', options: ['Yes','No'] },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Optional…' },
  ],
};

function renderEntryForm() {
  const doctype = document.getElementById('entryDoctype').value;
  const fields = entryForms[doctype] || [];
  const form = document.getElementById('entryForm');

  form.innerHTML = fields.map((f, i) => {
    if (f.type === 'select') {
      return `<div class="form-row">
        <label class="form-label" for="ef_${f.id}">${f.label}</label>
        <select class="form-input" id="ef_${f.id}">
          ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>
      </div>`;
    }
    return `<div class="form-row">
      <label class="form-label" for="ef_${f.id}">${f.label}</label>
      <input class="form-input" type="${f.type}" id="ef_${f.id}" placeholder="${f.placeholder ?? ''}" />
    </div>`;
  }).join('');

  // Auto-fill today's date
  const today = new Date().toISOString().split('T')[0];
  form.querySelectorAll('input[type="date"]').forEach(el => { el.value = today; });
}

document.getElementById('entryDoctype').addEventListener('change', renderEntryForm);

document.getElementById('submitEntry').addEventListener('click', async () => {
  const doctype = document.getElementById('entryDoctype').value;
  const fields = entryForms[doctype] || [];
  const payload = { doctype };

  fields.forEach(f => {
    const el = document.getElementById(`ef_${f.id}`);
    if (el) payload[f.id] = el.value;
  });

  const base = getBaseUrl(currentTab?.url);
  if (!base) { showToast('No ERPNext tab found'); return; }

  try {
    const res = await fetch(`${base}/api/resource/${encodeURIComponent(doctype)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': 'fetch' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const d = await res.json();
      showToast(`✅ ${doctype} created: ${d?.data?.name || ''}`, 'green');
    } else {
      // Open new doc form as fallback
      chrome.tabs.create({ url: `${base}/${doctype.toLowerCase().replace(/ /g,'-')}/new-${doctype.toLowerCase().replace(/ /g,'-')}-1` });
      showToast(`Opening new ${doctype} form…`);
    }
  } catch {
    showToast('Opening ERPNext form…');
    chrome.tabs.create({ url: `${base}/${doctype.toLowerCase().replace(/ /g,'-')}/new-1` });
  }
});

// ---- Notifications Tab ----
async function loadNotifications() {
  const notifList = document.getElementById('notifList');
  const overdueList = document.getElementById('overdueList');

  // Fetch notifications from ERPNext
  const notifs = await erpFetch('/api/method/frappe.desk.notifications.get_notifications');

  if (notifs?.message) {
    const items = [
      ...(notifs.message.open_count_doctype ? Object.entries(notifs.message.open_count_doctype).map(([k,v]) => ({
        icon: '📌', title: `${v} Open ${k}`, sub: 'Requires attention', time: 'now', color: 'green'
      })) : []),
    ].slice(0, 6);

    if (items.length > 0) {
      notifList.innerHTML = items.map(n => `
        <div class="notif-item">
          <div class="notif-icon">${n.icon}</div>
          <div class="notif-body">
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-sub">${escapeHtml(n.sub)}</div>
          </div>
          <div class="notif-time">${n.time}</div>
        </div>
      `).join('');
    } else {
      notifList.innerHTML = `<div class="notif-item"><div class="notif-icon">✅</div><div class="notif-body"><div class="notif-title">All clear!</div><div class="notif-sub">No pending notifications</div></div></div>`;
    }
  } else {
    notifList.innerHTML = `
      <div class="notif-item">
        <div class="notif-icon">📦</div>
        <div class="notif-body"><div class="notif-title">Check Sales Orders</div><div class="notif-sub">Verify pending deliveries</div></div>
        <div class="notif-time">Today</div>
      </div>
      <div class="notif-item">
        <div class="notif-icon">💰</div>
        <div class="notif-body"><div class="notif-title">Payment Follow-up</div><div class="notif-sub">Outstanding receivables</div></div>
        <div class="notif-time">Today</div>
      </div>`;
  }

  // Overdue invoices
  const overdue = await erpFetch(
    `/api/resource/Sales Invoice?filters=${encodeURIComponent('[["docstatus","=","1"],["outstanding_amount",">","0"]]')}&fields=${encodeURIComponent('["name","customer","outstanding_amount","due_date"]')}&limit=5&order_by=due_date+asc`
  );

  if (overdue?.data && overdue.data.length > 0) {
    overdueList.innerHTML = overdue.data.map(r => `
      <div class="notif-item">
        <div class="notif-dot"></div>
        <div class="notif-body">
          <div class="notif-title">${escapeHtml(r.customer || r.name)}</div>
          <div class="notif-sub">${escapeHtml(r.name)} · Due ${escapeHtml(r.due_date || '—')}</div>
        </div>
        <div class="notif-time" style="color:#ef4444;font-weight:600;">${r.outstanding_amount ? parseFloat(r.outstanding_amount).toLocaleString() : '—'}</div>
      </div>
    `).join('');
  } else {
    overdueList.innerHTML = `<div class="notif-item"><div class="notif-icon">🎉</div><div class="notif-body"><div class="notif-title">No overdue invoices</div><div class="notif-sub">All payments are current</div></div></div>`;
  }
}

// ---- Init ----
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (tab?.url) {
    try {
      const hostname = new URL(tab.url).hostname;
      document.getElementById('siteUrl').textContent = hostname;
    } catch {}
  }

  renderEntryForm();
  loadNotifications();
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'LIST_DATA') {
    currentData = msg.data;
    currentDoctype = msg.doctype;
    showToast(`Got ${msg.data.length} records`, 'green');
    // Switch to chart tab and build
    document.querySelector('[data-tab="chart"]').click();
    setTimeout(buildChart, 300);
  }
});

init();
