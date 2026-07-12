/**
 * Clerk identity — upsert caller into the reserved `users` collection and
 * resolve vault owner with 4-tier precedence (stored → env map → username → raw).
 */

import { currentUser } from "@clerk/nextjs/server";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db";
import { roleFor, type UserRole } from "@/lib/roles";
import {
  parseClerkOwnerMap,
  resolveClerkUserIdToOwner,
  resolveUsernameToOwnerId,
} from "@/lib/users";

export interface AppUser {
  userId: string;
  owner: string;
  username: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Resolve vault owner for a Clerk userId.
 * Precedence: (1) stored users.owner → (2) CLERK_OWNER_MAP →
 * (3) Clerk username via alias table → (4) raw userId.
 */
export async function resolveOwner(userId: string): Promise<string> {
  // Mock / keyless: no Mongo — env map or raw id (fake-auth: userId === username).
  if (config.useMockAi || !config.mongodbUri) {
    return resolveClerkUserIdToOwner(userId);
  }

  try {
    const db = await getDb();
    const existing = await db
      .collection(config.collections.users)
      .findOne<{ owner?: string }>({ userId }, { projection: { owner: 1 } });
    if (existing?.owner) return existing.owner;
  } catch {
    /* fall through */
  }

  const mapped = parseClerkOwnerMap()[userId];
  if (mapped) return mapped;

  try {
    const cu = await currentUser();
    if (cu?.id === userId) {
      const uname = cu.username?.trim();
      if (uname) {
        const fromUsername = resolveUsernameToOwnerId(uname);
        if (fromUsername) return fromUsername;
      }
    }
  } catch {
    /* fall through */
  }

  return userId;
}

/**
 * Upsert a user doc keyed by Clerk userId.
 * Persists the resolved vault owner so subsequent resolveOwner hits tier 1.
 */
export async function getOrCreateUser(
  userId: string,
  username?: string,
): Promise<AppUser> {
  const owner = await resolveOwner(userId);
  const displayName = (
    username?.trim() ||
    owner ||
    userId
  ).toLowerCase();

  // Mock / keyless mode: no Mongo — return an in-memory shape.
  if (config.useMockAi || !config.mongodbUri) {
    return {
      userId,
      owner,
      username: displayName,
      role: roleFor(displayName),
      createdAt: new Date(),
    };
  }

  const db = await getDb();
  const col = db.collection(config.collections.users);
  const existing = await col.findOne<{
    userId: string;
    owner?: string;
    username?: string;
    role?: UserRole;
    createdAt?: Date;
  }>({ userId });

  if (existing) {
    let name = existing.username || displayName;
    const patch: { username?: string; role?: UserRole; owner?: string } = {};
    if (username?.trim()) {
      const nextName = username.trim().toLowerCase();
      if (nextName !== existing.username) {
        name = nextName;
        patch.username = name;
        patch.role = roleFor(name);
      }
    }
    // Backfill owner if the doc was created before resolveOwner landed.
    if (!existing.owner) {
      patch.owner = owner;
    }
    if (Object.keys(patch).length > 0) {
      await col.updateOne({ userId }, { $set: patch });
    }
    return {
      userId,
      owner,
      username: name,
      role: roleFor(name),
      createdAt: existing.createdAt ?? new Date(),
    };
  }

  const doc: AppUser = {
    userId,
    owner,
    username: displayName,
    role: roleFor(displayName),
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return doc;
}
