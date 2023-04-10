import type { RequestHandler } from "./$types";
import { PUBLIC_HOST_NAME } from "$env/static/public";
import { redirect } from "sveltekit-flash-message/server";

import { prisma } from "$lib/utilities/prisma.server";
import { getCurrentUser } from "$lib/functions/auth.server";
import { OAuthService, type Provider } from "$lib/utilities/oauth.server";

export const GET: RequestHandler = async function (event) {
  const url = new URL(event.request.url);
  const action = event.cookies.get("action");
  const provider = event.params.provider as Provider;
  const referer = event.cookies.get("referer") ?? "/login";
  const redirect_uri = `${PUBLIC_HOST_NAME}/oauth/${provider}/callback`;

  
  // disable caching request
  event.setHeaders({ "cache-control": "no-cache" });

  // remove cookie
  await event.cookies.delete("action", { path: "/oauth" });
  await event.cookies.delete("referer", { path: "/oauth" });

  const oauth = new OAuthService({ provider, redirect_uri });

  const token = await oauth.getAccessToken({
    code: url.searchParams.get("code") as string
  });

  if (!token) {
    throw redirect(
      referer,
      {
        id: "auth",
        type: "error",
        message: "An error occured while trying to request access token."
      },
      event
    );
  }

  const providerUser = await oauth.getUser({
    token: token?.access_token
  });

  if (!providerUser) {
    throw redirect(
      referer,
      {
        id: "auth",
        type: "error",
        message: "An error occured while trying to request user details."
      },
      event
    );
  }

  if (action === "link-account") {
    const user = await getCurrentUser(event.locals.sid);

    if (!user) {
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


    const isAlreadyUsed = await prisma.account.count({
      where: { providerAccountId: providerUser.id }
    });

    if (isAlreadyUsed) {
      throw redirect(
        referer,
        { id: "auth", type: "warning", message: `This account is already linked to another account.` },
        event
      );
    }


    const isLinked = await prisma.account.count({
      where: { AND: [{ provider }, { userId: user.id }] }
    });

    if(isLinked) {
     throw redirect(
        referer,
        { id: "auth", type: "info", message: `This account is already linked to ${provider}.` },
        event
      ); 
    }

    await prisma.account.create({
      data: {
        provider,
        type: "oauth",
        userId: user.id,
        expiresIn: token.expires_in,
        accessToken: token.access_token,
        scope: oauth.config.params.scope,
        providerAccountId: String(providerUser.id)
      }
    });
    throw redirect(
      referer,
      { id: "auth", type: "success", message: `Your account is now linked to ${provider}.` },
      event
    );
  } else {
    const accountWithUser = await prisma.account.findFirst({
      where: { providerAccountId: String(providerUser.id) },
      include: { user: true }
    });

    if (!accountWithUser) {
      throw redirect(
        referer,
        { id: "auth", type: "warning", message: "No user found. Do you mean to link account?" },
        event
      );
    }

    await prisma.session.update({
      where: { sid: event.locals.sid },
      data: {
        currentUserId: accountWithUser.user.id
      }
    });

    throw redirect(
      "/",
      { id: "auth", type: "info", message: `Welcome, ${accountWithUser.user.name}.` },
      event
    );
  }
};
