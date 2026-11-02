// ============================================================
// STATE GLOBAL — diisi dari file JSON di folder /data oleh app.js
// ============================================================
let APP_CONFIG = null;      // data/config.json
let currentData = [];       // data/wilayah.json  (27 Kab/Kota)
let currentWeights = { C1: 0.40, C2: 0.30, C3: 0.30 };
let calculatedResults = [];
let historySessions = [];   // data/history.json
