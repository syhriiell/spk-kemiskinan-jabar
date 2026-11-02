// ============================================================
// RENDER TAMPILAN (tabel dashboard, master data, matriks, hasil, riwayat)
// ============================================================

function renderAllComponents(maxC1, maxC2, minC3) {
  renderDashboardTop();
  renderMasterRegionTable();
  renderCalculationMatrix();
  renderResultsTable();
  renderHistoryTable();
}

function renderDashboardTop() {
  const top1 = calculatedResults[0];
  if (top1) {
    document.getElementById('kpi-top-name').textContent = top1.name;
    document.getElementById('kpi-top-score').textContent = `Skor Preferensi: ${top1.score.toFixed(4)}`;
  }

  const tbody = document.getElementById('dashboard-top5-body');
  tbody.innerHTML = calculatedResults.slice(0, 5).map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-3 text-center font-bold text-red-600">#${item.rank}</td>
      <td class="py-3 px-3 font-semibold text-[#1E293B]">${item.name}</td>
      <td class="py-3 px-3 text-center font-mono">${item.poverty.toFixed(2)}%</td>
      <td class="py-3 px-3 text-center font-mono">${item.tpt.toFixed(2)}%</td>
      <td class="py-3 px-3 text-center font-mono">${item.ipm.toFixed(2)}</td>
      <td class="py-3 px-3 text-right font-bold text-[#245B83] font-mono">${item.score.toFixed(4)}</td>
      <td class="py-3 px-3 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
          Sangat Tinggi
        </span>
      </td>
    </tr>
  `).join('');
}

function renderMasterRegionTable() {
  const tbody = document.getElementById('master-region-table-body');
  tbody.innerHTML = currentData.map((d, idx) => `
    <tr class="hover:bg-slate-50 transition" data-type="${d.type}" data-name="${d.name.toLowerCase()}">
      <td class="py-3 px-3 text-center text-[#64748B]">${idx + 1}</td>
      <td class="py-3 px-3 font-mono text-[#64748B]">${d.code}</td>
      <td class="py-3 px-3 font-semibold text-[#1E293B]">${d.name}</td>
      <td class="py-3 px-3 text-center">
        <span class="px-2 py-0.5 rounded text-[11px] font-medium ${d.type === 'Kota' ? 'bg-blue-50 text-[#245B83]' : 'bg-slate-100 text-slate-700'}">
          ${d.type}
        </span>
      </td>
      <td class="py-3 px-3 text-center font-mono font-medium">${d.poverty.toFixed(2)}%</td>
      <td class="py-3 px-3 text-center font-mono font-medium">${d.tpt.toFixed(2)}%</td>
      <td class="py-3 px-3 text-center font-mono font-medium">${d.ipm.toFixed(2)}</td>
      <td class="py-3 px-3 text-center">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#159B78] border border-emerald-200">
          ✓ Lolos Audit
        </span>
      </td>
    </tr>
  `).join('');
}


function renderCalculationMatrix() {
  const tbody = document.getElementById('calc-matrix-body');
  tbody.innerHTML = calculatedResults.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-3 font-medium text-[#1E293B]">${item.name}</td>
      <td class="py-3 px-3 text-center font-mono text-[11px]">
        ${item.poverty.toFixed(2)} &rarr; <span class="font-bold text-[#159B78]">${item.r1.toFixed(4)}</span>
      </td>
      <td class="py-3 px-3 text-center font-mono text-[11px]">
        ${item.tpt.toFixed(2)} &rarr; <span class="font-bold text-[#159B78]">${item.r2.toFixed(4)}</span>
      </td>
      <td class="py-3 px-3 text-center font-mono text-[11px]">
        ${item.ipm.toFixed(2)} &rarr; <span class="font-bold text-amber-600">${item.r3.toFixed(4)}</span>
      </td>
      <td class="py-3 px-3 text-center font-mono text-[11px] text-[#64748B]">
        (${currentWeights.C1.toFixed(2)}×${item.r1.toFixed(2)})+(${currentWeights.C2.toFixed(2)}×${item.r2.toFixed(2)})+(${currentWeights.C3.toFixed(2)}×${item.r3.toFixed(2)})
      </td>
      <td class="py-3 px-3 text-right font-bold text-[#245B83] font-mono">${item.score.toFixed(4)}</td>
      <td class="py-3 px-3 text-center">
        <button onclick="openModalDetail('${item.name}')" class="text-[#245B83] hover:text-[#159B78] hover:underline text-[11px] font-semibold">
          Rincian
        </button>
      </td>
    </tr>
  `).join('');
}

function renderResultsTable() {
  const tbody = document.getElementById('results-table-body');
  tbody.innerHTML = calculatedResults.map(item => {
    let badgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';
    let rankClass = 'bg-slate-100 text-slate-700 font-bold';

    if (item.level === 0) {
      rankClass = 'bg-red-600 text-white font-extrabold shadow-xs';
      badgeClass = 'bg-red-50 text-red-700 font-semibold border border-red-200';
    } else if (item.level === 1) {
      badgeClass = 'bg-amber-50 text-amber-700 font-semibold border border-amber-200';
    } else if (item.level === 2) {
      badgeClass = 'bg-blue-50 text-[#245B83] font-semibold border border-blue-200';
    }

    const barWidth = (item.score * 100).toFixed(1);

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-3 text-center">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${rankClass}">
            ${item.rank}
          </span>
        </td>
        <td class="py-3 px-3 font-bold text-[#1E293B]">${item.name}</td>
        <td class="py-3 px-3 text-center font-mono">${item.poverty.toFixed(2)}%</td>
        <td class="py-3 px-3 text-center font-mono">${item.tpt.toFixed(2)}%</td>
        <td class="py-3 px-3 text-center font-mono">${item.ipm.toFixed(2)}</td>
        <td class="py-3 px-3">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-[#245B83] to-[#159B78] h-2 rounded-full" style="width: ${barWidth}%"></div>
          </div>
        </td>
        <td class="py-3 px-3 text-right font-bold text-[#172B4D] font-mono">${item.score.toFixed(4)}</td>
        <td class="py-3 px-3 text-center">
          <span class="px-2.5 py-0.5 rounded text-[11px] ${badgeClass}">
            ${item.category}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = historySessions.map(h => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-3 text-center font-mono text-[#64748B]">#${h.id}</td>
      <td class="py-3 px-3 text-[#1E293B]">${h.time}</td>
      <td class="py-3 px-3 font-semibold text-[#172B4D]">${h.dataset}</td>
      <td class="py-3 px-3 text-center font-mono text-[#245B83] font-medium">${h.weights}</td>
      <td class="py-3 px-3 text-center">${h.count} Kab/Kota</td>
      <td class="py-3 px-3 text-[#64748B]">${h.notes}</td>
    </tr>
  `).join('');
}

