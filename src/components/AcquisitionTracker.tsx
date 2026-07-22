"use client";

import { useEffect } from "react";
import {
  acquisitionContextFromSearch,
  acquisitionSurfaceForPath,
} from "@/lib/acquisition";

const STORAGE_PREFIX = "pinle-acquisition:";

export default function AcquisitionTracker() {
  useEffect(() => {
    const context = acquisitionContextFromSearch(window.location.search);
    const surface = acquisitionSurfaceForPath(window.location.pathname);
    if (!context || !surface) return;

    const storageKey = `${STORAGE_PREFIX}${surface}:${context.source}:${context.medium}:${context.campaign}:${context.content ?? "-"}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      return;
    }

    fetch("/api/events/acquisition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surface, ...context }),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) sessionStorage.removeItem(storageKey);
    }).catch(() => {
      sessionStorage.removeItem(storageKey);
    });
  }, []);

  return null;
}
