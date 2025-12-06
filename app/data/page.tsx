"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, MapPin, Activity, TrendingUp, BarChart3, FileText, X, Users, AlertTriangle 
} from "lucide-react";

export default function DataPage() {
  const [year, setYear] = useState("2023");
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // STATE UNTUK MODAL DETAIL
  const [selectedData, setSelectedData] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Semua");

  const RISK_COLORS: any = {
    "Rendah": { bg: "bg-green-100", text: "text-green-700", label: "Rendah" },
    "Sedang": { bg: "bg-yellow-100", text: "text-yellow-700", label: "Sedang" },
    "Kritis": { bg: "bg-red-100", text: "text-red-700", label: "Tinggi" },
    "Noise": { bg: "bg-slate-100", text: "text-slate-600", label: "Unclassified" }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/analyze/${year}?eps=3.0&min_samples=3`
      );
      const labeledData = mapClustersToLabels(res.data.clustering_result);
      setRawData(labeledData);
      setFilteredData(labeledData);
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        setRawData([]); setFilteredData([]);
        alert(`Data tahun ${year} belum tersedia.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const mapClustersToLabels = (data: any[]) => {
    const validData = data.filter((d: any) => !d.cluster.includes("Noise"));
    const noiseData = data.filter((d: any) => d.cluster.includes("Noise"));

    const groups: any = {};
    validData.forEach((item: any) => {
      if (!groups[item.cluster]) groups[item.cluster] = [];
      groups[item.cluster].push(item);
    });

    const clusterStats = Object.keys(groups).map(key => {
      const items = groups[key];
      const avg = items.reduce((sum: number, curr: any) => sum + curr.jml_p, 0) / items.length;
      return { id: key, avg };
    });

    clusterStats.sort((a, b) => a.avg - b.avg);
    const labels = ["Rendah", "Sedang", "Kritis"];
    const idToLabel: any = {};

    clusterStats.forEach((stat, index) => {
      idToLabel[stat.id] = index < labels.length ? labels[index] : "Kritis";
    });

    const processed = [
      ...validData.map((item: any) => ({ ...item, risk: idToLabel[item.cluster] })),
      ...noiseData.map((item: any) => ({ ...item, risk: "Noise" }))
    ];
    return processed;
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  useEffect(() => {
    let result = rawData;
    if (searchTerm) {
      result = result.filter(item => 
        item.wilayah.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (riskFilter !== "Semua") {
      const logicFilter = riskFilter === "Tinggi" ? "Kritis" : riskFilter;
      result = result.filter(item => item.risk === logicFilter);
    }
    setFilteredData(result);
  }, [searchTerm, riskFilter, rawData]);

  const totalKelurahan = rawData.length;
  const totalKasus = rawData.reduce((acc, curr) => acc + curr.jml_p, 0);
  const totalAktif = rawData.reduce((acc, curr) => acc + (curr.jml_p - curr.jml_m), 0);
  const totalMeninggal = rawData.reduce((acc, curr) => acc + curr.jml_m, 0);
  const avgCFR = totalKasus > 0 ? ((totalMeninggal / totalKasus) * 100).toFixed(2) : "0";

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50 space-y-8 relative">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Data Kasus DBD
        </h1>
        <p className="text-slate-500 mt-1">Akses dan analisis data kasus DBD di Kota Semarang secara terperinci</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard label="Total Kelurahan" value={totalKelurahan} icon={<MapPin className="text-blue-600"/>} />
        <SummaryCard label="Total Kasus" value={totalKasus} icon={<Activity className="text-red-500"/>} />
        <SummaryCard label="Kasus Aktif" value={totalAktif} icon={<TrendingUp className="text-orange-500"/>} />
        <SummaryCard label="Rata-rata CFR" value={`${avgCFR}%`} icon={<BarChart3 className="text-green-600"/>} />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Cari kelurahan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 placeholder:text-slate-500 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <select 
            value={riskFilter} 
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="Semua">Semua Risiko</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
          </select>

          <button 
            onClick={() => {setSearchTerm(""); setRiskFilter("Semua");}}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap"
          >
            <X size={16} /> Clear Filter
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4">Kelurahan</th>
                <th className="px-6 py-4">Total Kasus</th>
                <th className="px-6 py-4 text-orange-700">Kasus Aktif</th>
                <th className="px-6 py-4 text-red-700">Meninggal</th>
                <th className="px-6 py-4">CFR (%)</th>
                <th className="px-6 py-4">Tingkat Risiko</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={7} className="text-center py-10 text-slate-500">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-10 text-slate-500">Data tidak ditemukan.</td></tr>
              ) : (
                filteredData.sort((a,b) => b.jml_p - a.jml_p).map((row, i) => {
                  const style = RISK_COLORS[row.risk] || RISK_COLORS["Noise"];
                  const aktif = row.jml_p - row.jml_m;
                  const cfr = row.jml_p > 0 ? ((row.jml_m / row.jml_p) * 100).toFixed(2) : "0.00";

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400"/> {row.wilayah}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{row.jml_p}</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">{aktif}</td>
                      <td className="px-6 py-4 text-red-600 font-bold">{row.jml_m}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{cfr}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* TOMBOL DETAIL DI SINI */}
                        <button 
                          onClick={() => setSelectedData(row)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded transition-all flex items-center gap-1 ml-auto"
                        >
                          <FileText size={12}/> Detail
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- KOMPONEN POP-UP MODAL --- */}
      {selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <MapPin className="text-blue-600" /> Detail Data {selectedData.wilayah}
               </h2>
               <button onClick={() => setSelectedData(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
                 <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
              
              {/* KOTAK 1: Informasi Lokasi */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <MapPin size={16}/> Informasi Lokasi
                 </h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                       <span className="text-slate-500">Kelurahan:</span>
                       <span className="font-semibold text-slate-900">{selectedData.wilayah}</span>
                    </div>
                    
                 </div>
              </div>

              {/* KOTAK 2: Statistik Kesehatan */}
              <div className="bg-red-50/50 p-5 rounded-xl shadow-sm border border-red-100">
                 <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Activity size={16}/> Statistik Kesehatan
                 </h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                       <span className="text-slate-600">Total Kasus:</span>
                       <span className="font-bold text-slate-900 text-lg">{selectedData.jml_p}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-600">Kasus Aktif:</span>
                       <span className="font-bold text-orange-600 text-lg">{selectedData.jml_p - selectedData.jml_m}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-600">Meninggal:</span>
                       <span className="font-bold text-red-600 text-lg">{selectedData.jml_m}</span>
                    </div>
                    <div className="h-px bg-red-200 my-2"></div>
                    <div className="flex justify-between">
                       <span className="text-slate-600">CFR (Fatality Rate):</span>
                       <span className="font-bold text-slate-900">{((selectedData.jml_m / selectedData.jml_p) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-600">IR per 100.000:</span>
                       <span className="font-bold text-slate-900">{selectedData.ir ? selectedData.ir.toFixed(2) : "-"}</span>
                    </div>
                 </div>
              </div>

              {/* KOTAK 3: Demografi */}
              <div className="bg-blue-50/50 p-5 rounded-xl shadow-sm border border-blue-100">
                 <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Users size={16}/> Demografi
                 </h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-dashed border-blue-200 pb-2">
                       <span className="text-slate-500">Populasi:</span>
                       <span className="font-semibold text-slate-900">
                         {selectedData.jml_penduduk ? selectedData.jml_penduduk.toLocaleString('id-ID') : "Tidak tersedia"} Jiwa
                       </span>
                    </div>
                    <div className="flex justify-between pt-1">
                       <span className="text-slate-500">Tahun Data:</span>
                       <span className="font-semibold text-slate-900">{year}</span>
                    </div>
                 </div>
              </div>

              {/* KOTAK 4: Tingkat Risiko */}
              <div className="bg-yellow-50/50 p-5 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-between">
                 <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                   <AlertTriangle size={16}/> Tingkat Risiko
                 </h3>
                 
                 <div className="flex flex-col items-center justify-center py-4">
                    <span className={`px-6 py-2 rounded-full text-lg font-bold shadow-sm mb-3 
                      ${RISK_COLORS[selectedData.risk] ? RISK_COLORS[selectedData.risk].bg : 'bg-slate-200'}
                      ${RISK_COLORS[selectedData.risk] ? RISK_COLORS[selectedData.risk].text : 'text-slate-600'}
                    `}>
                      {selectedData.risk}
                    </span>
                    <p className="text-xs text-center text-slate-500">
                      Berdasarkan Incidence Rate dan Case Fatality Rate wilayah ini.
                    </p>
                 </div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
               <button 
                 onClick={() => setSelectedData(null)}
                 className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg transition-all"
               >
                 Tutup
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
        {icon}
      </div>
    </div>
  );
}