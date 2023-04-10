import { verify } from "argon2";
import { fail } from "@sveltejs/kit";
import { setFlash, redirect } from "sveltekit-flash-message/server";
import { superValidate, setError } from "sveltekit-superforms/server";

import { pick } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import { loginSchema } from "$lib/utilities/zod-schema";

export const actions = {
  async credentials(event) {
    await rateLimit(event, { max: 5, window: 5 });
    const form = await superValidate(event, loginSchema);
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: form.data.login }, { email: form.data.login }]
      }
    });

    if (!user) {
      setError(form, "login", "Invalid username or email address.");
      return fail(400, { form });
    }

    if (!(await verify(user.password, form.data.password))) {
      setError(form, "password", "Invalid password.");
      return fail(400, { form });
    }

    let savedAccounts: string | undefined = undefined;

    if (form.data.saveLogin) {
      const result = await prisma.session.findFirst({
        select: { savedAccounts: true },
        where: { sid: event.locals.sid }
      });

      if (result?.savedAccounts && !result.savedAccounts.includes(user.id)) {
        savedAccounts = `${user.id},${result.savedAccounts}`;
      } else {
        savedAccounts = user.id;
      }
    }

    await prisma.session.upsert({
      where: { sid: event.locals.sid },
      update: { currentUserId: user.id, savedAccounts },
      create: {
        savedAccounts,
        sid: event.locals.sid,
        currentUserId: user.id,
        userAgent: event.request.headers.get("user-agent")
      }
    });

    setFlash(
      {
        id: "auth",
        type: "success",
        message: `You're now logged in as ${user.name}.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/");
    } else {
      return {
        form,
        currentUser: pick(user, ["id", "name", "role", "picture", "username"])
      };
    }
  }
};
