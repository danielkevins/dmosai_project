"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import L from "leaflet";

// Interface Props
interface MapProps {
  dataClustering: any[];
  onAreaClick: (data: any) => void;
}

// Warna berdasarkan Cluster
const SEVERITY_COLORS: any = {
  "Rendah": "#4ade80", // Hijau
  "Sedang": "#facc15", // Kuning
  "Kritis": "#ef4444", // Merah
  "Tinggi": "#ef4444", // Merah (Alias)
  "Noise": "#94a3b8"   // Abu-abu
};

// Helper: Normalisasi Teks
const normalize = (str: any) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/(kelurahan|kel\.|desa|kecamatan|kec\.)/g, "")
    .replace(/[^a-z0-9]/g, "") 
    .trim();
};

// Helper: Auto Zoom Center
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapSemarang({ dataClustering, onAreaClick }: MapProps) {
  const [geoJsonRaw, setGeoJsonRaw] = useState<any>(null);
  const [matchedKey, setMatchedKey] = useState<string | null>(null);

  // 1. Fetch GeoJSON
  useEffect(() => {
    fetch("/maps/33.74_kelurahan.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("File GeoJSON tidak ditemukan");
        return res.json();
      })
      .then((data) => setGeoJsonRaw(data))
      .catch((err) => console.error("Gagal memuat peta:", err));
  }, []);

  // 2. AUTO-DETECT KEY
  useEffect(() => {
    if (!geoJsonRaw || !dataClustering || dataClustering.length === 0) return;

    const sampleFeature = geoJsonRaw.features[0];
    const props = sampleFeature.properties;
    
    // Buat daftar nama dari API untuk dicocokkan
    const apiNames = new Set(dataClustering.map(d => normalize(d.wilayah)));

    let bestKey = null;
    let maxMatch = 0;

    for (const key of Object.keys(props)) {
      let currentMatches = 0;
      for (let i = 0; i < Math.min(geoJsonRaw.features.length, 10); i++) {
         const val = geoJsonRaw.features[i].properties[key];
         if (apiNames.has(normalize(val))) {
           currentMatches++;
         }
      }
      if (currentMatches > maxMatch) {
        maxMatch = currentMatches;
        bestKey = key;
      }
    }

    if (bestKey) {
      setMatchedKey(bestKey);
    }
  }, [geoJsonRaw, dataClustering]);

  // 3. MERGING DATA
  const mapData = useMemo(() => {
    if (!geoJsonRaw || !dataClustering || !matchedKey) return null;

    const combinedFeatures = geoJsonRaw.features.map((feature: any) => {
      const props = feature.properties;
      const regionName = props[matchedKey]; 
      
      const matchedData = dataClustering.find(
        (apiItem: any) => normalize(apiItem.wilayah) === normalize(regionName)
      );

      return {
        ...feature,
        properties: {
          ...props,
          stats: matchedData || null,
          riskStatus: matchedData ? matchedData.cluster : "Tidak Ada Data"
        }
      };
    });

    return { ...geoJsonRaw, features: combinedFeatures };

  }, [geoJsonRaw, dataClustering, matchedKey]);

  // 4. Style Function
  const style = (feature: any) => {
    const risk = feature.properties.riskStatus;
    const fillColor = risk === "Tidak Ada Data" ? "#e2e8f0" : (SEVERITY_COLORS[risk] || "#e2e8f0");
    
    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.8,
    };
  };

  // 5. Event Handler (UPDATE TOOLTIP DI SINI)
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stats = feature.properties.stats;
    const regionName = matchedKey ? feature.properties[matchedKey] : "Wilayah";

    // --- UPDATE BAGIAN INI ---
    const tooltipContent = stats 
      ? `<div class="text-center font-sans">
           <strong style="font-size:14px; display:block; margin-bottom:4px;">${stats.wilayah}</strong>
           <div style="font-size:12px; margin-bottom:2px;">
             Kasus: <b style="font-size:13px;">${stats.jml_p}</b>
           </div>
           <div style="font-size:12px;">
             Status: <span style="color:${SEVERITY_COLORS[stats.cluster]}; font-weight:bold;">${stats.cluster}</span>
           </div>
         </div>`
      : `<strong>${regionName}</strong><br/>Tidak ada data`;
    // -------------------------

    layer.bindTooltip(tooltipContent, { sticky: true, direction: "top", opacity: 0.9 });

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3, color: '#666', fillOpacity: 0.9, dashArray: '' });
      },
      mouseout: (e: any) => {
        const currentRisk = feature.properties.riskStatus;
        const defaultColor = currentRisk === "Tidak Ada Data" ? "#e2e8f0" : (SEVERITY_COLORS[currentRisk] || "#e2e8f0");
        e.target.setStyle({ weight: 1, color: 'white', fillOpacity: 0.8, dashArray: '3', fillColor: defaultColor });
      },
      click: () => {
        if (stats) {
          onAreaClick(stats);
        }
      }
    });
  };

  if (!geoJsonRaw) return (
    <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400 text-sm animate-pulse">
       Sedang memuat peta...
    </div>
  );

  return (
    <div className="h-full w-full bg-slate-100 relative rounded-xl overflow-hidden">
       <MapContainer 
        center={[-7.005145, 110.438125]} 
        zoom={11} 
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapData && (
          <GeoJSON 
            key={JSON.stringify(dataClustering)}
            data={mapData as any} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}

        <MapUpdater center={[-7.005145, 110.438125]} zoom={11} />
      </MapContainer>
    </div>
  );
}