"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { categoryById } from "@/lib/categories";
import type { PinSummary } from "@/lib/types";
import { formatPrice } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ISTANBUL: [number, number] = [28.98, 41.03];

// Medya siteleri için gömülebilir salt-okur harita.
// <iframe src="https://pinle.app/embed?kind=lezzet" width="100%" height="480"></iframe>
export default function EmbedMap({ kind }: { kind: string }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: MAP_STYLE,
      center: ISTANBUL,
      zoom: 11.8,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const load = () => {
      const b = map.getBounds();
      const params = new URLSearchParams({
        minLat: String(b.getSouth()),
        maxLat: String(b.getNorth()),
        minLng: String(b.getWest()),
        maxLng: String(b.getEast()),
        kind,
        category: "",
      });
      fetch(`/api/pins?${params}`)
        .then((r) => r.json())
        .then(({ pins }: { pins: PinSummary[] }) => {
          for (const pin of pins) {
            if (markersRef.current.has(pin.id)) continue;
            const cat = categoryById(pin.category);
            const el = document.createElement("div");
            el.className = "pin-marker";
            const price = formatPrice(pin.price);
            el.innerHTML = `<div class="bubble"><span>${cat.emoji}</span><span class="price">${
              price ?? ""
            }</span></div><div class="tip"></div>`;
            el.addEventListener("click", () => window.open(`/pin/${pin.id}`, "_blank"));
            const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
              .setLngLat([pin.lng, pin.lat])
              .addTo(map);
            markersRef.current.set(pin.id, m);
          }
        })
        .catch(() => {});
    };

    map.on("moveend", load);
    load();
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [kind]);

  return (
    <div className="fixed inset-0">
      <div ref={mapDiv} className="map-canvas-host absolute inset-0" />
      <a
        href="/"
        target="_blank"
        className="sticker absolute left-3 top-3 z-10 flex items-center gap-1.5 px-3 py-1.5 no-underline"
      >
        <span className="text-lg">📍</span>
        <span className="display text-lg font-extrabold text-tomato">Pinle&apos;de aç</span>
      </a>
    </div>
  );
}
