import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer"; // Import Footer
import React from "react";

export const metadata = {
  title: "D-MOSAI App",
  description: "Sistem Informasi Cerdas untuk Monitoring dan Prediksi Kasus DBD Kota Semarang",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-white text-slate-800 antialiased flex flex-col min-h-screen">
        <Navbar />
        
        {/* Main Content (flex-grow agar footer terdorong ke bawah jika konten sedikit) */}

        <main className="pt-16 pb-24 flex-grow bg-slate-50">
          {children}
        </main>
        
        {/* Pasang Footer Disini */}
        <Footer />
        
      </body>
    </html>
  );
}