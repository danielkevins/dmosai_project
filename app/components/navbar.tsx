"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X } from "lucide-react"; // Tambahkan icon Menu & X

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // State untuk menu mobile

  // Fungsi untuk mengecek link aktif (bisa dipakai desktop & mobile)
  const isActive = (path: string) =>
    pathname === path
      ? "text-blue-600 font-bold bg-blue-50"
      : "text-slate-500 hover:text-blue-600 hover:bg-slate-50";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold text-slate-700 tracking-tight">
            D-<span className="text-blue-600">MOSAI</span>
          </span>
        </Link>

        {/* --- DESKTOP MENU (Hidden di Mobile, Flex di Desktop) --- */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink href="/" active={isActive("/")}>Beranda</NavLink>
          <NavLink href="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
          <NavLink href="/data" active={isActive("/data")}>Data Kasus</NavLink>
          <NavLink href="/prediksi" active={isActive("/prediksi")}>Prediksi</NavLink>
        </div>

        {/* --- MOBILE MENU BUTTON (Visible di Mobile, Hidden di Desktop) --- */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-100 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {/* Tampilkan hanya jika isOpen = true */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 shadow-lg absolute w-full top-16 left-0 px-4 py-4 flex flex-col space-y-2 animate-fade-in-down">
          <MobileLink href="/" active={isActive("/")} onClick={() => setIsOpen(false)}>
            Beranda
          </MobileLink>
          <MobileLink href="/dashboard" active={isActive("/dashboard")} onClick={() => setIsOpen(false)}>
            Dashboard
          </MobileLink>
          <MobileLink href="/data" active={isActive("/data")} onClick={() => setIsOpen(false)}>
            Data Kasus
          </MobileLink>
          <MobileLink href="/prediksi" active={isActive("/prediksi")} onClick={() => setIsOpen(false)}>
            Prediksi
          </MobileLink>
        </div>
      )}
    </nav>
  );
}

// --- Helper Components agar kode lebih rapi ---

// Komponen Link Desktop
function NavLink({ href, active, children }: { href: string; active: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`px-4 py-2 rounded-full text-sm transition-all ${active}`}>
      {children}
    </Link>
  );
}

// Komponen Link Mobile (Full Width)
function MobileLink({ href, active, onClick, children }: { href: string; active: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${active}`}
    >
      {children}
    </Link>
  );
}