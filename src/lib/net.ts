import { createHash } from "node:crypto";

// İstemci IP'sini proxy başlıklarından çıkar (Coolify/Cloudflare arkasında
// x-forwarded-for'un İLK adresi gerçek istemcidir). Gizlilik için ham IP asla
// saklanmaz — yalnızca tuzlanmış hash tutulur (rapor/teşekkür çerez-sıfırlama
// istismarını kırmak için "aynı cihaz mı" ayrımı yeterli).
export function clientIpHash(request: Request): string {
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    xff.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = process.env.AUTH_SECRET ?? "pinle-ip-salt";
  return createHash("sha256").update(ip + "|" + salt).digest("hex").slice(0, 32);
}
