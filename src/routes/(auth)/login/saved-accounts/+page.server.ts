import { setFlash, redirect } from "sveltekit-flash-message/server";

import { pick } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { getSavedAccounts } from "$lib/functions/auth.server";

export async function load(event) {
  return {
    savedAccounts: getSavedAccounts(event.locals.sid)
  };
}

export const actions = {
  async login(event) {
    const userId = event.url.searchParams.get("userId");
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    if (userId) {
      const exists = await prisma.session.count({
        where: {
          AND: [
            {
              savedAccounts: { contains: userId }
            }
          ]
        }
      });

      if (exists) {
        const user = await prisma.user.findFirst({
          where: { id: userId }
        });

        if (user) {
          await prisma.session.update({
            where: { sid: event.locals.sid },
            data: {
              currentUserId: user.id
            }
          });
          setFlash({ type: "info", id: "auth", message: `Welcome ${user.name}.` }, event);

          if (shouldRedirect) {
            throw redirect(301, "/");
          } else {
            return {
              currentUser: pick(user, ["id", "name", "username", "role", "picture"])
            };
          }
        }
      }
    }

    throw redirect(
      { id: "auth", type: "error", message: "Couldn't login to this account at this moment." },
      event
    );
  },
  async remove(event) {
    const userId = event.url.searchParams.get("userId");
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    if (userId) {
      const result = await prisma.session.findFirst({
        where: {
          AND: [
            {
              savedAccounts: { contains: userId }
            }
          ]
        },
        select: { savedAccounts: true }
      });

      if (result?.savedAccounts) {
        const savedAccounts = result.savedAccounts
          .split(",")
          .filter((id) => id !== userId)
          .join(",");
        await prisma.session.update({
          where: { sid: event.locals.sid },
          data: { savedAccounts }
        });
        setFlash({ id: "auth", type: "success", message: "Account removed successfully." }, event);
        if (!shouldRedirect) {
          return { removed: true };
        } else {
          throw redirect(301, event.request.url);
        }
      }
    }

    setFlash(
      { id: "auth", type: "error", message: "Couldn't remove this account at this moment." },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, event.request.url);
    } else {
      return { removed: false };
    }
  }
};
