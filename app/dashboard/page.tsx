"use client";
import { useState, useEffect } from "react"; // Tambah useEffect
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, LabelList
} from "recharts";
import { Activity, Users, Filter, AlertCircle, Skull, HeartPulse, ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const [year, setYear] = useState("2023");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ eps: 3.0, min_samples:3 });

  const SEVERITY_COLORS: any = {
    "Rendah": "#4ade80",
    "Sedang": "#facc15",
    "Kritis": "#ef4444",
    "Noise": "#94a3b8"
  };

  // --- LOGIKA MAPPING LABEL ---
  const mapClustersToLabels = (rawData: any[]) => {
    const validData = rawData.filter((d: any) => !d.cluster.includes("Noise"));
    const noiseData = rawData.filter((d: any) => d.cluster.includes("Noise"));

    const groups: any = {};
    validData.forEach((item: any) => {
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

    const labels = ["Rendah", "Sedang", "Kritis"];
    const idToLabel: any = {};

    clusterStats.forEach((stat, index) => {
      const labelName = index < labels.length ? labels[index] : "Kritis";
      idToLabel[stat.id] = labelName;
    });

    const mappedValid = validData.map((item: any) => ({
      ...item,
      cluster_original: item.cluster,
      cluster: idToLabel[item.cluster]
    }));

    const mappedNoise = noiseData.map((item: any) => ({
      ...item,
      cluster: "Noise"
    }));

    return [...mappedValid, ...mappedNoise];
  };

  // --- FUNGSI FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    // Kita tidak men-set data null agar transisi lebih mulus saat geser slider/ganti tahun
    try {
      const res = await axios.get(
        `https://danielkevin-dmosai-backend.hf.space/analyze/${year}?eps=${params.eps}&min_samples=${params.min_samples}`
      );
      
      const labeledData = mapClustersToLabels(res.data.clustering_result);
      
      setData({
        ...res.data,
        clustering_result: labeledData
      });

    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        // Jika data tahun tsb tidak ada, kosongkan data
        setData(null);
        // Opsi: Alert bisa dihapus jika dirasa mengganggu saat auto-load
        // alert(`Data tahun ${year} belum tersedia.`); 
      }
    } finally {
      setLoading(false);
    }
  };

  // --- AUTOMATIC TRIGGER (USE EFFECT) ---
  // Kode ini akan jalan otomatis saat:
  // 1. Halaman pertama kali dibuka
  // 2. Tahun (year) berubah
  // 3. Parameter (params) berubah (geser slider langsung update)
  useEffect(() => {
    fetchData();
  }, [year, params]); 

  // --- HITUNG METRIK ---
  const calculateMetrics = () => {
    if (!data) return null;
    
    const totalPositif = data.clustering_result.reduce((acc: number, curr: any) => acc + curr.jml_p, 0);
    const totalMeninggal = data.clustering_result.reduce((acc: number, curr: any) => acc + curr.jml_m, 0);
    const totalAktif = totalPositif - totalMeninggal;

    const clusterCounts: any = {};
    data.clustering_result.forEach((item: any) => {
      clusterCounts[item.cluster] = (clusterCounts[item.cluster] || 0) + 1;
    });
    
    const sortOrder = ["Rendah", "Sedang", "Kritis", "Noise"];
    const pieData = Object.keys(clusterCounts)
      .sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b))
      .map(key => ({ name: key, value: clusterCounts[key] }));
    
    const donutData = [
      { name: "Sembuh/Aktif", value: totalAktif },
      { name: "Meninggal", value: totalMeninggal },
    ];

    return { totalPositif, totalMeninggal, totalAktif, pieData, donutData };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Dashboard Analisis DBD</h1>
           <p className="text-slate-500 mt-1">Status Zonasi: Rendah, Sedang, Kritis</p>
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          
          {/* 1. DROPDOWN TAHUN (Permintaan Baru) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Pilih Tahun Data</label>
            <div className="relative">
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium cursor-pointer"
              >
                <option value="2023">Tahun 2023</option>
                <option value="2024">Tahun 2024</option>
                <option value="2025">Tahun 2025</option>
              </select>
              {/* Icon Panah Custom agar lebih cantik */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* 2. SLIDER PARAMETER (Auto Update) */}
          <div className="space-y-2 lg:col-span-2">
             <div className="flex justify-between text-sm font-semibold text-slate-700">
               <label>Sensitivitas Clustering (Epsilon)</label>
               <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Nilai: {params.eps}</span>
             </div>
             <input 
                type="range" min="0.1" max="5.0" step="0.1" 
                value={params.eps} 
                onChange={(e) => setParams({...params, eps: parseFloat(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Lebih Detail (Banyak Cluster)</span>
                <span>Lebih Umum (Sedikit Cluster)</span>
             </div>
          </div>
          
          {/* Tombol dihapus karena sudah auto-update */}
      </div>

      {/* LOADING STATE */}
      {loading && !data && (
        <div className="py-20 text-center animate-pulse">
          <p className="text-slate-400 font-medium">Sedang memuat data analisis...</p>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      {data && metrics ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 rounded-xl bg-blue-50 border border-blue-100 shadow-sm flex justify-between items-center transition-transform hover:scale-105">
                <div><p className="text-blue-600 font-semibold text-sm uppercase">Total Positif</p><h4 className="text-4xl font-bold mt-1">{metrics.totalPositif}</h4></div>
                <div className="p-3 bg-blue-200 rounded-full text-blue-600"><Activity size={24}/></div>
             </div>
             <div className="p-6 rounded-xl bg-green-50 border border-green-100 shadow-sm flex justify-between items-center transition-transform hover:scale-105">
                <div><p className="text-green-600 font-semibold text-sm uppercase">Sembuh / Aktif</p><h4 className="text-4xl font-bold mt-1">{metrics.totalAktif}</h4></div>
                <div className="p-3 bg-green-200 rounded-full text-green-600"><HeartPulse size={24}/></div>
             </div>
             <div className="p-6 rounded-xl bg-red-50 border border-red-100 shadow-sm flex justify-between items-center transition-transform hover:scale-105">
                <div><p className="text-red-600 font-semibold text-sm uppercase">Meninggal</p><h4 className="text-4xl font-bold mt-1">{metrics.totalMeninggal}</h4></div>
                <div className="p-3 bg-red-200 rounded-full text-red-600"><Skull size={24}/></div>
             </div>
          </div>

          {/* Graphs Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Pie Chart */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-blue-500"/> Sebaran Zonasi Wilayah
                </h3>
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" 
                           label={({ name, value }) => `${name}: ${value}`}>
                        {metrics.pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Donut Chart */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <HeartPulse size={18} className="text-red-500"/> Rasio Fatalitas (CFR)
                </h3>
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.donutData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                         <Cell fill="#4ade80" /> <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom"/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-[-10px] text-sm text-slate-500">
                    CFR Rate: {metrics.totalPositif > 0 ? ((metrics.totalMeninggal / metrics.totalPositif) * 100).toFixed(2) : 0}%
                </div>
             </div>
          </div>
          
          {/* Top 10 & Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-4">🦟 10 Wilayah Tertinggi</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[...data.clustering_result].sort((a: any, b: any) => b.jml_p - a.jml_p).slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="wilayah" type="category" width={100} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Bar dataKey="jml_p" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                         <LabelList dataKey="jml_p" position="right" style={{fill:'#64748b', fontSize:'12px'}}/>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 mb-4">📈 Tren Bulanan</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.eda_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                      <XAxis dataKey="bulan" hide/>
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positif" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} name="Positif" />
                      <Line type="monotone" dataKey="meninggal" stroke="#ef4444" strokeWidth={3} dot={{r:3}} name="Meninggal" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Scatter Plot */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="font-bold text-lg text-slate-800">Peta Clustering (PCA)</h3>
                  <div className="flex gap-2 text-xs font-semibold">
                      <span className="px-3 py-1 bg-green-400 text-white rounded-full shadow-sm">Rendah</span>
                      <span className="px-3 py-1 bg-yellow-400 text-white rounded-full shadow-sm">Sedang</span>
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full shadow-sm">Kritis</span>
                  </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="pc1" tick={false} axisLine={false} name="PC1" />
                    <YAxis type="number" dataKey="pc2" tick={false} axisLine={false} name="PC2" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                       content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border shadow-lg rounded-lg z-50">
                              <p className="font-bold text-slate-800">{d.wilayah}</p>
                              <p className="text-sm font-bold" style={{color: SEVERITY_COLORS[d.cluster]}}>{d.cluster}</p>
                              <p className="text-xs text-slate-500 mt-1">Positif: {d.jml_p}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Wilayah" data={data.clustering_result}>
                      {data.clustering_result.map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.cluster]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>
      ) : (
        // State kosong jika backend tidak ada data / error
        !loading && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
             <Filter size={48} className="mx-auto mb-4 text-slate-300"/>
             <p className="text-slate-500">Data untuk tahun {year} tidak ditemukan.</p>
          </div>
        )
      )}
    </div>
  );
}