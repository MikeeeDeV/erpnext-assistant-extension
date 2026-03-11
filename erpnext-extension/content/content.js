// ERPNext Assistant - Content Script
// Injects FAB and chart overlay into ERPNext pages

(function() {
  'use strict';

  // Only inject on ERPNext/Frappe pages
  function isERPNext() {
    return !!(window.frappe || document.querySelector('.navbar-brand') ||
      document.title.includes('ERPNext') || document.title.includes('Frappe') ||
      document.querySelector('[data-doctype]'));
  }

  if (!isERPNext()) return;

  // ---- Inject Google Font ----
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap';
  document.head.appendChild(fontLink);

  // ---- Load Chart.js ----
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  document.head.appendChild(chartScript);

  // ---- FAB Button ----
  const fab = document.createElement('button');
  fab.id = 'erp-assistant-fab';
  fab.title = 'ERPNext Assistant';
  fab.innerHTML = `
    <svg viewBox="0 0 56 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.8989 61.6855C21.4635 61.6477 20.6116 61.4727 20.1809 61.3356C17.8428 60.5883 15.9212 58.6303 14.8326 55.8777C13.9807 53.7305 13.7061 50.8076 14.1179 48.2773C14.5675 45.4822 16.0679 41.8263 18.0226 38.7473C18.8982 37.3711 20.0531 35.763 21.2079 34.311C22.3438 32.878 23.6596 31.2463 24.8996 29.7234C26.8733 27.3019 26.8496 27.3303 27.0768 26.933C27.4886 26.2188 27.853 25.1216 28.0518 24.0007C28.0944 23.7689 28.1607 23.471 28.2032 23.3385L28.279 23.1021L28.3973 23.3622C28.7523 24.1568 28.8895 24.8189 28.8848 25.6986C28.8848 26.687 28.7381 27.3208 28.3168 28.2147C27.8861 29.1133 27.517 29.6194 23.7921 34.4293C19.7738 39.6128 18.8272 40.9891 17.8002 43.108C16.243 46.324 15.7413 49.2611 16.3377 51.6022C16.5933 52.6001 17.0571 53.6359 17.573 54.3595C18.5953 55.7878 20.3039 56.5209 22.6325 56.5209C24.5825 56.5256 26.3669 55.8588 28.3358 54.3926C30.5224 52.7657 32.2689 50.6563 33.2344 48.476C33.8402 47.1091 34.3892 45.2268 34.2899 44.8342C34.2473 44.6498 34.181 44.5978 33.9964 44.5978C33.7882 44.6025 33.703 44.6214 32.6712 44.9241C31.5211 45.2599 30.991 45.3545 30.2526 45.3545C29.3344 45.3545 28.8943 45.189 28.402 44.6545C27.8577 44.0681 27.5217 42.9992 27.4744 41.6749C27.4128 40.0669 27.8151 38.7237 28.828 37.1819C29.4622 36.217 30.1106 35.8529 31.204 35.8481C32.1174 35.8481 33.135 36.288 33.9112 37.0258C34.0674 37.1724 34.3419 37.494 34.5265 37.74C35.0377 38.421 35.0661 38.4494 35.2885 38.4494C35.5725 38.4494 36.3771 38.0426 36.68 37.7494C37.1296 37.3096 37.1912 36.7515 36.9356 35.2806C36.467 32.5753 36.2966 30.6362 36.2919 27.9498C36.2872 26.6019 36.3061 26.2236 36.3724 25.7742C36.6658 23.9108 37.5745 22.7805 39.1743 22.2933C39.5813 22.1703 39.6476 22.1609 40.5942 22.1609C42.0235 22.1562 42.4306 22.2366 45.7058 23.173C46.695 23.4568 47.7173 23.7406 47.9776 23.8068C49.0567 24.0763 50.3441 24.2608 51.1818 24.2608C51.5936 24.2608 51.5983 24.2608 51.5747 24.3696C51.5605 24.4263 51.5084 24.8898 51.4564 25.3959C51.2434 27.4249 51.0399 29.3119 51.002 29.5626L50.9783 29.7329L50.3772 29.7612C48.6024 29.8464 47.0547 30.7308 45.5685 32.5091C44.8065 33.4266 44.1344 34.3442 43.2068 35.763C42.3643 37.04 42.1608 37.3663 40.4333 40.1993L40.0735 40.7905L40.0783 41.1452C40.083 41.5378 40.1445 41.8499 40.6036 43.841C40.8308 44.8106 40.916 45.2741 40.9113 45.4916C40.9113 45.6572 40.9018 45.7991 40.8876 45.8085C40.8782 45.818 40.8214 45.8322 40.7598 45.8369C40.6652 45.8511 40.6178 45.7991 40.4759 45.5673C40.296 45.2741 39.3778 43.6897 38.9234 42.8904L38.6679 42.4364L37.7828 43.0512C37.3 43.3917 36.7936 43.7465 36.6611 43.8363C36.5238 43.9309 36.3913 44.0444 36.3629 44.087C36.3345 44.1295 36.3014 44.3282 36.2872 44.5221C36.273 44.7207 36.254 45.0471 36.2398 45.2504C36.0931 47.3645 35.4778 49.7151 34.4555 52.0231C32.7611 55.8493 30.7969 58.3843 28.2222 60.087C26.9159 60.9477 25.6332 61.4538 24.2891 61.6477C23.8347 61.7092 22.429 61.7328 21.8989 61.6855Z" fill="white"/>
      <path d="M1.15902 42.8855C0.993363 42.8288 0.86084 42.772 0.86084 42.7578C0.870306 42.6585 2.86762 41.4903 5.42816 40.0809C7.47281 38.9553 8.82171 38.1513 9.75884 37.4986C10.7007 36.8459 12.6602 35.342 12.7264 35.2237C12.8116 35.0676 12.8021 34.8359 12.6933 34.2731C12.2957 32.2063 11.3822 30.0733 9.7683 27.4058C9.01576 26.1714 8.49986 24.9606 8.23008 23.8114C7.9887 22.7803 7.93664 22.2979 7.94137 20.9973C7.94611 19.9332 7.9603 19.6919 8.0739 18.94C8.53773 15.8941 9.38966 13.3922 10.6013 11.5146C11.2687 10.4788 12.22 9.33429 12.8826 8.77147C13.9002 7.90124 14.7853 7.45666 16.1531 7.1256C17.4405 6.80872 18.8698 6.8371 19.9821 7.19181C20.4743 7.35262 21.2079 7.73098 21.6433 8.06204C23.4845 9.44307 24.8286 12.2902 25.0937 15.3928C25.4108 19.0818 25.3256 21.6358 24.805 24.237C23.6312 30.0969 19.9253 35.4791 14.7995 38.7661C12.3241 40.3552 9.10568 41.6937 5.92512 42.4646C4.49577 42.8099 3.66749 42.9187 2.2334 42.9612C1.52346 42.9849 1.42406 42.9754 1.15902 42.8855Z" fill="rgba(255,255,255,0.8)"/>
    </svg>
  `;
  document.body.appendChild(fab);

  // ---- Extract list data from current ERPNext page ----
  function extractListData() {
    const rows = [];

    // Try frappe list view data
    if (window.frappe?.views?.list_view?.data) {
      return window.frappe.views.list_view.data;
    }

    // Try DOM extraction from list table
    const table = document.querySelector('.list-row-container, .result-list, .frappe-list');
    if (table) {
      const headers = [...document.querySelectorAll('.list-row-head .list-header-subject, .column-title')].map(h => h.textContent.trim()).filter(Boolean);
      const dataRows = [...document.querySelectorAll('.list-row')];
      dataRows.forEach(row => {
        const cells = [...row.querySelectorAll('.list-subject, .list-row-col')].map(c => c.textContent.trim());
        if (cells.length && cells[0]) {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = cells[i] || ''; });
          if (!obj.Name && cells[0]) obj.Name = cells[0];
          rows.push(obj);
        }
      });
    }

    // Fallback: get doctype from URL
    const match = window.location.pathname.match(/\/([^/]+)$/);
    const doctype = match ? match[1].replace(/-/g,' ') : 'Record';

    if (rows.length === 0) {
      // Return page info
      rows.push({ Page: window.location.href, Title: document.title, Doctype: doctype });
    }

    return rows;
  }

  // Detect current doctype
  function getCurrentDoctype() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 1) {
      return parts[parts.length - (parts[parts.length-1].startsWith('new') ? 2 : 1)]
        .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return 'Document';
  }

  // ---- Chart Overlay ----
  let overlayChart = null;

  function showChartOverlay() {
    if (document.getElementById('erp-chart-overlay')) return;

    const data = extractListData();
    const doctype = getCurrentDoctype();

    const overlay = document.createElement('div');
    overlay.id = 'erp-chart-overlay';
    overlay.innerHTML = `
      <div id="erp-chart-modal">
        <div class="modal-header">
          <svg viewBox="0 0 56 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.8989 61.6855C21.4635 61.6477 20.6116 61.4727 20.1809 61.3356C17.8428 60.5883 15.9212 58.6303 14.8326 55.8777C13.9807 53.7305 13.7061 50.8076 14.1179 48.2773C14.5675 45.4822 16.0679 41.8263 18.0226 38.7473C18.8982 37.3711 20.0531 35.763 21.2079 34.311C22.3438 32.878 23.6596 31.2463 24.8996 29.7234C26.8733 27.3019 26.8496 27.3303 27.0768 26.933C27.4886 26.2188 27.853 25.1216 28.0518 24.0007C28.0944 23.7689 28.1607 23.471 28.2032 23.3385L28.279 23.1021L28.3973 23.3622C28.7523 24.1568 28.8895 24.8189 28.8848 25.6986C28.8848 26.687 28.7381 27.3208 28.3168 28.2147C27.8861 29.1133 27.517 29.6194 23.7921 34.4293C19.7738 39.6128 18.8272 40.9891 17.8002 43.108C16.243 46.324 15.7413 49.2611 16.3377 51.6022C16.5933 52.6001 17.0571 53.6359 17.573 54.3595C18.5953 55.7878 20.3039 56.5209 22.6325 56.5209C24.5825 56.5256 26.3669 55.8588 28.3358 54.3926C30.5224 52.7657 32.2689 50.6563 33.2344 48.476C33.8402 47.1091 34.3892 45.2268 34.2899 44.8342C34.2473 44.6498 34.181 44.5978 33.9964 44.5978C33.7882 44.6025 33.703 44.6214 32.6712 44.9241C31.5211 45.2599 30.991 45.3545 30.2526 45.3545C29.3344 45.3545 28.8943 45.189 28.402 44.6545C27.8577 44.0681 27.5217 42.9992 27.4744 41.6749C27.4128 40.0669 27.8151 38.7237 28.828 37.1819C29.4622 36.217 30.1106 35.8529 31.204 35.8481C32.1174 35.8481 33.135 36.288 33.9112 37.0258C34.0674 37.1724 34.3419 37.494 34.5265 37.74C35.0377 38.421 35.0661 38.4494 35.2885 38.4494C35.5725 38.4494 36.3771 38.0426 36.68 37.7494C37.1296 37.3096 37.1912 36.7515 36.9356 35.2806C36.467 32.5753 36.2966 30.6362 36.2919 27.9498C36.2872 26.6019 36.3061 26.2236 36.3724 25.7742C36.6658 23.9108 37.5745 22.7805 39.1743 22.2933C39.5813 22.1703 39.6476 22.1609 40.5942 22.1609C42.0235 22.1562 42.4306 22.2366 45.7058 23.173C46.695 23.4568 47.7173 23.7406 47.9776 23.8068C49.0567 24.0763 50.3441 24.2608 51.1818 24.2608C51.5936 24.2608 51.5983 24.2608 51.5747 24.3696C51.5605 24.4263 51.5084 24.8898 51.4564 25.3959C51.2434 27.4249 51.0399 29.3119 51.002 29.5626L50.9783 29.7329L50.3772 29.7612C48.6024 29.8464 47.0547 30.7308 45.5685 32.5091C44.8065 33.4266 44.1344 34.3442 43.2068 35.763C42.3643 37.04 42.1608 37.3663 40.4333 40.1993L40.0735 40.7905L40.0783 41.1452C40.083 41.5378 40.1445 41.8499 40.6036 43.841C40.8308 44.8106 40.916 45.2741 40.9113 45.4916C40.9113 45.6572 40.9018 45.7991 40.8876 45.8085C40.8782 45.818 40.8214 45.8322 40.7598 45.8369C40.6652 45.8511 40.6178 45.7991 40.4759 45.5673C40.296 45.2741 39.3778 43.6897 38.9234 42.8904L38.6679 42.4364L37.7828 43.0512C37.3 43.3917 36.7936 43.7465 36.6611 43.8363C36.5238 43.9309 36.3913 44.0444 36.3629 44.087C36.3345 44.1295 36.3014 44.3282 36.2872 44.5221C36.273 44.7207 36.254 45.0471 36.2398 45.2504C36.0931 47.3645 35.4778 49.7151 34.4555 52.0231C32.7611 55.8493 30.7969 58.3843 28.2222 60.087C26.9159 60.9477 25.6332 61.4538 24.2891 61.6477C23.8347 61.7092 22.429 61.7328 21.8989 61.6855Z" fill="#36B54A"/>
            <path d="M1.15902 42.8855C0.993363 42.8288 0.86084 42.772 0.86084 42.7578C0.870306 42.6585 2.86762 41.4903 5.42816 40.0809C7.47281 38.9553 8.82171 38.1513 9.75884 37.4986C10.7007 36.8459 12.6602 35.342 12.7264 35.2237C12.8116 35.0676 12.8021 34.8359 12.6933 34.2731C12.2957 32.2063 11.3822 30.0733 9.7683 27.4058C9.01576 26.1714 8.49986 24.9606 8.23008 23.8114C7.9887 22.7803 7.93664 22.2979 7.94137 20.9973C7.94611 19.9332 7.9603 19.6919 8.0739 18.94C8.53773 15.8941 9.38966 13.3922 10.6013 11.5146C11.2687 10.4788 12.22 9.33429 12.8826 8.77147C13.9002 7.90124 14.7853 7.45666 16.1531 7.1256C17.4405 6.80872 18.8698 6.8371 19.9821 7.19181C20.4743 7.35262 21.2079 7.73098 21.6433 8.06204C23.4845 9.44307 24.8286 12.2902 25.0937 15.3928C25.4108 19.0818 25.3256 21.6358 24.805 24.237C23.6312 30.0969 19.9253 35.4791 14.7995 38.7661C12.3241 40.3552 9.10568 41.6937 5.92512 42.4646C4.49577 42.8099 3.66749 42.9187 2.2334 42.9612C1.52346 42.9849 1.42406 42.9754 1.15902 42.8855Z" fill="#36B54A"/>
          </svg>
          <div class="modal-header-info">
            <h2>Chart: ${doctype}</h2>
            <p>${data.length} records extracted from current view</p>
          </div>
          <button id="erp-chart-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="erp-stats-row">
            <div class="erp-stat">
              <div class="val">${data.length}</div>
              <div class="lbl">Records</div>
            </div>
            <div class="erp-stat">
              <div class="val blue">${new Date().toLocaleDateString('en-GB')}</div>
              <div class="lbl">Date</div>
            </div>
            <div class="erp-stat">
              <div class="val" style="font-size:14px;">${doctype.slice(0,12)}</div>
              <div class="lbl">Doctype</div>
            </div>
          </div>
          <div class="erp-controls">
            <select class="erp-select" id="overlayChartType">
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="doughnut">Doughnut</option>
              <option value="pie">Pie Chart</option>
            </select>
            <button class="erp-btn-green" id="overlayRefreshChart">⚡ Refresh</button>
          </div>
          <div class="erp-chart-wrap">
            <canvas id="overlayCanvas"></canvas>
          </div>
          <div class="erp-export-row">
            <button class="erp-btn-outline" id="overlayExportCSV">⬇ CSV</button>
            <button class="erp-btn-blue" id="overlayExportXLSX">📋 XLSX</button>
            <button class="erp-btn-outline" id="overlayExportJSON">{ } JSON</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close
    document.getElementById('erp-chart-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Build initial chart
    buildOverlayChart(data);

    // Refresh
    document.getElementById('overlayRefreshChart').addEventListener('click', () => {
      buildOverlayChart(extractListData());
    });

    // Exports
    document.getElementById('overlayExportCSV').addEventListener('click', () => exportData(data, 'csv', doctype));
    document.getElementById('overlayExportXLSX').addEventListener('click', () => exportData(data, 'xls', doctype));
    document.getElementById('overlayExportJSON').addEventListener('click', () => exportData(data, 'json', doctype));
  }

  function buildOverlayChart(data) {
    const type = document.getElementById('overlayChartType')?.value || 'bar';
    const canvas = document.getElementById('overlayCanvas');
    if (!canvas) return;

    if (overlayChart) overlayChart.destroy();

    let labels, values, colors;

    if (data.length > 0 && typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      const nameKey = keys.find(k => k.toLowerCase().includes('name')) || keys[0];
      const valKey = keys.find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('total') || k.toLowerCase().includes('qty'));

      if (type === 'doughnut' || type === 'pie') {
        // Count by status or first categorical field
        const statusKey = keys.find(k => k.toLowerCase().includes('status')) || keys[Math.min(1, keys.length-1)];
        const counts = {};
        data.forEach(r => {
          const v = r[statusKey] || 'Unknown';
          counts[v] = (counts[v] || 0) + 1;
        });
        labels = Object.keys(counts);
        values = Object.values(counts);
        colors = ['#36B54A','#27ADE1','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
      } else {
        labels = data.slice(0, 15).map(r => String(r[nameKey] || '').slice(0, 15));
        values = data.slice(0, 15).map((r, i) => {
          if (valKey && r[valKey]) return parseFloat(r[valKey]) || (i + 1);
          return i + 1;
        });
        colors = labels.map((_, i) => i % 2 === 0 ? '#36B54A' : '#27ADE1');
      }
    } else {
      labels = ['No Data'];
      values = [1];
      colors = ['#36B54A'];
    }

    overlayChart = new Chart(canvas.getContext('2d'), {
      type,
      data: {
        labels,
        datasets: [{
          label: doctype || 'Data',
          data: values,
          backgroundColor: colors,
          borderColor: type === 'line' ? '#36B54A' : colors,
          borderWidth: type === 'line' ? 2.5 : 1.5,
          borderRadius: type === 'bar' ? 6 : 0,
          tension: 0.4,
          fill: type === 'line' ? { target: 'origin', above: 'rgba(54,181,74,0.08)' } : false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut' || type === 'pie',
            position: 'bottom',
            labels: { font: { family: 'DM Sans', size: 11 }, padding: 12 }
          },
          tooltip: {
            backgroundColor: '#1a2e1c',
            titleFont: { family: 'DM Sans', weight: 'bold' },
            bodyFont: { family: 'DM Mono' },
          }
        },
        scales: type === 'doughnut' || type === 'pie' ? {} : {
          x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 10 } } },
          y: { grid: { color: '#e2ede3' }, ticks: { font: { family: 'DM Mono', size: 10 } } }
        }
      }
    });
  }

  const doctype = getCurrentDoctype();

  function exportData(data, format, name) {
    let content, filename, type;
    if (format === 'csv') {
      const keys = Object.keys(data[0] || { name: '' });
      content = [keys.join(','), ...data.map(r => keys.map(k => `"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
      filename = `${name}_${Date.now()}.csv`;
      type = 'text/csv';
    } else if (format === 'xls') {
      const keys = Object.keys(data[0] || { name: '' });
      content = [keys.join('\t'), ...data.map(r => keys.map(k => String(r[k]??'')).join('\t'))].join('\n');
      filename = `${name}_${Date.now()}.xls`;
      type = 'application/vnd.ms-excel';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `${name}_${Date.now()}.json`;
      type = 'application/json';
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // FAB click
  fab.addEventListener('click', showChartOverlay);

  // Listen for messages from popup/sidepanel
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_CHART_OVERLAY') showChartOverlay();
    if (msg.type === 'EXPORT_CSV') {
      const data = extractListData();
      exportData(data, 'csv', getCurrentDoctype());
    }
    if (msg.type === 'EXPORT_XLSX') {
      const data = extractListData();
      exportData(data, 'xls', getCurrentDoctype());
    }
  });

})();
