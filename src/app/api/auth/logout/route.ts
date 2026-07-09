import { logout } from "@/lib/identity";

export async function POST() {
  await logout();
  return Response.json({ ok: true });
}
