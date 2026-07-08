// İstanbul ilçe merkezleri (yaklaşık) — en yakın merkez yöntemiyle pin→ilçe ataması.
// Kaba bir yöntem ama İlçe Ligi skorboardu için yeterli; hassas sınır gerekmez.
// Şehir genişlemesinde bu listeye yeni şehirlerin ilçeleri eklenir.

type District = { name: string; lat: number; lng: number };

const ISTANBUL: District[] = [
  { name: "Adalar", lat: 40.876, lng: 29.091 },
  { name: "Arnavutköy", lat: 41.184, lng: 28.74 },
  { name: "Ataşehir", lat: 40.984, lng: 29.127 },
  { name: "Avcılar", lat: 40.98, lng: 28.717 },
  { name: "Bağcılar", lat: 41.034, lng: 28.857 },
  { name: "Bahçelievler", lat: 40.998, lng: 28.859 },
  { name: "Bakırköy", lat: 40.982, lng: 28.872 },
  { name: "Başakşehir", lat: 41.093, lng: 28.802 },
  { name: "Bayrampaşa", lat: 41.046, lng: 28.902 },
  { name: "Beşiktaş", lat: 41.043, lng: 29.009 },
  { name: "Beykoz", lat: 41.125, lng: 29.1 },
  { name: "Beylikdüzü", lat: 41.001, lng: 28.642 },
  { name: "Beyoğlu", lat: 41.032, lng: 28.977 },
  { name: "Büyükçekmece", lat: 41.02, lng: 28.585 },
  { name: "Çatalca", lat: 41.143, lng: 28.461 },
  { name: "Çekmeköy", lat: 41.036, lng: 29.177 },
  { name: "Esenler", lat: 41.043, lng: 28.876 },
  { name: "Esenyurt", lat: 41.034, lng: 28.68 },
  { name: "Eyüpsultan", lat: 41.048, lng: 28.934 },
  { name: "Fatih", lat: 41.016, lng: 28.949 },
  { name: "Gaziosmanpaşa", lat: 41.058, lng: 28.912 },
  { name: "Güngören", lat: 41.019, lng: 28.882 },
  { name: "Kadıköy", lat: 40.983, lng: 29.063 },
  { name: "Kağıthane", lat: 41.086, lng: 28.971 },
  { name: "Kartal", lat: 40.906, lng: 29.19 },
  { name: "Küçükçekmece", lat: 41.001, lng: 28.8 },
  { name: "Maltepe", lat: 40.936, lng: 29.155 },
  { name: "Pendik", lat: 40.878, lng: 29.258 },
  { name: "Sancaktepe", lat: 41.002, lng: 29.231 },
  { name: "Sarıyer", lat: 41.166, lng: 29.057 },
  { name: "Silivri", lat: 41.073, lng: 28.246 },
  { name: "Sultanbeyli", lat: 40.96, lng: 29.271 },
  { name: "Sultangazi", lat: 41.106, lng: 28.868 },
  { name: "Şile", lat: 41.176, lng: 29.612 },
  { name: "Şişli", lat: 41.06, lng: 28.987 },
  { name: "Tuzla", lat: 40.816, lng: 29.3 },
  { name: "Ümraniye", lat: 41.016, lng: 29.124 },
  { name: "Üsküdar", lat: 41.023, lng: 29.015 },
  { name: "Zeytinburnu", lat: 40.994, lng: 28.905 },
];

const MAX_KM = 25; // bu mesafeden uzaksa ilçe atanmaz (İstanbul dışı pin)

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestDistrict(lat: number, lng: number): string | null {
  let best: string | null = null;
  let bestKm = MAX_KM;
  for (const d of ISTANBUL) {
    const km = haversineKm(lat, lng, d.lat, d.lng);
    if (km < bestKm) {
      bestKm = km;
      best = d.name;
    }
  }
  return best;
}
