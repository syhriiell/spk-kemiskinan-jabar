// ============================================================
// MESIN PERHITUNGAN SAW (Simple Additive Weighting)
// C1 = Kemiskinan (benefit), C2 = TPT (benefit), C3 = IPM (cost)
// ============================================================

// Menentukan kategori prioritas dari peringkat, berdasarkan data/config.json
function getKategori(rank) {
  const list = APP_CONFIG.kategori;
  for (let i = 0; i < list.length; i++) {
    if (list[i].maxRank === null || rank <= list[i].maxRank) {
      return { label: list[i].label, level: i };
    }
  }
  const last = list.length - 1;
  return { label: list[last].label, level: last };
}

// Fungsi murni (tanpa DOM): hitung normalisasi, skor, dan peringkat
function calculateSAW(data, weights) {
  const maxC1Item = data.reduce((a, b) => (b.poverty > a.poverty ? b : a));
  const maxC2Item = data.reduce((a, b) => (b.tpt > a.tpt ? b : a));
  const minC3Item = data.reduce((a, b) => (b.ipm < a.ipm ? b : a));

  const maxC1 = maxC1Item.poverty;
  const maxC2 = maxC2Item.tpt;
  const minC3 = minC3Item.ipm;

  const results = data.map(d => {
    // Normalisasi
    const r1 = d.poverty / maxC1;
    const r2 = d.tpt / maxC2;
    const r3 = minC3 / d.ipm;

    // Pembobotan
    const score = (weights.C1 * r1) + (weights.C2 * r2) + (weights.C3 * r3);

    return {
      code: d.code, name: d.name, type: d.type,
      poverty: d.poverty, tpt: d.tpt, ipm: d.ipm,
      r1, r2, r3, score
    };
  });

  // Sorting menurun (tie-breaking pada C1 Kemiskinan)
  results.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.00001) return b.score - a.score;
    return b.poverty - a.poverty;
  });

  results.forEach((item, index) => {
    item.rank = index + 1;
    const k = getKategori(item.rank);
    item.category = k.label;
    item.level = k.level;
  });

  return { results, maxC1, maxC2, minC3, maxC1Item, maxC2Item, minC3Item };
}

// Menjalankan SAW lalu memperbarui tampilan
function runSAW() {
  const out = calculateSAW(currentData, currentWeights);
  calculatedResults = out.results;

  document.getElementById('calc-max-c1').textContent = `${out.maxC1.toFixed(2)}% (${out.maxC1Item.name})`;
  document.getElementById('calc-max-c2').textContent = `${out.maxC2.toFixed(2)}% (${out.maxC2Item.name})`;
  document.getElementById('calc-min-c3').textContent = `${out.minC3.toFixed(2)} (${out.minC3Item.name})`;

  renderAllComponents(out.maxC1, out.maxC2, out.minC3);
}
