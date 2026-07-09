import { NextRequest } from "next/server";
import { getOrCreateUser, setSessionUser } from "@/lib/identity";
import { verifyEmailToken, linkIdentity } from "@/lib/auth";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const email = verifyEmailToken(token);
  if (!email) {
    return Response.redirect(`${SITE}/?auth=expired`, 302);
  }
  const user = await getOrCreateUser();
  const { userId } = linkIdentity(user.id, { email });
  if (userId !== user.id) await setSessionUser(userId);
  return Response.redirect(`${SITE}/?auth=ok`, 302);
}
