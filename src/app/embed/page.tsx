import EmbedMap from "@/components/EmbedMap";
import { cleanEmbedSource } from "@/lib/embedMarketing";

export const metadata = {
  title: "Pinle Haritası",
  robots: { index: false },
};

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    source?: string;
    lat?: string;
    lng?: string;
    zoom?: string;
  }>;
}) {
  const { kind, source, lat, lng, zoom } = await searchParams;
  const numberInRange = (value: string | undefined, min: number, max: number, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
  };
  const center: [number, number] = [
    numberInRange(lng, -180, 180, 28.98),
    numberInRange(lat, -85, 85, 41.03),
  ];

  return (
    <EmbedMap
      kind={kind === "lezzet" ? kind : "lezzet"}
      source={cleanEmbedSource(source)}
      center={center}
      zoom={numberInRange(zoom, 3, 18, 11.8)}
    />
  );
}
