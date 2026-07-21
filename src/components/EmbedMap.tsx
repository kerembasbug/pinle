"use client";

import { useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { categoryById } from "@/lib/categories";
import { attributedEmbedPath, type EmbedTarget } from "@/lib/embedMarketing";
import type { PinSummary } from "@/lib/types";
import { formatPrice } from "@/lib/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Medya siteleri için gömülebilir salt-okur harita.
// <iframe src="https://pinle.app/embed?source=yayin_adi" width="100%" height="480"></iframe>
export default function EmbedMap({
  kind,
  source,
  center,
  zoom,
}: {
  kind: string;
  source: string;
  center: [number, number];
  zoom: number;
}) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const recordClick = useCallback((target: EmbedTarget) => {
    const storageKey = `pinle:embed:${source}:${target}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Üçüncü taraf iframe storage'ı kapalıysa olay yine anonim olarak yazılır.
    }

    const payload = JSON.stringify({ source, target });
    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(
        "/api/events/embed",
        new Blob([payload], { type: "application/json" }),
      );
      if (accepted) return;
    }
    fetch("/api/events/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [source]);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const markers = markersRef.current;

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
          // Küçük iframe'lerde yüzlerce marker üst üste binmesin. Önce fiyatlı ve
          // doğrulanmış kayıtları seçip ekranda yaklaşık 56 px'lik hücre başına
          // tek marker gösteriyoruz; pan/zoom sonrası görünmeyenleri kaldırıyoruz.
          const prioritized = [...pins].sort((a, b) =>
            Number(b.price != null) - Number(a.price != null)
            || b.confirms - a.confirms
            || a.outdated - b.outdated
            || b.created_at.localeCompare(a.created_at)
          );
          const occupied = new Set<string>();
          const visibleIds = new Set<string>();
          const { clientWidth, clientHeight } = map.getContainer();

          for (const pin of prioritized) {
            const point = map.project([pin.lng, pin.lat]);
            if (point.x < 0 || point.y < 0 || point.x > clientWidth || point.y > clientHeight) {
              continue;
            }
            const cell = `${Math.floor(point.x / 56)}:${Math.floor(point.y / 56)}`;
            if (occupied.has(cell)) continue;
            occupied.add(cell);
            visibleIds.add(pin.id);
            if (markers.has(pin.id)) continue;
            const cat = categoryById(pin.category);
            const el = document.createElement("div");
            el.className = "pin-marker";
            const price = formatPrice(pin.price);
            el.innerHTML = `<div class="bubble"><span>${cat.emoji}</span><span class="price">${
              price ?? ""
            }</span></div><div class="tip"></div>`;
            el.addEventListener("click", () => {
              recordClick("pin");
              window.open(
                attributedEmbedPath(`/pin/${pin.id}`, source),
                "_blank",
                "noopener,noreferrer",
              );
            });
            const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
              .setLngLat([pin.lng, pin.lat])
              .addTo(map);
            markers.set(pin.id, m);
          }

          for (const [pinId, marker] of markers) {
            if (visibleIds.has(pinId)) continue;
            marker.remove();
            markers.delete(pinId);
          }
        })
        .catch(() => {});
    };

    map.on("moveend", load);
    load();
    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, [center, kind, recordClick, source, zoom]);

  const homeHref = attributedEmbedPath("/", source);

  return (
    <div className="fixed inset-0">
      <div ref={mapDiv} className="map-canvas-host absolute inset-0" />
      <a
        href={homeHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => recordClick("home")}
        className="sticker absolute left-3 top-3 z-10 flex items-center gap-1.5 px-3 py-1.5 no-underline"
      >
        <span className="text-lg">📍</span>
        <span className="display text-lg font-extrabold text-tomato">Pinle&apos;de aç</span>
      </a>
      <p className="sticker-flat pointer-events-none absolute bottom-10 right-3 z-10 px-3 py-1.5 text-[11px] font-bold opacity-75">
        Gerçek fiyatı gör · doğrula · güncelle
      </p>
    </div>
  );
}
