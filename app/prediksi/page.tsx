"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
} from "recharts";
import { Sparkles, Calendar, TrendingUp, AlertCircle } from "lucide-react";

export default function PrediksiPage() {
  const [period, setPeriod] = useState(3); // Default 3 bulan
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async (months: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://danielkevin-dmosai-backend.hf.space/api/predict/${months}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      alert("Gagal melakukan prediksi. Pastikan data historis tersedia di backend.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch otomatis saat periode berubah
  useEffect(() => {
    fetchPrediction(period);
  }, [period]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Prediksi Tren DBD
          </h1>
          <p className="text-slate-500 mt-1">Forecasting kasus mendatang menggunakan metode SARIMA</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Calendar size={16}/> Pilih Periode Prediksi
        </h3>
        <div className="flex gap-4">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={`px-6 py-3 rounded-lg font-bold transition-all border-2 
                ${period === m 
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-purple-200" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600"
                }`}
            >
              {m} Bulan ke depan
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHART AREA */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 min-h-[500px]">
        {loading && !data && (
           <div className="h-96 flex flex-col items-center justify-center text-slate-400 animate-pulse">
             <TrendingUp size={48} className="mb-4"/>
             <p>Sedang menghitung prediksi AI...</p>
           </div>
        )}

        {data && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Grafik Hasil Prediksi</h2>
                <p className="text-sm text-slate-500">Data Historis vs Prediksi ({period} Bulan)</p>
              </div>
              <div className="text-right">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                  Model: {data.model}
                </span>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis dataKey="date" tick={{fontSize: 12}} minTickGap={30} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontWeight:'bold', color:'#1e293b'}}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  
                  {/* Area Confidence Interval (Batas Atas/Bawah) */}
                  <Area type="monotone" dataKey="upper" stroke="none" fill="#d8b4fe" fillOpacity={0.2} name="Rentang Keyakinan" />
                  
                  {/* Garis Data Asli */}
                  <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{r:3}} name="Data Aktual" />
                  
                  {/* Garis Prediksi (Putus-putus) */}
                  <Line type="monotone" dataKey="predicted" stroke="#994aeeff" strokeWidth={3} strokeDasharray="5 5" dot={{r:4, fill:'#994aeeff'}} name="Prediksi AI" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* TABEL HASIL PREDIKSI */}
            <div className="mt-8">
              <h3 className="font-bold text-slate-800 mb-4">Rincian Angka Prediksi</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-6 py-3">Bulan</th>
                      <th className="px-6 py-3">Prediksi Kasus</th>
                      <th className="px-6 py-3">Batas Bawah</th>
                      <th className="px-6 py-3">Batas Atas</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.filter((d: any) => d.predicted !== null).map((row: any, i: number) => (
                      <tr key={i} className="bg-white hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-500">{row.date}</td>
                        <td className="px-6 py-3 font-bold text-purple-600 text-lg">{row.predicted}</td>
                        <td className="px-6 py-3 text-slate-500">{row.lower}</td>
                        <td className="px-6 py-3 text-slate-500">{row.upper}</td>
                        <td className="px-6 py-3">
                           {row.predicted > 100 ? (
                             <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={14}/> Waspada</span>
                           ) : (
                             <span className="text-green-600 font-bold">Aman</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}