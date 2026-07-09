import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryById } from "@/lib/categories";
import { formatPrice, timeAgo } from "@/lib/types";
import { getPin } from "@/lib/pins";

const CONFIRM_LABEL: Record<string, (n: number) => string> = {
  lezzet: (n) => `✓ ${n} doğrulandı`,
  ani: (n) => `❤️ ${n} kişiye dokundu`,
  sorun: (n) => `⚠️ ${n} kişi onayladı`,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pin = getPin(id);
  if (!pin) return { title: "Pin bulunamadı — Pinle" };
  const price = formatPrice(pin.price);
  const title = `${pin.name}${price ? ` — ${price}` : ""} | Pinle`;
  const description =
    pin.note ??
    `${categoryById(pin.category).label} · ${(CONFIRM_LABEL[pin.kind] ?? CONFIRM_LABEL.lezzet)(pin.confirms)} · Pinle`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", url: `/pin/${id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = getPin(id);
  if (!pin) notFound();
  const cat = categoryById(pin.category);
  const price = formatPrice(pin.price);

  return (
    <main className="paper-grain flex min-h-dvh flex-col items-center justify-center gap-5 p-5">
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-2xl">📍</span>
        <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
      </Link>

      <div className="sticker w-full max-w-sm p-5">
        <div className="flex items-start gap-3">
          <div className="sticker-flat flex h-13 w-13 shrink-0 items-center justify-center p-2.5 text-3xl bg-paper">
            {cat.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight">{pin.name}</h1>
            <p className="text-xs opacity-60">
              {cat.label} · {pin.author} · {timeAgo(pin.created_at)}
            </p>
          </div>
        </div>
        {price && <p className="display mt-3 text-4xl font-extrabold text-tomato">{price}</p>}
        {pin.note && <p className="mt-2 text-[15px]">{pin.note}</p>}
        {pin.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/uploads/${pin.photo}`} alt={pin.name} className="sticker-flat mt-3 w-full object-cover" />
        )}
        <div className="mt-3 flex gap-2 text-sm font-bold">
          <span className="sticker-flat px-3 py-1 text-teal">
            {(CONFIRM_LABEL[pin.kind] ?? CONFIRM_LABEL.lezzet)(pin.confirms)}
          </span>
          {pin.kind === "lezzet" && pin.outdated > 0 && (
            <span className="sticker-flat px-3 py-1 text-tomato">📈 {pin.outdated} zamlandı</span>
          )}
          {pin.kind === "sorun" && pin.outdated > 0 && (
            <span className="sticker-flat px-3 py-1 text-teal">✅ {pin.outdated} çözüldü dedi</span>
          )}
        </div>
      </div>

      <Link href={`/?pin=${pin.id}`} className="btn btn-tomato px-8 py-3.5 text-lg">
        Haritada Aç 🗺️
      </Link>
      <p className="max-w-xs text-center text-xs opacity-50">
        Sen de mahallendeki ucuz ve iyi yerleri pinle, puan topla, mahallenin muhtarı ol.
      </p>
    </main>
  );
}
