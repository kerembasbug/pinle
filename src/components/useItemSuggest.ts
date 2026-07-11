"use client";

import { useEffect, useRef, useState } from "react";

// Ürün/hizmet kalemi için topluluk-öğrenmeli öneriler (debounce'lu).
// Yazdıkça /api/items'tan geçmiş girdiler gelir; boş sorguda kategorinin
// popülerleri döner. Statik önerilerle birleştirilip çip olarak gösterilir.
export function useItemSuggest(query: string, category: string, enabled: boolean): string[] {
  const [items, setItems] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!enabled) {
      setItems([]);
      return;
    }
    timer.current = setTimeout(() => {
      const u = `/api/items?q=${encodeURIComponent(query.trim())}&cat=${encodeURIComponent(category)}`;
      fetch(u)
        .then((r) => r.json())
        .then((d: { items?: string[] }) => setItems(d.items ?? []))
        .catch(() => setItems([]));
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, category, enabled]);

  return items;
}
