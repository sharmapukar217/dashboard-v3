import type { RequestHandler } from "./$types";
import { PUBLIC_HOST_NAME } from "$env/static/public";
import { redirect } from "sveltekit-flash-message/server";
import { OAuthService, type Provider } from "$lib/utilities/oauth.server";
import { prisma } from "$lib/utilities/prisma.server";
import { getCurrentUser } from "$lib/functions/auth.server";


export const GET = async function (event) {
  const url = new URL(event.request.url);
  const provider = event.params.provider as Provider;
  const referer = event.request.headers.get("referer") || "/login";
  const redirect_uri = `${PUBLIC_HOST_NAME}/oauth/${provider}/callback`;

  // disable caching request
  event.setHeaders({ "cache-control": "no-cache" });

  const oauth = new OAuthService({ provider, redirect_uri });

  if (!oauth.provider) {
    throw redirect(
      referer,
      { id: "auth", type: "error", message: `Unsupported provider \`${provider}\`.` },
      event
    );
  }

  const action = url.searchParams.get("action") || "login";

  if (action === "link-account") {
    const currentUser = await getCurrentUser(event.locals.sid);
    if (!currentUser) {
      throw redirect(
        referer,
        {
          id: "auth",
          type: "error",
          message: "You need to login to your account to link social accounts."
        },
        event
      );
    }

    const isLinked = await prisma.account.count({
      where: { AND: [{ provider }, { userId: currentUser.id }] }
    });

    if(isLinked) {
     throw redirect(
        referer,
        { id: "auth", type: "info", message: `This account is already linked to ${provider}.` },
        event
      ); 
    }

  }

  await event.cookies.set("action", action, { path: "/oauth" });
  await event.cookies.set("referer", referer, { path: "/oauth" });
  throw redirect(301, oauth.getAuthorizeUrl())
} satisfies RequestHandler;
