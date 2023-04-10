import { prisma } from "$lib/utilities/prisma.server";

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
          picture: true,
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
