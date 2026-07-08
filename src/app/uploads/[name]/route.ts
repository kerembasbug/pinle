import fs from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const NAME_RE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  if (!NAME_RE.test(name)) return new Response("Not found", { status: 404 });
  const file = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const ext = name.split(".").pop()!;
  return new Response(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": MIME[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
