from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from pandas.tseries.offsets import DateOffset
import datetime
import os # Tambahan module OS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- FUNGSI BERSIH DATA TETAP SAMA ---
def clean_data(df):
    if 'Unnamed: 0' in df.columns:
        df = df.drop('Unnamed: 0', axis=1)

    new_column_names = [
        'wilayah', 'jml_penduduk',
        'jan_p', 'jan_m', 'feb_p', 'feb_m', 'mar_p', 'mar_m',
        'apr_p', 'apr_m', 'mei_p', 'mei_m', 'jun_p', 'jun_m',
        'jul_p', 'jul_m', 'agt_p', 'agt_m', 'sep_p', 'sep_m',
        'okt_p', 'okt_m', 'nov_p', 'nov_m', 'des_p', 'des_m',
        'jml_p', 'jml_m', 'ir_100000', 'cfr'
    ]
    
    # Logic handling kolom agar tidak error jika format beda dikit
    if len(df.columns) == len(new_column_names):
        df.columns = new_column_names
    else:
        df = df.iloc[:, :len(new_column_names)]
        df.columns = new_column_names

    df = df[df['wilayah'].notna()]
    df = df[df['wilayah'] != 'Jumlah']
    df = df.reset_index(drop=True)
    df = df.fillna(0)
    return df

# --- ENDPOINT BARU (GET METHOD) ---
@app.get("/api/analyze/{year}")
async def analyze_data(year: str, eps: float = 3.0, min_samples: int = 3):
    # 1. Tentukan lokasi file berdasarkan tahun yang dipilih
    file_path = f"api/dataset/rekap_kasus_DBD_{year}.xlsx"
    
    # 2. Cek apakah file ada
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Data untuk tahun {year} tidak ditemukan di server.")

    try:
        # 3. Baca file langsung dari folder (tanpa upload)
        df = pd.read_excel(file_path, skiprows=2)
        df = clean_data(df)
        
        # --- PROSES SAMA SEPERTI SEBELUMNYA ---
        
        # EDA Data
        months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agt', 'sep', 'okt', 'nov', 'des']
        monthly_trend = []
        for m in months:
            monthly_trend.append({
                "bulan": m,
                "positif": int(df[f'{m}_p'].sum()),
                "meninggal": int(df[f'{m}_m'].sum())
            })

        # Clustering
        features_col = [c for c in df.columns if c != 'wilayah']
        X = df[features_col]
        
        # --- PERBAIKAN: LOG TRANSFORM ---
        # Tambahkan baris ini. np.log1p akan mengubah angka 0->0, 10->2.4, 100->4.6
        # Ini membuat jarak data ekstrem menjadi lebih dekat dan masuk akal.
        X_log = np.log1p(X) 
        # --------------------------------
        
        scaler = StandardScaler()
        # Gunakan X_log saat fitting scaler
        X_scaled = scaler.fit_transform(X_log) 
        
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        clusters = dbscan.fit_predict(X_scaled)
        
        # PCA
        pca = PCA(n_components=2)
        pca_components = pca.fit_transform(X_scaled)
        
        results = []
        for i in range(len(df)):
            cluster_label = int(clusters[i])
            # Logic label (opsional, sesuaikan dengan logic backend terakhirmu)
            status = 'Noise (Outlier)' if cluster_label == -1 else f'Cluster {cluster_label}'
            
            results.append({
                "wilayah": df.iloc[i]['wilayah'],
                "jml_p": int(df.iloc[i]['jml_p']),
                "jml_m": int(df.iloc[i]['jml_m']),
                
                # --- TAMBAHAN DATA UNTUK DETAIL ---
                "jml_penduduk": int(df.iloc[i]['jml_penduduk']), 
                "ir": float(df.iloc[i]['ir_100000']), 
                # ----------------------------------
                
                "cluster": status,
                "pc1": float(pca_components[i, 0]),
                "pc2": float(pca_components[i, 1])
            })

        return {
            "year": year,
            "eda_trend": monthly_trend,
            "clustering_result": results,
            "total_clusters": len(set(clusters)) - (1 if -1 in clusters else 0)
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
def get_historical_series():
    # List tahun yang tersedia di dataset
    years = ['2023', '2024', '2025']
    months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agt', 'sep', 'okt', 'nov', 'des']
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'mei': 5, 'jun': 6,
        'jul': 7, 'agt': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'des': 12
    }
    
    series_data = []
    
    for y in years:
        file_path = f"api/dataset/rekap_kasus_DBD_{y}.xlsx"
        if os.path.exists(file_path):
            df = pd.read_excel(file_path, skiprows=2)
            df = clean_data(df)
            
            # Agregasi total kasus per bulan
            for m in months:
                col_p = f'{m}_p'
                if col_p in df.columns:
                    total_cases = df[col_p].sum()
                    # Buat tanggal: misal 2023-01-01
                    date_str = f"{y}-{month_map[m]}-01"
                    series_data.append({
                        "date": pd.to_datetime(date_str),
                        "value": int(total_cases)
                    })
    
    # Buat DataFrame Time Series
    df_ts = pd.DataFrame(series_data)
    df_ts = df_ts.set_index('date')
    df_ts = df_ts.sort_index()
    return df_ts

# --- ENDPOINT PREDIKSI ---
@app.get("/api/predict/{months}")
async def predict_sarima(months: int):
    try:
        # 1. Ambil Data Historis
        df_ts = get_historical_series()
        
        if df_ts.empty:
             raise HTTPException(status_code=404, detail="Data historis tidak ditemukan.")

        # 2. Setup Model SARIMA
        # Order=(1,1,1) dan Seasonal=(1,1,1,12) adalah parameter standar untuk data bulanan
        # Dalam implementasi Fuzzy SARIMA asli, parameter ini di-tuning menggunakan logika fuzzy.
        model = SARIMAX(df_ts['value'], 
                        order=(1, 1, 1), 
                        seasonal_order=(1, 1, 1, 12),
                        enforce_stationarity=False,
                        enforce_invertibility=False)
        
        model_fit = model.fit(disp=False)
        
        # 3. Lakukan Forecasting
        forecast_result = model_fit.get_forecast(steps=months)
        forecast_values = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int() # Interval kepercayaan (batas atas/bawah)

        # 4. Format Output untuk Frontend
        history = []
        for date, row in df_ts.iterrows():
            history.append({
                "date": date.strftime("%Y-%m"), # Format: 2023-01
                "actual": int(row['value']),
                "predicted": None,
                "lower": None,
                "upper": None
            })
            
        future = []
        for date, val in forecast_values.items():
            # Cari batas atas/bawah untuk tanggal ini
            lower = conf_int.loc[date].iloc[0]
            upper = conf_int.loc[date].iloc[1]
            
            future.append({
                "date": date.strftime("%Y-%m"),
                "actual": None,
                "predicted": int(val) if val > 0 else 0, # Cegah prediksi negatif
                "lower": int(lower) if lower > 0 else 0,
                "upper": int(upper)
            })
            
        # Gabungkan data: History dulu, baru Future
        combined_data = history + future
        
        return {
            "period": months,
            "data": combined_data,
            "model": "SARIMA (Seasonal ARIMA)",
            "last_date": history[-1]['date']
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))