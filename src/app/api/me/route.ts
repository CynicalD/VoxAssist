import "@/lib/config";
import { currentUser } from "@clerk/nextjs/server";
import { requireUserId } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/identity";

export const runtime = "nodejs";

/**
 * GET /api/me — upsert + return the caller's identity doc.
 * Owner is resolved via resolveOwner (stored → env map → username → raw).
 */
export async function GET() {
  const authed = await requireUserId();
  if ("response" in authed) return authed.response;

  let username: string | undefined;
  try {
    const cu = await currentUser();
    if (cu?.id === authed.userId && cu.username) {
      username = cu.username;
    }
  } catch {
    /* ignore — getOrCreateUser still resolves owner */
  }

  const user = await getOrCreateUser(authed.userId, username);

  return Response.json({
    userId: user.userId,
    owner: user.owner,
    username: user.username,
    role: user.role,
  });
}
