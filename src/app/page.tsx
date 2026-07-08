import MapApp from "@/components/MapApp";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string }>;
}) {
  const { pin } = await searchParams;
  return <MapApp initialPinId={pin} />;
}
