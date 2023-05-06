import { prisma } from "$lib/utilities/prisma.server";
import { redirect } from "sveltekit-flash-message/server";
import { getCurrentUser } from "$lib/functions/auth.server";

export async function GET(event) {
  const provider = event.params.provider;
  let referer = event.request.headers.get("referer");
  if (referer === event.request.url) referer = "/";

  const currentUser = await getCurrentUser(event.locals.sid);

  if (!currentUser) {
    throw redirect(
      "/login",
      {
        id: "auth",
        type: "error",
        dismissable: false,
        message: "Please login to your account to continue."
      },
      event
    );
  }

  const isConnected = await prisma.account.findFirst({
    where: {
      AND: [{ userId: currentUser.id }, { provider }]
    },
    select: { id: true }
  });

  if (!isConnected) {
    throw redirect(
      referer,
      {
        id: "oauth",
        type: "warning",
        dismissable: false,
        message: `Your account is not linked to ${provider}. Do you mean to link account?`
      },
      event
    );
  }

  await prisma.account.delete({
    where: { id: isConnected.id }
  });

  throw redirect(
    301,
    referer,
    {
      id: "oauth",
      type: "success",
      message: `Your account is now disconnected from ${event.params.provider}.`
    },
    event
  );
}
