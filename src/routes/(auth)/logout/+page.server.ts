import { prisma } from "$lib/utilities/prisma.server";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { getCurrentUser } from "$lib/functions/auth.server";

export const actions = {
  async logout(event) {
    await prisma.session.update({
      where: { sid: event.locals.sid },
      data: {
        currentUser: { disconnect: true }
      }
    });

    throw redirect(
      "/login",
      { id: "auth", type: "success", message: "You're now logged out from your account." },
      event
    );
  },
  async revokeAll(event) {
    const currentUser = await getCurrentUser(event.locals.sid);
    const userSessions = await prisma.session.findMany({
      where: {
        AND: [
          {
            sid: { not: event.locals.sid }
          },
          {
            OR: [{ currentUserId: currentUser.id }, { savedAccounts: { contains: currentUser.id } }]
          }
        ]
      }
    });

    for (const userSession of userSessions) {
      const data: any = {};
      if (userSession.currentUserId === currentUser.id) {
        data.currentUser = { disconnect: true };
      }
      if (userSession.savedAccounts.includes(currentUser.id)) {
        data.savedAccounts = userSession.savedAccounts
          .split(",")
          .filter((id) => id !== currentUser.id)
          .join(",");
      }
      await prisma.session.update({
        data,
        where: { sid: userSession.sid }
      });
    }

    setFlash(
      { id: "auth", type: "info", message: "You've been logged out from all other devices." },
      event
    );
    return {};
  }
};
