// ============================================================
// IMPOR / EKSPOR CSV & RIWAYAT SESI
// ============================================================

// Export to CSV Function
function exportCSVResults() {
  let csv = "Peringkat,Kode_Wilayah,Nama_Wilayah,Kemiskinan_Pct,TPT_Pct,IPM_Score,Skor_SAW_Vi,Kategori_Prioritas\n";
  calculatedResults.forEach(item => {
    csv += `${item.rank},"${item.code}","${item.name}",${item.poverty.toFixed(2)},${item.tpt.toFixed(2)},${item.ipm.toFixed(2)},${item.score.toFixed(4)},"${item.category}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "peringkat_prioritas_kemiskinan_jabar_2024.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadSampleValidCSV() {
  let content = "region_code,region_name,poverty_pct,tpt_pct,ipm_score\n";
  currentData.forEach(d => {
    content += `${d.code},"${d.name}",${d.poverty.toFixed(2)},${d.tpt.toFixed(2)},${d.ipm.toFixed(2)}\n`;
  });
  triggerDownload("dataset_uji_bps_jabar_2024.csv", content);
}

function downloadSampleWithProvCSV() {
  let content = "region_code,region_name,poverty_pct,tpt_pct,ipm_score\n";
  content += '3200,"Provinsi Jawa Barat",7.80,7.40,73.50\n';
  currentData.forEach(d => {
    content += `${d.code},"${d.name}",${d.poverty.toFixed(2)},${d.tpt.toFixed(2)},${d.ipm.toFixed(2)}\n`;
  });
  triggerDownload("dataset_uji_dengan_baris_provinsi.csv", content);
}

function downloadSampleErrorCSV() {
  const content = `region_code,region_name,poverty_pct,tpt_pct,ipm_score
3201,"Kabupaten Bogor",7.23,7.99,72.18
3201,"Kabupaten Bogor",7.23,7.99,72.18
3202,"Kabupaten Sukabumi",,7.34,68.65
3203,"Kabupaten Cianjur",10.36,N/A,67.24
3204,"Kabupaten Bandung",6.43,6.52,0.00
`;
  triggerDownload("dataset_uji_error_validasi.csv", content);
}

function downloadCSVTemplate() {
  const template = "region_code,region_name,poverty_pct,tpt_pct,ipm_score\n3201,Kabupaten Bogor,7.23,7.99,72.18\n3202,Kabupaten Sukabumi,7.41,7.34,68.65\n";
  triggerDownload("template_impor_jabar.csv", template);
}

function saveCurrentCalculationToHistory() {
  const newId = historySessions.length + 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  historySessions.unshift({
    id: newId,
    time: now,
    dataset: "BPS Jawa Barat 2024",
    weights: `C1: ${(currentWeights.C1*100).toFixed(0)}%, C2: ${(currentWeights.C2*100).toFixed(0)}%, C3: ${(currentWeights.C3*100).toFixed(0)}%`,
    count: currentData.length,
    notes: "Sesi Perhitungan Disimpan Pengguna"
  });
  renderHistoryTable();
  alert("Sesi perhitungan berhasil disimpan ke riwayat audit!");
}

// CSV File Upload & Parsing Handler (PRD Rule 3.1 & TC-01 to TC-09 compliant)
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      alert("Berkas CSV kosong atau tidak memiliki baris data.");
      return;
    }

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    const colIdx = {
      code: headers.findIndex(h => h.includes('code') || h.includes('kode')),
      name: headers.findIndex(h => h.includes('name') || h.includes('nama') || h.includes('wilayah') || h.includes('kabupaten')),
      poverty: headers.findIndex(h => h.includes('poverty') || h.includes('miskin') || h.includes('kemiskinan') || h.includes('c1')),
      tpt: headers.findIndex(h => h.includes('tpt') || h.includes('pengangguran') || h.includes('c2')),
      ipm: headers.findIndex(h => h.includes('ipm') || h.includes('hdi') || h.includes('c3'))
    };

    if (colIdx.name === -1 || colIdx.poverty === -1 || colIdx.tpt === -1 || colIdx.ipm === -1) {
      alert("Gagal Impor: Kolom wajib tidak lengkap. Pastikan ada nama wilayah, kemiskinan, tpt, dan ipm.");
      return;
    }

    const newParsed = [];
    let provFiltered = false;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rName = cols[colIdx.name] || '';
      if (rName.toLowerCase().includes('provinsi') || rName.toLowerCase() === 'jawa barat') {
        provFiltered = true;
        continue; // Aturan PRD 3.1: eksklusi baris agregat provinsi
      }

      const pov = parseFloat((cols[colIdx.poverty] || '').replace(',', '.'));
      const tpt = parseFloat((cols[colIdx.tpt] || '').replace(',', '.'));
      const ipm = parseFloat((cols[colIdx.ipm] || '').replace(',', '.'));

      if (rName && !isNaN(pov) && !isNaN(tpt) && !isNaN(ipm)) {
        newParsed.push({
          code: colIdx.code !== -1 ? cols[colIdx.code] : (3200 + i).toString(),
          name: rName,
          type: rName.toLowerCase().includes('kota') ? 'Kota' : 'Kabupaten',
          poverty: pov,
          tpt: tpt,
          ipm: ipm
        });
      }
    }

    if (newParsed.length > 0) {
      currentData = newParsed;
      runSAW();
      let msg = `Berhasil mengimpor ${newParsed.length} wilayah!`;
      if (provFiltered) msg += " (Baris agregat Provinsi Jawa Barat otomatis difilter sesuai PRD 3.1).";
      alert(msg);
      switchPage('regions');
    } else {
      alert("Tidak ada baris data valid yang berhasil dibaca.");
    }
  };
  reader.readAsText(file);
}

