// ERPNext Assistant - Popup Script

const ERPNextHelper = {
  // Detect if current tab is ERPNext
  async detectERPNext(tab) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Primary: window.frappe object (works even with custom branding)
          if (window.frappe && window.frappe.boot) return true;
          if (window.frappe && window.frappe.csrf_token) return true;
          // Secondary: Frappe DOM markers
          if (document.querySelector('[data-doctype]')) return true;
          if (document.querySelector('.frappe-app')) return true;
          if (document.querySelector('#navbar-main')) return true;
          if (document.querySelector('.page-container')) return true;
          // Tertiary: title keywords (fallback)
          const t = document.title;
          return t.includes('ERPNext') || t.includes('Frappe');
        }
      });
      return results[0]?.result === true;
    } catch {
      // If scripting fails, assume it might be ERPNext and try anyway
      return true;
    }
  },

  // Get ERPNext base URL from tab
  getBaseUrl(url) {
    try {
      const u = new URL(url);
      return u.origin;
    } catch { return null; }
  },

  // Fetch data from ERPNext API
  async fetchERPData(tabUrl, doctype, filters = '[]', fields = '["name"]', limit = 5) {
    const base = this.getBaseUrl(tabUrl);
    if (!base) return null;
    const url = `${base}/api/resource/${encodeURIComponent(doctype)}?filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent(fields)}&limit=${limit}&order_by=modified+desc`;
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  // Get count of a doctype
  async getCount(tabUrl, doctype) {
    const base = this.getBaseUrl(tabUrl);
    if (!base) return '—';
    try {
      const res = await fetch(`${base}/api/resource/${encodeURIComponent(doctype)}?limit=0`, { credentials: 'include' });
      if (!res.ok) return '—';
      const d = await res.json();
      return d?.data?.length ?? (d?.message ?? '—');
    } catch { return '—'; }
  }
};

// ---- UI helpers ----
function setStatus(isConnected, text) {
  const bar = document.getElementById('statusBar');
  const txt = document.getElementById('statusText');
  bar.className = 'status-bar' + (isConnected ? '' : ' inactive');
  txt.textContent = text;
}

function renderActivity(records, doctype) {
  const list = document.getElementById('activityList');
  if (!records || records.length === 0) {
    list.innerHTML = `<div class="activity-item"><div class="activity-dot orange"></div><div class="activity-text">No recent ${doctype} found</div><div class="activity-time">—</div></div>`;
    return;
  }
  const colors = ['green', 'blue', 'green', 'blue', 'orange'];
  list.innerHTML = records.slice(0, 4).map((r, i) => `
    <div class="activity-item">
      <div class="activity-dot ${colors[i % colors.length]}"></div>
      <div class="activity-text">${r.name || r.title || 'Record'}</div>
      <div class="activity-time">${r.status || r.docstatus === 0 ? 'Draft' : 'Submitted'}</div>
    </div>
  `).join('');
}

// ---- Main init ----
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const isERP = await ERPNextHelper.detectERPNext(tab);

  if (!isERP) {
    document.getElementById('not-erpnext').style.display = 'block';
    document.getElementById('erpnext-ui').style.display = 'none';
    return;
  }

  setStatus(true, `Connected · ${new URL(tab.url).hostname}`);
  // Show actual branded site name (works for GAWDAH, custom ERPs, etc.)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.frappe?._original_title || window.frappe?.boot?.sitename || null
  }).then(r => {
    const name = r[0]?.result;
    if (name) document.getElementById('statusText').textContent = 'Connected · ' + name;
  }).catch(() => {});

  // Load stats async
  Promise.all([
    ERPNextHelper.fetchERPData(tab.url, 'Sales Order', '[["status","=","To Deliver and Bill"]]', '["name","status"]', 100),
    ERPNextHelper.fetchERPData(tab.url, 'Sales Invoice', '[["docstatus","=","0"]]', '["name","status"]', 100),
    ERPNextHelper.fetchERPData(tab.url, 'Item', '[]', '["name"]', 200),
  ]).then(([orders, invoices, items]) => {
    document.getElementById('stat1').textContent = orders?.data?.length ?? '—';
    document.getElementById('stat2').textContent = invoices?.data?.length ?? '—';
    document.getElementById('stat3').textContent = items?.data?.length ?? '—';
  });

  // Load recent activity
  ERPNextHelper.fetchERPData(tab.url, 'Sales Invoice', '[]', '["name","status","docstatus"]', 4)
    .then(data => renderActivity(data?.data, 'Invoices'));

  // Quick action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const base = ERPNextHelper.getBaseUrl(tab.url);
      const routes = {
        'new-invoice': `${base}/sales-invoice/new-sales-invoice-1`,
        'new-order': `${base}/sales-order/new-sales-order-1`,
        'new-purchase': `${base}/purchase-order/new-purchase-order-1`,
        'chart': null,
        'export': null,
        'export-xlsx': null,
      };

      if (action === 'chart') {
        chrome.tabs.sendMessage(tab.id, { type: 'SHOW_CHART_OVERLAY' });
        window.close();
        return;
      }
      if (action === 'export') {
        chrome.tabs.sendMessage(tab.id, { type: 'EXPORT_CSV' });
        window.close();
        return;
      }
      if (action === 'export-xlsx') {
        chrome.tabs.sendMessage(tab.id, { type: 'EXPORT_XLSX' });
        window.close();
        return;
      }
      if (routes[action]) {
        chrome.tabs.create({ url: routes[action] });
      }
    });
  });

  // Open side panel
  document.getElementById('openSidePanel').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    window.close();
  });
  document.getElementById('openSidePanelFooter').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    window.close();
  });

  // Dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    const base = ERPNextHelper.getBaseUrl(tab.url);
    chrome.tabs.create({ url: `${base}/app` });
  });
}

init();
