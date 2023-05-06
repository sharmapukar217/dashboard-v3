import { hash } from "argon2"
import { error, fail } from "@sveltejs/kit";
import { createVerifier } from "fast-jwt";
import { pick } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { redirect } from "sveltekit-flash-message/server";
import { superValidate, setError } from "sveltekit-superforms/server";
import { addUserSchema } from "$lib/utilities/zod-schema";

export async function load(event) {
  const token = event.url.searchParams.get("token");

  if (token) {
    const savedToken = await prisma.token.findFirst({
      where: {
        AND: [{ token }, { tokenType: "ACCOUNT_SETUP" }]
      }
    });
    if (savedToken) {
      const decodedToken = await createVerifier({
        key: async () => process.env.INVITATION_TOKEN_SECRET
      })(savedToken.token);
      if (decodedToken) {
        const form = await superValidate(addUserSchema);
        form.data = decodedToken;
        return { form };
      }
    }
  }

  throw error(404, "Not Found");
}

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, addUserSchema);
    if (!form.valid) return fail(400, { form });

	const token = event.url.searchParams.get("token");
	if(!token) {
    	throw redirect({ id: "auth", type: "error", message: "An error occured while trying to setup your account." }, event);
	}

    const savedToken = await prisma.token.findFirst({
      where: {
        AND: [{ token }, { tokenType: "ACCOUNT_SETUP" }]
      }
    });

    if(!savedToken) {
    	throw redirect({ id: "auth", type: "error", message: "An error occured while trying to setup your account." }, event);
    }

    const emailExists = await prisma.user.count({
      where: { email: form.data.email }
    });

    if (emailExists) {
      setError(form, "email", "An user with provided email already exists.");
      return fail(400, { form });
    }

    if (!!form.data.username?.trim()) {
      const usernameExists = await prisma.user.count({
        where: { username: form.data.username }
      });

      if (usernameExists) {
        setError(form, "username", "Username already taken.");
        return fail(400, { form });
      }
    } else {
      form.data.username=undefined
    }

    const vendor = await prisma.vendor.findFirst({
    	select: { id: true },
    	where: { vendorName: form.data.vendorName }
    });

    if(!vendor) {
    	throw redirect({ id: "auth", type: "error", message: "An error occured while trying to setup your account." }, event);
    }

  const picture = encodeURI(`https://ui-avatars.com/api/?name=${form.data.name}`);

  	console.log(pick(form.data, ["name", "email", "username", "role", "password"]))
    await prisma.user.create({
    	data: {
    		...pick(form.data, ["name", "email", "username", "role", "password"]),
    		password: await hash(form.data.password),
    		vendorId: vendor.id,
    		picture
    	}
    });

    await prisma.token.delete({
    	where: { id: savedToken.id }
    });

    throw redirect("/login", {
    	id: "auth",
    	type: "success",
    	message: "Your account was created successfully. You can now login to your account."
    }, event);
  }
};
