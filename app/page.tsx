import Link from "next/link";
import { ShieldCheck, BarChart3, Map, ArrowRight, ArrowBigRight, ArrowUpRight, ArrowUpCircle, ArrowUpDown, ArrowUpFromDot, ArrowUpRightSquare, ClockArrowUpIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex pt-7 flex-col items-center justify-center min-h-[90vh] bg-gradient-to-b from-blue-50 to-white px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Sistem Informasi Cerdas 2026
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Dashboard Sebaran Kasus DBD <span className="text-blue-600">Kota Semarang</span>
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed">
          Pantau penyebaran Demam Berdarah Dengue (DBD) di Semarang menggunakan algoritma 
          <strong> K-Means Clustering</strong>. Kelompokkan wilayah menjadi zona Ringan, Sedang, hingga Kritis secara otomatis.
        </p>

        <div className="pt-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-blue-200 transition-all hover:scale-105">
            Mulai Analisis Data <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl w-full">
        <FeatureCard 
          icon={<Map className="text-blue-500" size={32} />}
          title="Pemetaan Wilayah"
          desc="Mengelompokkan kelurahan berdasarkan pola penyebaran kasus positif dan mortalitas."
        />
        <FeatureCard 
          icon={<BarChart3 className="text-purple-500" size={32} />}
          title="Analisis Visual"
          desc="Visualisasi data interaktif dengan grafik tren bulanan dan peta persebaran kasus."
        />
        <FeatureCard 
          icon={<ClockArrowUpIcon className="text-green-500" size={32} />}
          title="Prediksi Kasus"
          desc="Melakukan prediksi kasus DBD dengan periode 3/6/12 bulan kedepan."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-slate-50 w-fit p-3 rounded-xl">{icon}</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}