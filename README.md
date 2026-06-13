<div align="center">

<img src="brand/segmenta-logomark-512.png" alt="Segmenta" width="96" height="96" />

# 🛍️ Segmenta

### Customer Segmentation Playground

**Simulasi belanja interaktif yang menjalankan pipeline segmentasi pelanggan secara real-time** — pilih produk, checkout, dan lihat pelanggan dipetakan ke salah satu segmen C1–C6 menggunakan RFM + PCA + K-Means.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📌 Tentang Proyek

**Segmenta** adalah front-end demo dari **Tugas Proyek Mata Kuliah Machine Learning — Kelompok 5** (Semester Genap 2024/2025). Aplikasi ini adalah deployment/inference praktis dari pipeline notebook `3_Preliminary_Result_Kelompok5.ipynb`.

Proyek ini me-reimplementasi paper:

> **"Customer segmentation in the digital marketing using a Q-learning based differential evolution algorithm integrated with K-means clustering"**
> Guanqun Wang, *PLoS ONE* 20(2): e0318519, 2025 — [DOI: 10.1371/journal.pone.0318519](https://doi.org/10.1371/journal.pone.0318519)

📦 Repositori riset & notebook: [spirinity/machine-learning-kelompok-5](https://github.com/spirinity/machine-learning-kelompok-5)
💻 Repositori aplikasi (web): [spirinity/ml-online-shop-implementation](https://github.com/spirinity/ml-online-shop-implementation)

---

## 👥 Anggota Kelompok 5

| # | Nama | NIM |
|---|------|-----|
| 1 | Aisyah Wilda Fauziah Amanda | 11231005 |
| 2 | Galuh Juliviana Romanita | 11231027 |
| 3 | Mahardika Arka | 11231037 |
| 4 | Muhammad Shadiq Al-Fatiy | 11231065 |
| 5 | Olivia Dafina | 11231077 |

---

## ✨ Fitur

- 🛒 **Simulasi belanja end-to-end** — katalog produk, cart, dan checkout yang langsung memicu prediksi segmen.
- 🔎 **Katalog dengan pencarian, filter harga, dan sorting** (harga / popularitas).
- 🧠 **Segmentasi real-time** — hasil C1–C6 lengkap dengan profil, strategi marketing, dan fitur paling menonjol.
- 👤 **Dua sumber customer** — skenario simulasi atau import histori customer nyata dari dataset.
- 📊 **Halaman edukasi** — penjelasan keenam cluster dan pipeline metodologi (PCA → K-Means → Decision Tree).
- 🎨 **UI modern** — desain content-first, animasi halus ala Apple, dark-mode ready, dan aksesibel.

---

## 🧪 Pipeline ML

```text
Data transaksi  →  Feature Engineering RFM (Var1–Var11)  →  Z-Score  →  PCA (11 → 6)  →  K-Means (K=6)  →  Segmen C1–C6
                                                                                              │
                                                                            Decision Tree (validasi, akurasi 98,73%)
```

| Metrik | Nilai |
|--------|-------|
| Variansi dipertahankan PCA | 92,43% |
| Akurasi validasi Decision Tree | 98,73% |
| Jumlah segmen | 6 (C1–C6) |
| Fitur RFM | Var1–Var11 |

> Nilai metrik di atas berasal dari notebook riset pada dataset UCI Online Retail penuh. Aplikasi ini menghitung ulang metrik secara dinamis saat `build_artifacts.py` dijalankan — jika unduhan UCI gagal dan dipakai synthetic dataset, angkanya bisa berbeda. Metrik aktual selalu tampil di halaman **Methodology**.

---

## 🏗️ Arsitektur

```text
Next.js frontend (:3000)  ──▶  FastAPI backend (:8000)  ──▶  Python ML artifacts (joblib)
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- Python 3.12+
- Node.js 20+

### 1. Backend (FastAPI)

```bash
pip install -r requirements_api.txt
python build_artifacts.py
uvicorn api:app --port 8000
```

> `build_artifacts.py` mencoba memakai UCI Online Retail. Jika unduhan gagal, script membuat synthetic retail dataset deterministik agar demo lokal tetap berjalan.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Buka **http://localhost:3000**.

### 🪟 Windows (shortcut)

```bat
:: keduanya sekaligus
scripts\run_all.bat

:: atau terpisah
scripts\run_backend.bat
scripts\run_frontend.bat
```

---

## 🧰 Skrip Frontend

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Mode pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit + property-based tests) |

---

## 🔌 API

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/health` | Status backend & ketersediaan artifacts |
| `GET` | `/api/model-info` | Ringkasan model (dataset, jumlah customer/produk, variansi PCA) |
| `GET` | `/api/validation` | Metrik validasi Decision Tree (akurasi, confusion matrix, feature importance) |
| `GET` | `/api/clusters` | Profil keenam cluster (C1–C6) + strategi marketing |
| `GET` | `/api/products` | Daftar / pencarian produk (`q`, `limit`) |
| `GET` | `/api/customers` | Pencarian customer dataset (`q`, `limit`) |
| `POST` | `/api/session/new` | Buat sesi customer baru |
| `POST` | `/api/session/reset` | Reset sesi customer |
| `POST` | `/api/session/existing` | Import histori customer dataset ke sesi |
| `GET` | `/api/session/{customer_id}/segment` | Ambil hasil segmentasi customer aktif |
| `POST` | `/api/checkout` | Checkout + prediksi segmen |

Setiap halaman terhubung ke endpoint-nya: **Catalog** → `/api/products`, **Cart** → `/api/customers` + `/api/checkout`, **Segment** → `/api/session/{id}/segment`, **Clusters** → `/api/clusters`, **Methodology** → `/api/model-info` + `/api/validation`.

`POST /api/checkout` menerima `transaction_date` (`YYYY-MM-DD`) dan `transaction_type` (`purchase` atau `cancel`). Cancel hanya bisa dicatat setelah customer memiliki minimal satu pembelian valid, dan akan menambah fitur `Var10` (Cancel Frequency).

> ℹ️ Histori customer disimpan **in-memory** di backend, jadi akan hilang ketika server FastAPI di-restart.

---

## �️ Struktur Repositori

```text
ml-online-shop-implementation/
├── api.py                     # FastAPI backend (endpoint segmentasi & sesi)
├── segmentation.py            # Pipeline ML: cleaning, RFM, PCA, K-Means, Decision Tree
├── build_artifacts.py         # Generate model & product artifacts (joblib/csv)
├── requirements_api.txt       # Dependency backend (FastAPI + ML stack)
├── requirements_app.txt       # Dependency ML
├── data/demo/                 # Artifacts hasil build (model bundle, products, dll)
├── scripts/                   # Skrip .bat untuk menjalankan di Windows
├── brand/                     # Aset logo Segmenta (SVG + PNG)
└── frontend/                  # Aplikasi Next.js
    └── src/
        ├── app/               # Halaman: catalog, cart, segment, clusters, methodology
        ├── components/        # AppFrame, Logo, AboutModal, PageHeader, UI primitives
        └── lib/               # API client & metadata proyek
```

## �📚 Referensi

1. Wang, G. (2025). *Customer segmentation in the digital marketing using a Q-learning based differential evolution algorithm integrated with K-means clustering.* PLoS ONE 20(2): e0318519. [DOI](https://doi.org/10.1371/journal.pone.0318519)
2. Dataset: UCI Online Retail via Zenodo — [DOI: 10.5281/zenodo.14614253](https://zenodo.org/records/14614253)

---

<div align="center">
<sub>Dibuat untuk keperluan akademik — Tugas Proyek Machine Learning, Kelompok 5, Semester Genap 2024/2025.</sub>
</div>
