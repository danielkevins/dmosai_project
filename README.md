# 🦟 D-MOSAI: Dashboard Monitoring & Forecasting DBD Kota Semarang

![Project Status](https://img.shields.io/badge/Status-Active-green?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Python-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

> **Sistem Cerdas Pemetaan Zonasi Risiko & Prediksi Kasus Demam Berdarah Dengue (DBD) Berbasis Machine Learning.**

Live Demo: https://dmosai.vercel.app/

---

## 📖 Tentang Proyek

**D-MOSAI** adalah platform dashboard interaktif yang dikembangkan untuk membantu pemantauan dan pengendalian kasus DBD di Kota Semarang. Aplikasi ini menggabungkan analisis geospasial dengan algoritma *Machine Learning* untuk memberikan wawasan yang mendalam mengenai penyebaran wabah.

Sistem ini memiliki dua fitur kecerdasan utama:
1.  **Clustering Wilayah (K-Means):** Mengelompokkan kelurahan berdasarkan tingkat kerawanan (Rendah, Sedang, Tinggi/Kritis) secara otomatis.
2.  **Forecasting Kasus (SARIMA):** Memprediksi jumlah kasus di masa depan untuk peringatan dini.

Proyek ini dibuat sebagai bagian dari penelitian Skripsi/Tesis untuk mendukung pengambilan keputusan berbasis data (*Data-Driven Decision Making*).

---

## 🌟 Fitur Unggulan

### 1. 🗺️ Peta Zonasi Risiko (Geospatial Clustering)
Visualisasi peta interaktif Kota Semarang yang terintegrasi dengan algoritma **K-Means Clustering**.
- Warna wilayah berubah otomatis sesuai tingkat risiko.
- Filter berdasarkan tahun dan jumlah cluster (k).
- **Metrik:** Kasus Positif, Meninggal, dan *Incidence Rate (IR)*.

### 2. 📈 Prediksi Tren Masa Depan (SARIMA Forecasting)
Menggunakan model **Seasonal ARIMA (SARIMA)** untuk memprediksi angka kasus DBD bulanan.
- Menangani pola musiman (seasonality) dan tren.
- Fitur evaluasi model otomatis (**MAPE, RMSE, MAE**).
- Grafik interaktif membandingkan data aktual vs prediksi.

### 3. 📊 Dashboard Statistik & Demografi
- Perhitungan otomatis **Incidence Rate (IR)** per 100.000 penduduk.
- Perhitungan **Case Fatality Rate (CFR)**.
- Grafik tren bulanan dan proporsi wilayah.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Client-Side)
| Tech | Deskripsi |
| :--- | :--- |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) | Framework React utama untuk UI & Routing. |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Styling CSS utility-first yang responsif. |
| ![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat) | Library visualisasi grafik (Line, Bar, Pie Chart). |
| ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white) | Peta interaktif (OpenStreetMap). |

### Backend (Server-Side)
| Tech | Deskripsi |
| :--- | :--- |
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) | API Server Python performa tinggi. |
| ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas&logoColor=white) | Manipulasi dan cleaning data Excel. |
| ![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-F7931E?style=flat&logo=scikit-learn&logoColor=white) | Implementasi algoritma K-Means Clustering. |
| ![Statsmodels](https://img.shields.io/badge/Statsmodels-3F4F75?style=flat) | Implementasi algoritma SARIMA untuk Time Series. |

---

## 🚀 Cara Menjalankan (Localhost)

Ikuti langkah ini untuk menjalankan proyek di komputer lokal Anda.

### Prasyarat
- Node.js (v18+)
- Python (v3.9+)

### 1. Setup Backend (Python/FastAPI)
```bash
# Masuk ke folder root
cd d-mosai

# Install dependencies
pip install -r requirements.txt

# Jalankan server backend (Port 8000)
uvicorn main:app --reload
