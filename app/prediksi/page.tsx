"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import { Calculator, TrendingUp, Activity, CheckCircle2, AlertCircle, Calendar, Table as TableIcon } from "lucide-react";

export default function PredictionPage() {
  const [months, setMonths] = useState(3); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://danielkevin-dmosai-backend.hf.space/api/predict/${months}`);
      setData(res.data);
    } catch (error) {
      console.error("Gagal mengambil prediksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [months]);

  const futureData = data?.data.filter((item: any) => item.actual === null && item.predicted !== null) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-800 bg-slate-50 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-4 border-b border-slate-200">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900">Forecasting Kasus DBD</h1>
           <p className="text-slate-500 mt-1">Prediksi Tren Masa Depan (SARIMA)</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <Calendar size={16}/> Periode Prediksi:
          </span>
          <select 
            value={months} 
            onChange={(e) => setMonths(Number(e.target.value))}
            className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm font-medium cursor-pointer"
          >
            <option value="3">3 Bulan (Jangka Pendek)</option>
            <option value="6">6 Bulan (Semester)</option>
            <option value="12">1 Tahun (Jangka Panjang)</option>
          </select>
        </div>
      </div>

      {loading && !data && (
        <div className="py-20 text-center animate-pulse flex flex-col items-center">
           <Activity className="text-blue-500 animate-spin mb-2" size={32}/>
           <p className="text-slate-400 font-medium">Sedang menghitung model prediksi SARIMA...</p>
        </div>
      )}

      {data && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* --- BAGIAN 1: KARTU METRIK EVALUASI --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* RMSE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18}/></div>
                    <span className="text-xs font-bold uppercase text-slate-500">RMSE</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{data.evaluation.rmse}</h3>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Root Mean Square Error</p>
              </div>

              {/* MAPE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle size={18}/></div>
                    <span className="text-xs font-bold uppercase text-slate-500">MAPE (Akurasi)</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{data.evaluation.mape}%</h3>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">
                    {data.evaluation.mape < 20 ? "Sangat Akurat (<20%)" : "Cukup Akurat"}
                 </p>
              </div>

              {/* MAE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calculator size={18}/></div>
                    <span className="text-xs font-bold uppercase text-slate-500">MAE</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{data.evaluation.mae}</h3>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Mean Absolute Error</p>
              </div>

              {/* R2 Score */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={18}/></div>
                    <span className="text-xs font-bold uppercase text-slate-500">R² Score</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{data.evaluation.r2}</h3>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Kecocokan Model (max 1.0)</p>
              </div>
          </div>

          {/* --- BAGIAN 2: GRAFIK (FULL WIDTH) --- */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><TrendingUp size={20}/></div>
                    <h3 className="font-bold text-lg text-slate-800">Visualisasi Grafik Prediksi</h3>
                </div>
                {/* Legenda Custom Kecil */}
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> Data Aktual</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-1 bg-orange-500 rounded-full border border-orange-500 border-dashed"></div> Hasil Prediksi</div>
                </div>
             </div>
             
             {/* Container Grafik Besar */}
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data.data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12, fill: '#64748b'}} 
                        tickFormatter={(str) => {
                            const date = new Date(str + "-01");
                            return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
                        }}
                        minTickGap={30}
                    />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                    <RechartsTooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        labelFormatter={(label) => {
                           const date = new Date(label + "-01");
                           return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                        }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle"/>
                    
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} name="Data Aktual" />
                    <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{r:3}} activeDot={{r:6}} name="Prediksi Model" />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* --- BAGIAN 3: TABEL DATA (DI BAWAH GRAFIK) --- */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-full"><TableIcon size={20}/></div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Rincian Angka Prediksi</h3>
                    <p className="text-xs text-slate-500">Estimasi jumlah kasus untuk periode {months} bulan ke depan.</p>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                          <th scope="col" className="px-6 py-3 rounded-tl-lg">Bulan & Tahun</th>
                          <th scope="col" className="px-6 py-3">Nilai Prediksi</th>
                          <th scope="col" className="px-6 py-3">Batas Bawah (Min)</th>
                          <th scope="col" className="px-6 py-3 rounded-tr-lg">Batas Atas (Max)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {futureData.length > 0 ? (
                         futureData.map((item: any, index: number) => {
                           const dateObj = new Date(item.date + "-01");
                           const bulanIndo = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                           
                           return (
                             <tr key={index} className="border-b border-slate-100 hover:bg-blue-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {bulanIndo}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-blue-800 px-3 py-1 rounded-full font-bold">
                                        {item.predicted} Kasus
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{item.lower}</td>
                                <td className="px-6 py-4 text-slate-500">{item.upper}</td>
                             </tr>
                           );
                         })
                      ) : (
                         <tr>
                           <td colSpan={4} className="text-center py-8 text-slate-400">Belum ada data prediksi.</td>
                         </tr>
                      )}
                  </tbody>
               </table>
             </div>
             
             <div className="mt-4 text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong>Info Statistik:</strong> Kolom "Batas Bawah" dan "Batas Atas" menunjukkan bahwa jumlah kasus asli nantinya diprediksi akan jatuh di antara rentang angka tersebut.
             </div>
          </div>

        </div>
      )}
    </div>
  );
}