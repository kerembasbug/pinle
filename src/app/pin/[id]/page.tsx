import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryById, categoryIcon } from "@/lib/categories";
import { formatPrice, timeAgo } from "@/lib/types";
import { validityLabel } from "@/lib/validity";
import { getPin } from "@/lib/pins";
import PlayStoreLink from "@/components/PlayStoreLink";
import type { PlaySource } from "@/lib/marketing";

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
  const priceStr = price ? `${pin.price_item ? `${pin.price_item} ` : ""}${price}` : "";
  const title = `${pin.name}${priceStr ? ` — ${priceStr}` : ""} | Pinle`;
  const description =
    pin.note ??
    `${categoryById(pin.category).label} · ${(CONFIRM_LABEL[pin.kind] ?? CONFIRM_LABEL.lezzet)(pin.confirms)} · Pinle`;
  return {
    title,
    description,
    alternates: { canonical: `/pin/${id}` },
    openGraph: { title, description, type: "article", url: `/pin/${id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const pin = getPin(id);
  if (!pin) notFound();
  const cat = categoryById(pin.category);
  const price = formatPrice(pin.price);
  const incomingSource = Array.isArray(query.utm_source) ? query.utm_source[0] : query.utm_source;
  const sharedPinVisit = incomingSource === "pin_share";
  const playSource: PlaySource = sharedPinVisit ? "pin_share_play" : "pin_detail_play";

  return (
    <main className="paper-grain flex min-h-dvh flex-col items-center justify-center gap-5 p-5">
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-2xl">📍</span>
        <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
      </Link>

      <div className="sticker w-full max-w-sm p-5">
        <div className="flex items-start gap-3">
          <div className="sticker-flat flex h-13 w-13 shrink-0 items-center justify-center p-2 text-3xl bg-paper">
            {categoryIcon(pin.category) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={categoryIcon(pin.category)!} alt={cat.label} className="h-10 w-10" />
            ) : (
              cat.emoji
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight">{pin.name}</h1>
            <p className="text-xs opacity-60">
              {cat.label} · {pin.author} · {timeAgo(pin.created_at)}
            </p>
          </div>
        </div>
        {price && (
          <p className="display mt-3 text-4xl font-extrabold text-tomato">
            {pin.price_item && (
              <span className="mr-2 align-middle text-base font-bold opacity-60">
                {pin.price_item}
              </span>
            )}
            {price}
          </p>
        )}
        {price &&
          (() => {
            const v = validityLabel(pin.price_valid_until);
            if (v.kind === "none" || v.kind === "expired") return null;
            return (
              <p className="mt-1 text-sm font-bold text-teal">🏷️ {v.text}</p>
            );
          })()}
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

      <section className="sticker-flat sticker-mustard flex w-full max-w-sm flex-col items-center gap-3 p-4 text-center">
        <div>
          <h2 className="text-lg font-extrabold">
            {sharedPinVisit ? "Bu fiyatı bir arkadaşın paylaştı 📲" : "Fiyat haritası cebinde olsun 📲"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed opacity-75">
            Yakınındaki tarihli fiyatları gör; bildiğin bir fiyatı ekle veya güncelliğini doğrula.
          </p>
        </div>
        <PlayStoreLink
          source={playSource}
          hideWhenInstalled
          className="btn btn-teal px-6 py-3"
          ariaLabel="Pinle Android uygulamasını Google Play'de aç"
        >
          Google Play&apos;de Aç ↗
        </PlayStoreLink>
      </section>

      <p className="max-w-xs text-center text-xs opacity-50">
        Sen de çevrendeki gerçek fiyatları ekle, güncelliğini doğrula, mahallene katkı ver.
      </p>
    </main>
  );
}
