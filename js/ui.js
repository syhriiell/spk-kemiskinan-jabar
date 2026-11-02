// ============================================================
// INTERAKSI UI: navigasi, bobot, filter, modal
// ============================================================

// Navigation Switcher (judul halaman dibaca dari data/config.json)
function switchPage(pageId) {
  const pages = Object.keys(APP_CONFIG.pages);

  pages.forEach(p => {
    const pageEl = document.getElementById('page-' + p);
    const navEl = document.getElementById('nav-' + p);
    if (p === pageId) {
      pageEl.classList.remove('hidden');
      navEl.classList.add('nav-item-active');
    } else {
      pageEl.classList.add('hidden');
      navEl.classList.remove('nav-item-active');
    }
  });

  const meta = APP_CONFIG.pages[pageId];
  document.getElementById('page-title').textContent = meta ? meta.title : "SPK Kemiskinan Jawa Barat";
  document.getElementById('breadcrumb-current').textContent = meta ? meta.breadcrumb : "Halaman";

  // Close mobile sidebar if open
  const sb = document.getElementById('sidebar');
  if (!sb.classList.contains('-translate-x-full')) {
    sb.classList.add('-translate-x-full');
  }
}

function toggleMobileSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('-translate-x-full');
}

// Weight Slider Change Handler
function onWeightSliderChange() {
  const w1 = parseInt(document.getElementById('slider-w1').value) / 100;
  const w2 = parseInt(document.getElementById('slider-w2').value) / 100;
  const w3 = parseInt(document.getElementById('slider-w3').value) / 100;

  currentWeights.C1 = w1;
  currentWeights.C2 = w2;
  currentWeights.C3 = w3;

  document.getElementById('val-w1').textContent = `${w1.toFixed(2)} (${(w1 * 100).toFixed(0)}%)`;
  document.getElementById('val-w2').textContent = `${w2.toFixed(2)} (${(w2 * 100).toFixed(0)}%)`;
  document.getElementById('val-w3').textContent = `${w3.toFixed(2)} (${(w3 * 100).toFixed(0)}%)`;

  const sum = (w1 + w2 + w3).toFixed(2);
  const indicator = document.getElementById('weight-sum-indicator');
  const topbarBadge = document.getElementById('topbar-weight-badge');
  const sidebarStatus = document.getElementById('sidebar-weight-status');

  if (Math.abs(sum - 1.0) < 0.001) {
    indicator.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
    indicator.textContent = "Total Bobot: 1.00 (Valid 100%)";
    topbarBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-[#159B78] border border-emerald-200";
    topbarBadge.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Total Bobot: 1.00 (100%)`;
    sidebarStatus.className = "text-[#159B78] font-bold";
    sidebarStatus.textContent = "100% (Valid)";
  } else {
    indicator.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-300";
    indicator.textContent = `Total Bobot: ${sum} (Harus 1.00)`;
    topbarBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200";
    topbarBadge.innerHTML = `⚠️ Total Bobot: ${sum} (Belum 100%)`;
    sidebarStatus.className = "text-red-400 font-bold";
    sidebarStatus.textContent = `${sum} (Perlu 100%)`;
  }

  runSAW();
}

function applyPreset(presetType) {
  const p = APP_CONFIG.presets[presetType];
  if (!p) return;
  currentWeights = { C1: p.C1, C2: p.C2, C3: p.C3 };
  document.getElementById('slider-w1').value = Math.round(p.C1 * 100);
  document.getElementById('slider-w2').value = Math.round(p.C2 * 100);
  document.getElementById('slider-w3').value = Math.round(p.C3 * 100);
  onWeightSliderChange();
}

function filterMasterRegionTable() {
  const q = document.getElementById('search-master-region').value.toLowerCase();
  const typeFilter = document.getElementById('filter-region-type').value;
  const rows = document.querySelectorAll('#master-region-table-body tr');

  rows.forEach(r => {
    const rowType = r.getAttribute('data-type');
    const rowName = r.getAttribute('data-name');
    const matchesType = (typeFilter === 'ALL' || rowType === typeFilter);
    const matchesQuery = rowName.includes(q);

    r.style.display = (matchesType && matchesQuery) ? '' : 'none';
  });
}

function filterResultsTable() {
  const q = document.getElementById('search-region').value.toLowerCase();
  const rows = document.querySelectorAll('#results-table-body tr');
  rows.forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

function recalculateAndGoToResults() {
  runSAW();
  switchPage('results');
}

function loadSampleDataset() {
  alert("Dataset Resmi BPS Provinsi Jawa Barat 2024 berhasil dimuat.");
  switchPage('regions');
}

// Modal Details Popup
function openModalDetail(regionName) {
  const item = calculatedResults.find(d => d.name === regionName);
  if (!item) return;

  const maxC1 = Math.max(...currentData.map(d => d.poverty));
  const maxC2 = Math.max(...currentData.map(d => d.tpt));
  const minC3 = Math.min(...currentData.map(d => d.ipm));

  document.getElementById('modal-region-title').textContent = `Langkah Perhitungan SAW: ${item.name}`;
  document.getElementById('modal-region-content').innerHTML = `
    <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div class="font-bold text-[#172B4D] mb-1">1. Nilai Mentah Indikator (xᵢ):</div>
      <ul class="list-disc list-inside text-[#64748B] space-y-0.5">
        <li>Persentase Kemiskinan: <strong>${item.poverty.toFixed(2)}%</strong></li>
        <li>Tingkat Pengangguran Terbuka (TPT): <strong>${item.tpt.toFixed(2)}%</strong></li>
        <li>Indeks Pembangunan Manusia (IPM): <strong>${item.ipm.toFixed(2)}</strong></li>
      </ul>
    </div>
    <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
      <div class="font-bold text-[#245B83] mb-1">2. Langkah Normalisasi Matriks (rᵢⱼ):</div>
      <ul class="space-y-1 text-[#245B83] font-mono text-[11px]">
        <li>r₁ (Kemiskinan - Benefit) = ${item.poverty.toFixed(2)} / ${maxC1.toFixed(2)} = <strong>${item.r1.toFixed(4)}</strong></li>
        <li>r₂ (TPT - Benefit) = ${item.tpt.toFixed(2)} / ${maxC2.toFixed(2)} = <strong>${item.r2.toFixed(4)}</strong></li>
        <li>r₃ (IPM - Cost) = ${minC3.toFixed(2)} / ${item.ipm.toFixed(2)} = <strong>${item.r3.toFixed(4)}</strong></li>
      </ul>
    </div>
    <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
      <div class="font-bold text-[#159B78] mb-1">3. Nilai Preferensi Terbobot (Vᵢ = Σ wⱼ × rᵢⱼ):</div>
      <p class="font-mono text-emerald-900 text-[11px]">
        Vᵢ = (${currentWeights.C1.toFixed(2)} × ${item.r1.toFixed(4)}) + (${currentWeights.C2.toFixed(2)} × ${item.r2.toFixed(4)}) + (${currentWeights.C3.toFixed(2)} × ${item.r3.toFixed(4)})
      </p>
      <div class="mt-2 text-sm font-bold text-[#159B78]">
        Total Skor Vᵢ = ${item.score.toFixed(4)} (Peringkat #${item.rank})
      </div>
    </div>
  `;
  document.getElementById('modal-detail').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-detail').classList.add('hidden');
}

