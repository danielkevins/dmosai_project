"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? "text-blue-600 font-bold bg-blue-50" : "text-slate-500 hover:text-blue-600";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold text-slate-700 tracking-tight">D-<span className="text-blue-600">MOSAI</span></span>
        </Link>

        {/* Menu - Tambahkan Link Data disini */}
        <div className="flex items-center gap-2">
          <Link href="/" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive("/")}`}>
            Beranda
          </Link>
          <Link href="/dashboard" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive("/dashboard")}`}>
            Dashboard
          </Link>
          <Link href="/data" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive("/data")}`}>
            Data Kasus
          </Link>
          <Link href="/prediksi" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive("/prediksi")}`}>
            Prediksi
          </Link>
        </div>
      </div>
    </nav>
  );
}