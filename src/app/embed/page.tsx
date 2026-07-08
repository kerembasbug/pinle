import EmbedMap from "@/components/EmbedMap";

export const metadata = {
  title: "Pinle Haritası",
  robots: { index: false },
};

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  return <EmbedMap kind={kind ?? "lezzet"} />;
}
