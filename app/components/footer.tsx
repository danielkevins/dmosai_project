import { Activity, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Github, Cpu, Network, Database, Code2 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* KOLOM 1: IDENTITAS BRAND */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-none">D-<span className="text-blue-500">MOSAI</span></h3>
                <p className="text-[10px] text-slate-400 font-medium">Dengue Monitoring System with Artificial Intelligence</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Sistem monitoring, klasterisasi dan prediksi persebaran Demam Berdarah Dengue (DBD) berbasis 
              Machine Learning untuk Kota Semarang.
            </p>
            
            <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">Dikembangkan oleh:</p>
                <p className="text-sm font-semibold text-white">Kelompok 4 SIC (UDINUS)</p>
            </div>

            <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">Sumber Data:</p>
                <p className="text-sm font-semibold text-white">Tunggal Dara</p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Github size={18} />} />
            </div>
          </div>

          {/* KOLOM 2: KONTAK & ALAMAT */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white mb-2">Kontak & Alamat</h4>
            
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Universitas Dian Nuswantoro (UDINUS)<br/>
                  Jl. Nakula I No. 5-11, Semarang<br/>
                  Jawa Tengah, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>(024) 3517261</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span className="hover:text-blue-400 cursor-pointer">sekretariat@dinus.ac.id</span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-slate-800">
               <p className="flex items-center gap-2 text-red-400 font-bold">
                 <Phone size={16} /> Hotline DBD 24/7: 119
               </p>
            </div>
          </div>

          {/* KOLOM 3: TAUTAN CEPAT */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white mb-2">Tautan Cepat</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-blue-500 transition-colors">Beranda Utama</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard Analisis</Link></li>
              <li><Link href="/prediksi" className="hover:text-blue-500 transition-colors">Prediksi Kasus DBD</Link></li>
            </ul>
          </div>

          {/* KOLOM 4: TEKNOLOGI (POWERED BY) */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white mb-2">Powered by AI/ML</h4>
            <p className="text-xs text-slate-500 mb-4">
              Dibangun menggunakan teknologi pemrosesan data modern:
            </p>
            
            <ul className="space-y-3 text-sm">
              <TechItem icon={<Network size={16} />} text="K-Means Clustering" />
              <TechItem icon={<Code2 size={16} />} text="SARIMA" />
            </ul>
          </div>

        </div>

        {/* COPYRIGHT BAR */}
        <div className="border-t border-slate-800 pt-8 mt-8 text-center md:text-right text-xs text-slate-500">
          <p>&copy; 2026 Universitas Dian Nuswantoro (UDINUS). All rights reserved.</p>
          <p className="mt-1">D-MOSAI: Dengue Monitoring System with Artificial Intelligence.</p>
        </div>
      </div>
    </footer>
  );
}

// Komponen Kecil untuk Icon Social Media
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
      {icon}
    </div>
  );
}

// Komponen Kecil untuk List Teknologi
function TechItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 group">
      <div className="text-emerald-500 group-hover:text-emerald-400">{icon}</div>
      <span className="group-hover:text-white transition-colors">{text}</span>
    </li>
  );
}