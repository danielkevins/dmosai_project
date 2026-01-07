"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";

const SEVERITY_COLORS: any = {
  "Rendah": "#4ade80",
  "Sedang": "#facc15",
  "Kritis": "#ef4444",
  "Noise": "#94a3b8"
};

// --- KOMPONEN DEBUG (TAMPIL DI ATAS PETA) ---
function DebugInfo({ info }: { info: string }) {
  return (
    <div className="absolute top-2 right-2 z-[1000] bg-white p-3 rounded-lg shadow-md border border-slate-300 text-xs max-w-xs opacity-90">
      <h4 className="font-bold border-b pb-1 mb-1 text-slate-800">Status Peta</h4>
      <pre className="whitespace-pre-wrap text-slate-600">{info}</pre>
    </div>
  );
}

export default function MapSemarang({ dataClustering }: { dataClustering: any[] }) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [matchedKey, setMatchedKey] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState("Memuat...");

  // 1. Load GeoJSON
  useEffect(() => {
    fetch("/maps/33.74_kelurahan.geojson")
      .then(async (res) => {
        if (!res.ok) throw new Error("File GeoJSON tidak ditemukan (404)");
        return res.json();
      })
      .then((data) => {
        setGeoJsonData(data);
        setDebugMsg("GeoJSON dimuat. Mencari kecocokan nama...");
      })
      .catch((err) => setDebugMsg(`Error: ${err.message}`));
  }, []);

  // 2. Fungsi Normalisasi (Membersihkan teks agar mudah dicocokkan)
  const normalize = (str: any) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/(kelurahan|kel\.|desa|kecamatan|kec\.)/g, "") // Hapus awalan umum
      .replace(/[^a-z0-9]/g, "") // Hapus spasi dan simbol, hanya ambil huruf/angka
      .trim();
  };

  // 3. AUTO-DETECT KEY LOGIC (Brute Force Matcher)
  useEffect(() => {
    if (!geoJsonData || !dataClustering || dataClustering.length === 0) return;

    // Ambil 1 fitur sampel dari GeoJSON untuk dicek propertinya
    const sampleFeature = geoJsonData.features[0];
    const props = sampleFeature.properties;
    
    // Ambil daftar nama wilayah dari API kita untuk referensi
    // Kita buat Set agar pencarian cepat
    const apiNames = new Set(dataClustering.map(d => normalize(d.wilayah)));

    let foundKey = null;
    let matchCount = 0;

    // Loop semua key yang ada di GeoJSON (misal: NAMOBJ, WADMKD, dll)
    for (const key of Object.keys(props)) {
      // Cek apakah value dari key ini ada di daftar nama API kita?
      // Kita cek 5 sampel pertama agar akurat
      let currentMatches = 0;
      for (let i = 0; i < Math.min(geoJsonData.features.length, 10); i++) {
         const val = geoJsonData.features[i].properties[key];
         if (apiNames.has(normalize(val))) {
           currentMatches++;
         }
      }

      // Jika lebih dari 3 sampel cocok, kemungkinan ini key yang benar!
      if (currentMatches > 0 && currentMatches >= matchCount) {
        matchCount = currentMatches;
        foundKey = key;
      }
    }

    if (foundKey) {
      setMatchedKey(foundKey);
      setDebugMsg(`✅ Match! Kunci GeoJSON: "${foundKey}"\nCocok dengan ${matchCount} sampel.`);
    } else {
      // Jika gagal, tampilkan list key yang tersedia agar User bisa lapor
      const availableKeys = Object.keys(props).join(", ");
      setDebugMsg(`❌ Gagal mencocokkan nama.\nKey tersedia: ${availableKeys}\n\nCoba cek konsol browser.`);
      console.log("GeoJSON Props:", props);
      console.log("API Names (Sample):", dataClustering.slice(0,3).map(d=>d.wilayah));
    }

  }, [geoJsonData, dataClustering]);

  // 4. Style & Tooltip Helper
  const getFeatureData = (feature: any) => {
    if (!matchedKey) return null;
    const rawName = feature.properties[matchedKey];
    
    // Cari data di API yang namanya mirip
    return dataClustering.find(d => normalize(d.wilayah) === normalize(rawName));
  };

  const getStyle = (feature: any) => {
    const data = getFeatureData(feature);
    const color = data ? (SEVERITY_COLORS[data.cluster] || "#cbd5e1") : "#cbd5e1";
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    // Gunakan key yang ditemukan, atau fallback ke key pertama jika belum ketemu
    const displayName = matchedKey ? feature.properties[matchedKey] : "Memuat...";
    const data = getFeatureData(feature);
    
    const status = data ? data.cluster : "Data Tidak Ditemukan";
    const kasus = data ? data.jml_p : 0;
    const color = data ? (SEVERITY_COLORS[status] || "#64748b") : "#64748b";

    layer.bindTooltip(`
      <div class="text-center font-sans p-1 min-w-[120px]">
        <strong class="text-sm border-b pb-1 block mb-1 uppercase">${displayName}</strong>
        <div class="text-xs text-left space-y-1">
           <div>Status: <b style="color:${color}">${status}</b></div>
           <div>Kasus: <b>${kasus}</b></div>
        </div>
      </div>
    `, { sticky: true, direction: 'top' });
  };

  if (!geoJsonData) return (
    <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400">
      {debugMsg}
    </div>
  );

  return (
    <div className="relative h-full w-full">
      {/* Tampilkan Info Debug di Pojok Kanan Atas */}
      <DebugInfo info={debugMsg} />
      
      <MapContainer 
        center={[-7.005145, 110.438125]} 
        zoom={11} 
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "12px", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Render GeoJSON hanya jika key sudah ditemukan atau sekadar tampilkan peta polos */}
        <GeoJSON 
          key={matchedKey || "initial"} // Force re-render saat key ditemukan
          data={geoJsonData} 
          style={getStyle} 
          onEachFeature={onEachFeature} 
        />
      </MapContainer>
    </div>
  );
}