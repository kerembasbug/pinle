import { avatarUrl } from "@/lib/avatars";

// Avatar gösterimi: geçerli id ise fal.ai maskotu (resim), değilse legacy emoji
// ya da fallback metni. Hook yok → hem server hem client bileşenlerinde kullanılır.
export function Avatar({
  value,
  size = 28,
  fallback = "🐾",
  className = "",
}: {
  value?: string | null;
  size?: number;
  fallback?: string;
  className?: string;
}) {
  const url = avatarUrl(value);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={className}
        style={{ width: size, height: size, display: "block", objectFit: "contain" }}
      />
    );
  }
  return (
    <span className={className} style={{ fontSize: Math.round(size * 0.7), lineHeight: 1 }}>
      {value || fallback}
    </span>
  );
}
