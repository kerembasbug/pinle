// Şehir/ilçe merkezleri (yaklaşık) — en yakın merkez yöntemiyle pin→ilçe+şehir ataması.
// Kaba ama İlçe/Şehir Ligi skorboardu için yeterli. Yeni şehir eklemek = bu listeye satır eklemek.

type Place = { district: string; city: string; lat: number; lng: number };

const PLACES: Place[] = [
  // ——— İSTANBUL ———
  { city: "İstanbul", district: "Adalar", lat: 40.876, lng: 29.091 },
  { city: "İstanbul", district: "Ataşehir", lat: 40.984, lng: 29.127 },
  { city: "İstanbul", district: "Avcılar", lat: 40.98, lng: 28.717 },
  { city: "İstanbul", district: "Bağcılar", lat: 41.034, lng: 28.857 },
  { city: "İstanbul", district: "Bahçelievler", lat: 40.998, lng: 28.859 },
  { city: "İstanbul", district: "Bakırköy", lat: 40.982, lng: 28.872 },
  { city: "İstanbul", district: "Başakşehir", lat: 41.093, lng: 28.802 },
  { city: "İstanbul", district: "Bayrampaşa", lat: 41.046, lng: 28.902 },
  { city: "İstanbul", district: "Beşiktaş", lat: 41.043, lng: 29.009 },
  { city: "İstanbul", district: "Beykoz", lat: 41.125, lng: 29.1 },
  { city: "İstanbul", district: "Beylikdüzü", lat: 41.001, lng: 28.642 },
  { city: "İstanbul", district: "Beyoğlu", lat: 41.032, lng: 28.977 },
  { city: "İstanbul", district: "Büyükçekmece", lat: 41.02, lng: 28.585 },
  { city: "İstanbul", district: "Çekmeköy", lat: 41.036, lng: 29.177 },
  { city: "İstanbul", district: "Esenler", lat: 41.043, lng: 28.876 },
  { city: "İstanbul", district: "Esenyurt", lat: 41.034, lng: 28.68 },
  { city: "İstanbul", district: "Eyüpsultan", lat: 41.048, lng: 28.934 },
  { city: "İstanbul", district: "Fatih", lat: 41.016, lng: 28.949 },
  { city: "İstanbul", district: "Gaziosmanpaşa", lat: 41.058, lng: 28.912 },
  { city: "İstanbul", district: "Güngören", lat: 41.019, lng: 28.882 },
  { city: "İstanbul", district: "Kadıköy", lat: 40.983, lng: 29.063 },
  { city: "İstanbul", district: "Kağıthane", lat: 41.086, lng: 28.971 },
  { city: "İstanbul", district: "Kartal", lat: 40.906, lng: 29.19 },
  { city: "İstanbul", district: "Küçükçekmece", lat: 41.001, lng: 28.8 },
  { city: "İstanbul", district: "Maltepe", lat: 40.936, lng: 29.155 },
  { city: "İstanbul", district: "Pendik", lat: 40.878, lng: 29.258 },
  { city: "İstanbul", district: "Sancaktepe", lat: 41.002, lng: 29.231 },
  { city: "İstanbul", district: "Sarıyer", lat: 41.166, lng: 29.057 },
  { city: "İstanbul", district: "Sultanbeyli", lat: 40.96, lng: 29.271 },
  { city: "İstanbul", district: "Sultangazi", lat: 41.106, lng: 28.868 },
  { city: "İstanbul", district: "Şişli", lat: 41.06, lng: 28.987 },
  { city: "İstanbul", district: "Tuzla", lat: 40.816, lng: 29.3 },
  { city: "İstanbul", district: "Ümraniye", lat: 41.016, lng: 29.124 },
  { city: "İstanbul", district: "Üsküdar", lat: 41.023, lng: 29.015 },
  { city: "İstanbul", district: "Zeytinburnu", lat: 40.994, lng: 28.905 },

  // ——— ANKARA ———
  { city: "Ankara", district: "Çankaya", lat: 39.908, lng: 32.862 },
  { city: "Ankara", district: "Keçiören", lat: 39.98, lng: 32.87 },
  { city: "Ankara", district: "Yenimahalle", lat: 39.97, lng: 32.79 },
  { city: "Ankara", district: "Mamak", lat: 39.93, lng: 32.92 },
  { city: "Ankara", district: "Etimesgut", lat: 39.95, lng: 32.68 },
  { city: "Ankara", district: "Sincan", lat: 39.97, lng: 32.58 },
  { city: "Ankara", district: "Altındağ", lat: 39.96, lng: 32.87 },
  { city: "Ankara", district: "Pursaklar", lat: 40.04, lng: 32.9 },
  { city: "Ankara", district: "Gölbaşı", lat: 39.79, lng: 32.81 },
  { city: "Ankara", district: "Polatlı", lat: 39.58, lng: 32.15 },

  // ——— İZMİR ———
  { city: "İzmir", district: "Konak", lat: 38.418, lng: 27.128 },
  { city: "İzmir", district: "Karşıyaka", lat: 38.46, lng: 27.11 },
  { city: "İzmir", district: "Bornova", lat: 38.47, lng: 27.22 },
  { city: "İzmir", district: "Buca", lat: 38.38, lng: 27.17 },
  { city: "İzmir", district: "Bayraklı", lat: 38.46, lng: 27.17 },
  { city: "İzmir", district: "Karabağlar", lat: 38.37, lng: 27.11 },
  { city: "İzmir", district: "Gaziemir", lat: 38.32, lng: 27.12 },
  { city: "İzmir", district: "Balçova", lat: 38.39, lng: 27.05 },
  { city: "İzmir", district: "Narlıdere", lat: 38.39, lng: 27.0 },
  { city: "İzmir", district: "Çiğli", lat: 38.5, lng: 27.07 },
  { city: "İzmir", district: "Menemen", lat: 38.6, lng: 27.07 },
  { city: "İzmir", district: "Torbalı", lat: 38.15, lng: 27.36 },
  { city: "İzmir", district: "Ödemiş", lat: 38.23, lng: 27.97 },
  { city: "İzmir", district: "Bergama", lat: 39.12, lng: 27.18 },
  { city: "İzmir", district: "Aliağa", lat: 38.8, lng: 26.97 },
  { city: "İzmir", district: "Urla", lat: 38.32, lng: 26.77 },
  { city: "İzmir", district: "Çeşme", lat: 38.32, lng: 26.3 },
  { city: "İzmir", district: "Foça", lat: 38.67, lng: 26.76 },

  // ——— MUĞLA ———
  { city: "Muğla", district: "Menteşe", lat: 37.215, lng: 28.363 },
  { city: "Muğla", district: "Bodrum", lat: 37.035, lng: 27.43 },
  { city: "Muğla", district: "Fethiye", lat: 36.62, lng: 29.12 },
  { city: "Muğla", district: "Marmaris", lat: 36.855, lng: 28.27 },
  { city: "Muğla", district: "Milas", lat: 37.316, lng: 27.784 },
  { city: "Muğla", district: "Datça", lat: 36.73, lng: 27.69 },
  { city: "Muğla", district: "Ortaca", lat: 36.84, lng: 28.77 },
  { city: "Muğla", district: "Dalaman", lat: 36.77, lng: 28.8 },
  { city: "Muğla", district: "Köyceğiz", lat: 36.97, lng: 28.69 },
  { city: "Muğla", district: "Seydikemer", lat: 36.63, lng: 29.31 },

  // ——— AYDIN ———
  { city: "Aydın", district: "Efeler", lat: 37.848, lng: 27.845 },
  { city: "Aydın", district: "Nazilli", lat: 37.913, lng: 28.32 },
  { city: "Aydın", district: "Söke", lat: 37.75, lng: 27.41 },
  { city: "Aydın", district: "Kuşadası", lat: 37.86, lng: 27.26 },
  { city: "Aydın", district: "Didim", lat: 37.38, lng: 27.27 },
  { city: "Aydın", district: "Germencik", lat: 37.87, lng: 27.6 },

  // ——— MANİSA ———
  { city: "Manisa", district: "Şehzadeler", lat: 38.613, lng: 27.426 },
  { city: "Manisa", district: "Yunusemre", lat: 38.62, lng: 27.4 },
  { city: "Manisa", district: "Akhisar", lat: 38.92, lng: 27.84 },
  { city: "Manisa", district: "Turgutlu", lat: 38.5, lng: 27.7 },
  { city: "Manisa", district: "Salihli", lat: 38.48, lng: 28.14 },
  { city: "Manisa", district: "Soma", lat: 39.19, lng: 27.61 },

  // ——— DENİZLİ ———
  { city: "Denizli", district: "Pamukkale", lat: 37.85, lng: 29.09 },
  { city: "Denizli", district: "Merkezefendi", lat: 37.77, lng: 29.08 },
  { city: "Denizli", district: "Çivril", lat: 38.3, lng: 29.74 },
  { city: "Denizli", district: "Acıpayam", lat: 37.42, lng: 29.35 },
  { city: "Denizli", district: "Honaz", lat: 37.76, lng: 29.27 },
];

const MAX_KM = 22; // bu mesafeden uzaksa atama yapılmaz (kapsam dışı pin)

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestPlace(lat: number, lng: number): { district: string; city: string } | null {
  let best: Place | null = null;
  let bestKm = MAX_KM;
  for (const p of PLACES) {
    const km = haversineKm(lat, lng, p.lat, p.lng);
    if (km < bestKm) {
      bestKm = km;
      best = p;
    }
  }
  return best ? { district: best.district, city: best.city } : null;
}

/** Geriye uyumluluk: sadece ilçe adı. */
export function nearestDistrict(lat: number, lng: number): string | null {
  return nearestPlace(lat, lng)?.district ?? null;
}
