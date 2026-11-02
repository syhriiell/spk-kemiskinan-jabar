# SPK Prioritas Kemiskinan Jawa Barat

Struktur proyek:

```
index.html          -> kerangka halaman (HTML saja)
css/style.css       -> gaya kustom
data/
  wilayah.json      -> data 27 Kab/Kota (BPS Jabar 2024)
  config.json       -> bobot default, preset, kategori peringkat, judul halaman
  history.json      -> riwayat sesi awal
js/
  state.js          -> variabel global
  saw.js            -> logika perhitungan SAW
  render.js         -> render tabel
  ui.js             -> navigasi, slider bobot, filter, modal
  csv.js            -> impor/ekspor CSV, simpan riwayat
  app.js            -> memuat JSON & memulai aplikasi
```

## Cara menjalankan
File JSON dimuat lewat `fetch`, jadi **tidak bisa** dibuka dengan double-click.
Di VS Code: install ekstensi **Live Server**, klik kanan `index.html` -> *Open with Live Server*.
(Alternatif: `python -m http.server` lalu buka http://localhost:8000)
