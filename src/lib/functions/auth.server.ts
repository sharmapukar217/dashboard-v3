import { pick } from "$lib/utilities/functions";
import type { User, Account } from "@prisma/client";
import { prisma } from "$lib/utilities/prisma.server";

type AccountTypes = "google" | "facebook" | "github" | "twitter";
export async function getConnectedAccounts(userId: string) {
  if (!userId) return {};

  const accounts = await prisma.account.findMany({
    where: { userId }
  });

  const result = new Map<AccountTypes, Account>();
  accounts.forEach(({ provider, ...rest }) => {
    result.set(provider, rest);
  });

  return result;
}

export async function getUserSessions(userId: string, sid: string) {
  if (!userId || !sid) return [];
  const sessions = await prisma.session.findMany({
    select: { sid: true, ipAddress: true, userAgent: true, currentUserId: true },
    where: { OR: [{ currentUserId: userId }, { savedAccounts: { contains: userId } }] }
  });

  return sessions.map((s) => ({
    ...s,
    current: s.sid === sid,
    loggedIn: s.currentUserId === userId
  }));
}

export async function getCurrentUser(sid?: string) {
  if (sid) {
    const session = await prisma.session.findFirst({
      where: { sid },
      select: { currentUserId: true }
    });

    if (session && session.currentUserId) {
      return await prisma.user.findFirst({
        where: { id: session.currentUserId },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
          picture: true,
          vendorId: true,
          username: true
        }
      });
    }
  }

  return null;
}

export async function getSavedAccounts(sid?: string) {
  if (sid) {
    const result = await prisma.session.findFirst({
      where: { sid },
      select: { savedAccounts: true }
    });
    if (result?.savedAccounts) {
      const ids = result.savedAccounts.split(",");
      return await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, username: true, picture: true }
      });
    }
  }

  return null;
}

export function formatUserData(user: Partial<User>) {
  return pick(user, ["id", "name", "role", "email", "picture", "vendorId", "username"]);
}
