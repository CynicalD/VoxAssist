import type { Scope } from "@/contract/types";
import { resolveOwner } from "@/lib/identity";
import { resolveUsernameToOwnerId } from "@/lib/users";

export type BuildScopeResult =
  | { ok: true; scope: Scope }
  | { ok: false; error: string };

/**
 * Build retrieval Scope from the authenticated caller + optional friend username.
 *
 * Guardrail: friend-scope results must be limited to `shared === true` documents.
 * This API only builds and passes Scope; the teammate's `IRetriever.retrieve`
 * enforces the shared flag. Resolving a username is a lookup to an owner id,
 * never a permission bypass.
 *
 * Self-scope uses resolveOwner (stored users doc → CLERK_OWNER_MAP →
 * Clerk username → raw userId) so queries hit notes ingested with `--as momen`.
 */
export async function buildScope(
  clerkUserId: string,
  targetUsername?: string | null,
): Promise<BuildScopeResult> {
  const callerOwner = await resolveOwner(clerkUserId);
  const trimmed = targetUsername?.trim();
  if (!trimmed) {
    return { ok: true, scope: { kind: "self", owner: callerOwner } };
  }

  const targetId = resolveUsernameToOwnerId(trimmed);
  if (!targetId) {
    return { ok: false, error: `Unknown username: ${trimmed}` };
  }

  return { ok: true, scope: { kind: "friend", owner: targetId } };
}
