// ============================================================
// ENTRY POINT — memuat file JSON lalu menjalankan aplikasi
// ============================================================
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Gagal memuat ${path} (HTTP ${res.status})`);
  return res.json();
}

function showLoadError(err) {
  console.error(err);
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.85);padding:24px';
  box.innerHTML = `
    <div style="background:#fff;max-width:520px;border-radius:12px;padding:24px;font-family:sans-serif;font-size:14px;line-height:1.5">
      <h2 style="margin:0 0 8px;font-size:18px;color:#b91c1c">Data JSON gagal dimuat</h2>
      <p style="margin:0 0 8px">${err.message}</p>
      <p style="margin:0">File JSON tidak bisa dibaca bila <b>index.html</b> dibuka langsung (alamat <code>file://</code>).
      Jalankan lewat server lokal, misalnya ekstensi <b>Live Server</b> di VS Code
      (klik kanan <code>index.html</code> &rarr; <i>Open with Live Server</i>).</p>
    </div>`;
  document.body.appendChild(box);
}

async function initApp() {
  try {
    const [config, wilayah, history] = await Promise.all([
      loadJSON('data/config.json'),
      loadJSON('data/wilayah.json'),
      loadJSON('data/history.json')
    ]);

    APP_CONFIG = config;
    currentData = wilayah.data;
    historySessions = history;
    currentWeights = { ...config.defaultWeights };

    // Samakan slider dengan bobot default dari config.json
    document.getElementById('slider-w1').value = Math.round(currentWeights.C1 * 100);
    document.getElementById('slider-w2').value = Math.round(currentWeights.C2 * 100);
    document.getElementById('slider-w3').value = Math.round(currentWeights.C3 * 100);

    onWeightSliderChange(); // memperbarui label bobot + menjalankan runSAW()
  } catch (err) {
    showLoadError(err);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
