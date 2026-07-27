"use client";

import { useState } from "react";
import { tagsForVenue, tagById, type TagVerdict } from "@/lib/venueTags";

type VoteFn = (tag: string, value: boolean) => void | Promise<void>;

/**
 * ROZETLER — mekan hakkında ÖĞRENİLEN bilgi.
 * "Yok" cevabı da gösterilir: "pati dostu değil" bilmek de en az "dostu"
 * kadar değerli (kapıdan çevrilmemek için).
 */
export function TagBadges({ tags }: { tags: TagVerdict[] }) {
  const known = tags.filter((t) => t.value !== null && tagById(t.id));
  if (known.length === 0) return null;
  // Önce "var"lar, sonra "yok"lar
  known.sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {known.map((t) => {
        const def = tagById(t.id)!;
        const yes = t.value === true;
        const count = yes ? t.yes : t.no;
        return (
          <span
            key={t.id}
            title={`${yes ? def.detail : "Bu mekanda yok."} (${count} kişi bildirdi)`}
            className={`sticker-flat flex items-center gap-1 px-2 py-1 text-[12px] font-bold ${
              yes ? "bg-[#e7f5f1]" : "bg-cream opacity-55"
            }`}
          >
            <span aria-hidden>{def.emoji}</span>
            <span className={yes ? "" : "line-through"}>{def.label}</span>
            {count > 1 && <span className="font-normal opacity-50">·{count}</span>}
          </span>
        );
      })}
    </div>
  );
}

/**
 * SORU KARTI — bilgiyi toplayan taraf.
 * Yalnız CEVAPLANMAMIŞ (kendi oyun olmayan) sorular, en fazla 3 tane:
 * uzun anket hissi vermeden her ziyarette biraz daha veri toplanır.
 */
export function TagAsk({
  tags,
  myTags,
  placeTypeId,
  onVote,
}: {
  tags: TagVerdict[];
  myTags: Record<string, boolean>;
  placeTypeId: string;
  onVote: VoteFn;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [justAnswered, setJustAnswered] = useState<Set<string>>(new Set());

  const counts = new Map(tags.map((t) => [t.id, t]));
  const pending = tagsForVenue(placeTypeId)
    .filter((t) => myTags[t.id] === undefined && !justAnswered.has(t.id))
    // Az bilinenler önce sorulsun (veri en çok orada eksik)
    .sort((a, b) => {
      const ca = counts.get(a.id);
      const cb = counts.get(b.id);
      return (ca ? ca.yes + ca.no : 0) - (cb ? cb.yes + cb.no : 0);
    })
    .slice(0, 3);

  if (pending.length === 0) return null;

  const answer = async (tag: string, value: boolean) => {
    setBusy(tag);
    await onVote(tag, value);
    setJustAnswered((s) => new Set(s).add(tag));
    setBusy(null);
  };

  return (
    <div className="mt-4 sticker-flat bg-cream p-3">
      <p className="text-sm font-extrabold">🧐 Burayı biliyor musun?</p>
      <p className="mb-2 text-xs opacity-60">
        Bir soru bile cevaplasan bu mekanı arayan yüzlerce kişiye yardım edersin —
        her cevap <span className="font-bold text-tomato">+3 puan</span>.
      </p>
      <div className="flex flex-col gap-1.5">
        {pending.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <span className="flex-1 text-[13px] leading-snug">
              <span aria-hidden className="mr-1">
                {t.emoji}
              </span>
              {t.question}
            </span>
            <button
              onClick={() => answer(t.id, true)}
              disabled={busy !== null}
              className="btn btn-teal px-3 py-1 text-xs"
            >
              Evet
            </button>
            <button
              onClick={() => answer(t.id, false)}
              disabled={busy !== null}
              className="btn btn-cream px-3 py-1 text-xs"
            >
              Hayır
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
