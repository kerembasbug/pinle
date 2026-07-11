// /api/pins GET mikro-cache'i (viral yük sigortası). Kişiselleştirme yok →
// aynı kaba bbox+filtre herkese aynı gövdeyi döner. Yazma olunca temizlenir
// ki pinleyen kendi pinini anında görsün.
const store = new Map<string, { t: number; body: string }>();
export const PINS_TTL_MS = 15000;
const MAX = 400;

export function cacheGet(key: string): string | null {
  const hit = store.get(key);
  if (hit && Date.now() - hit.t < PINS_TTL_MS) return hit.body;
  return null;
}

export function cacheSet(key: string, body: string) {
  if (store.size >= MAX) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
  store.set(key, { t: Date.now(), body });
}

export function cacheClear() {
  store.clear();
}
