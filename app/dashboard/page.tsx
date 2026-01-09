"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, LabelList
} from "recharts";
import { Activity, Users, Filter, Skull, HeartPulse, ChevronDown, MapPin, TrendingUp } from "lucide-react";

// --- IMPORT PETA DYNAMIC ---
const MapSemarang = dynamic(() => import("../components/MapSemarang"), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center rounded-xl text-slate-400 animate-pulse">
      <MapPin size={32} className="mb-2 opacity-50"/>
      <p>Memuat Peta Semarang...</p>
    </div>
  )
});

export default function DashboardPage() {
  const [year, setYear] = useState("2025");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // State Parameter K-Means
  const [params, setParams] = useState({ n_clusters: 3 }); 

  // Warna Visualisasi
  const SEVERITY_COLORS: any = {
    "Rendah": "#4ade80",  // Hijau
    "Sedang": "#facc15",  // Kuning
    "Kritis": "#ef4444",  // Merah
    "Level 4": "#7f1d1d",
    "Level 5": "#000000"
  };

  // --- LOGIKA MAPPING LABEL ---
  const mapClustersToLabels = (rawData: any[]) => {
    const groups: any = {};
    rawData.forEach((item: any) => {
      const id = item.cluster;
      if (!groups[id]) groups[id] = [];
      groups[id].push(item);
    });

    const clusterStats = Object.keys(groups).map(key => {
      const items = groups[key];
      const avgCases = items.reduce((sum: number, curr: any) => sum + curr.jml_p, 0) / items.length;
      return { id: key, avg: avgCases };
    });

    clusterStats.sort((a, b) => a.avg - b.avg);

    const labels = ["Rendah", "Sedang", "Kritis", "Level 4", "Level 5"];
    const idToLabel: any = {};

    clusterStats.forEach((stat, index) => {
      const labelName = index < labels.length ? labels[index] : `Level ${index + 1}`;
      idToLabel[stat.id] = labelName;
    });

    return rawData.map((item: any) => ({
      ...item,
      cluster_original: item.cluster,
      cluster: idToLabel[item.cluster] || item.cluster
    }));
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://danielkevin-dmosai-backend.hf.space/api/analyze/${year}?n_clusters=${params.n_clusters}`
      );
      
      const labeledData = mapClustersToLabels(res.data.clustering_result);
      
      setData({
        ...res.data,
        clustering_result: labeledData
      });

    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 404) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, params]); 

  // --- HITUNG METRIK DASHBOARD ---
  const calculateMetrics = () => {
    if (!data) return null;
    
    // Hitung Total Kasus
    const totalPositif = data.clustering_result.reduce((acc: number, curr: any) => acc + curr.jml_p, 0);
    const totalMeninggal = data.clustering_result.reduce((acc: number, curr: any) => acc + curr.jml_m, 0);
    const totalAktif = totalPositif - totalMeninggal;

    // --- HITUNG TOTAL PENDUDUK & IR (INCIDENCE RATE) ---
    // Pastikan field 'jml_penduduk' ada di data backend (sudah kita cek di main.py sebelumnya)
    const totalPenduduk = data.clustering_result.reduce((acc: number, curr: any) => acc + curr.jml_penduduk, 0);
    
    // Rumus IR = (Total Kasus / Total Penduduk) * 100.000
    // Kita gunakan toFixed(1) agar ada 1 desimal (contoh: 45.2)
    const irRate = totalPenduduk > 0 ? ((totalPositif / totalPenduduk) * 100000).toFixed(2) : 0;


    
    // Hitung Sebaran Cluster
    const clusterCounts: any = {};
    data.clustering_result.forEach((item: any) => {
      clusterCounts[item.cluster] = (clusterCounts[item.cluster] || 0) + 1;
    });
    
    const sortOrder = ["Rendah", "Sedang", "Kritis", "Level 4", "Level 5"];
    const pieData = Object.keys(clusterCounts)
      .sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b))
      .map(key => ({ name: key, value: clusterCounts[key] }));
    
    const donutData = [
      { name: "Aktif", value: totalAktif },
      { name: "Meninggal", value: totalMeninggal },
    ];

    return { totalPositif, totalMeninggal, totalAktif, totalPenduduk, irRate, pieData, donutData };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-800 bg-slate-50 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-4 border-b border-slate-200">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Sebaran DBD</h1>
           <p className="text-slate-500 mt-1">Analisis Clustering K-Means & Pemetaan Zonasi Risiko</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          
          {/* Selector Tahun */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tahun Data</label>
            <div className="relative">
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium cursor-pointer transition hover:bg-slate-100"
              >
                <option value="2018">2018</option>
                
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Slider K-Means */}
          <div className="space-y-2 lg:col-span-2">
             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 tracking-wider">
               <label>Tingkat Detail Clustering (K-Means)</label>
               <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">k = {params.n_clusters}</span>
             </div>
             <input 
                type="range" min="2" max="5" step="1" 
                value={params.n_clusters} 
                onChange={(e) => setParams({...params, n_clusters: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase mt-1">
                <span>Sedikit (Umum)</span>
                <span>Banyak (Spesifik)</span>
             </div>
          </div>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="py-20 text-center animate-pulse">
          <Activity className="mx-auto text-slate-300 mb-4 animate-spin" size={40}/>
          <p className="text-slate-400 font-medium">Sedang memuat analisis data cerdas...</p>
        </div>
      )}

      {/* --- DASHBOARD CONTENT --- */}
      {data && metrics ? (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Summary Cards (GRID DIUBAH JADI 4 KOLOM) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Total Kasus */}
             <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center transition hover:shadow-md hover:scale-[1.02]">
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide mb-1">Total Kasus</p>
                  <h4 className="text-3xl font-extrabold text-blue-600">{metrics.totalPositif}</h4>
                </div>
                <div className="p-3 bg-blue-50 rounded-full text-blue-500"><Activity size={24}/></div>
             </div>

             {/* Sembuh/Aktif */}
             <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center transition hover:shadow-md hover:scale-[1.02]">
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide mb-1">Aktif</p>
                  <h4 className="text-3xl font-extrabold text-green-500">{metrics.totalAktif}</h4>
                </div>
                <div className="p-3 bg-green-50 rounded-full text-green-500"><HeartPulse size={24}/></div>
             </div>

             {/* Meninggal */}
             <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center transition hover:shadow-md hover:scale-[1.02]">
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide mb-1">Meninggal</p>
                  <h4 className="text-3xl font-extrabold text-red-500">{metrics.totalMeninggal}</h4>
                </div>
                <div className="p-3 bg-red-50 rounded-full text-red-500"><Skull size={24}/></div>
             </div>

             {/* --- CARD BARU: IR RATE (Angka Kejadian) --- */}
             <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center transition hover:shadow-md hover:scale-[1.02]">
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide mb-1">IR (Incidence Rate)</p>
                  <div className="flex items-baseline gap-1">
                     <h4 className="text-3xl font-extrabold text-indigo-600">{metrics.irRate}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">per 100.000 penduduk</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-500"><TrendingUp size={24}/></div>
             </div>
          </div>

          {/* --- BAGIAN PETA GEOSPASIAL --- */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600"/> Peta Zonasi Risiko
                  </h3>
                  
                  {/* Legenda Peta */}
                  <div className="flex gap-3 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>Rendah</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#facc15]"></div>Sedang</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>Kritis</div>
                  </div>
              </div>

              {/* Komponen Peta */}
              <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
                  {/* UPDATE BAGIAN INI: */}
                  {/* 1. key={year} : Memaksa map refresh total saat ganti tahun */}
                  {/* 2. onAreaClick : Fungsi untuk membuka modal popup */}
                  <MapSemarang 
                      key={year} 
                      dataClustering={data.clustering_result} 
                      onAreaClick={(clickedData) => setSelectedData(clickedData)}
                  />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center italic">
                *Warna wilayah dikelompokkan secara otomatis menggunakan algoritma K-Means.
              </p>
          </div>
          

          {/* Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             
             {/* Pie Chart: Proporsi Wilayah */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users size={18} className="text-blue-500"/> Proporsi Wilayah per Zona
                </h3>
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={metrics.pieData} 
                        cx="50%" cy="50%" 
                        outerRadius={90} 
                        innerRadius={50}
                        dataKey="value" 
                        paddingAngle={3}
                        // PERBAIKAN DI SINI: Tambahkan ': any' agar TypeScript tidak protes
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {metrics.pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || "#94a3b8"} stroke="none"/>
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Line Chart: Tren Bulanan */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <Activity size={18} className="text-blue-500"/> Tren Kasus Bulanan
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.eda_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="bulan" tickFormatter={(v) => v.toUpperCase()} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false}/>
                      <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}/>
                      <Legend />
                      <Line type="monotone" dataKey="positif" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill:'#3b82f6', strokeWidth:0}} activeDot={{r:6}} name="Kasus Positif" />
                      <Line type="monotone" dataKey="meninggal" stroke="#ef4444" strokeWidth={3} dot={{r:4, fill:'#ef4444', strokeWidth:0}} activeDot={{r:6}} name="Meninggal" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
          
          {/* Bar Chart: Top 10 Wilayah */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Filter size={18} className="text-blue-500"/> 10 Kelurahan Kasus Tertinggi
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[...data.clustering_result].sort((a: any, b: any) => b.jml_p - a.jml_p).slice(0, 10)} margin={{left: 20}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
                      <XAxis type="number" hide />
                      <YAxis dataKey="wilayah" type="category" width={140} tick={{fontSize: 12, fill: '#334155'}} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                      <Bar dataKey="jml_p" radius={[0, 4, 4, 0]} barSize={24}>
                         <LabelList dataKey="jml_p" position="right" style={{fill:'#64748b', fontSize:'12px', fontWeight: 'bold'}}/>
                         {
                           [...data.clustering_result]
                             .sort((a: any, b: any) => b.jml_p - a.jml_p)
                             .slice(0, 10)
                             .map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.cluster] || "#3b82f6"} />
                             ))
                         }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
             <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Filter size={40} className="text-slate-400"/>
             </div>
             <h3 className="text-lg font-bold text-slate-700">Data Tidak Ditemukan</h3>
             <p className="text-slate-500 mt-1 max-w-md text-center">
               Data untuk tahun <span className="font-semibold text-slate-900">{year}</span> belum tersedia di server.
             </p>
          </div>
        )
      )}
    </div>
  );
}