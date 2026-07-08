import { createHash } from "node:crypto";

// Kullanıcının gerçek (çerez) kimliğini ifşa etmeden, istemcinin "bu kullanıcıyı
// gizle" listesi tutabilmesi için kararlı ve opak bir yazar kimliği üretir.
// Aynı user_id her zaman aynı kısa değeri verir; geri döndürülemez.
export function authorIdFor(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}
