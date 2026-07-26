"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
};

const destinations = [
  {
    href: "/gorevler",
    icon: "🎯",
    title: "Fiyat görevleri",
    description: "Eksik bir fiyatı tamamla",
  },
  {
    href: "/sprint/istanbul",
    icon: "🏁",
    title: "İstanbul sprinti",
    description: "Beyoğlu veya Kadıköy'ü seç",
  },
  {
    href: "/fiyatlar",
    icon: "🏷️",
    title: "Fiyat verisi",
    description: "Türkiye sokak fiyatlarını incele",
  },
  {
    href: "/android",
    icon: "🤖",
    title: "Android",
    description: "Pinle'yi telefona indir",
  },
  {
    href: "/metodoloji",
    icon: "🧪",
    title: "Nasıl doğrulanıyor?",
    description: "Seed, güncellik ve güven modeli",
  },
  {
    href: "/basin",
    icon: "📰",
    title: "Basın ve medya",
    description: "Ürün özeti ve görseller",
  },
] as const;

export default function ExploreSheet({ open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-ink/20" onClick={onClose} />}
      <div
        className={`sheet ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="Pinle'yi keşfet"
      >
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <h2 className="text-xl font-extrabold">Pinle&apos;yi keşfet</h2>
              <p className="text-xs opacity-60">Görev seç, canlı sprinti izle veya veri yöntemini incele.</p>
            </div>
            <button onClick={onClose} className="btn btn-cream h-10 w-10 shrink-0" aria-label="Menüyü kapat">
              ✕
            </button>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2" aria-label="Pinle sayfaları">
            {destinations.map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                className="sticker-flat min-h-24 bg-cream p-3 text-left transition-transform active:translate-y-0.5"
              >
                <span className="text-2xl" aria-hidden>
                  {destination.icon}
                </span>
                <span className="mt-1 block text-sm font-extrabold leading-tight">
                  {destination.title}
                </span>
                <span className="mt-1 block text-[11px] leading-snug opacity-60">
                  {destination.description}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
