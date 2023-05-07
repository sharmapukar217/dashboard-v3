import { hash } from "argon2";
import { fail } from "@sveltejs/kit";
import { createSigner } from "fast-jwt";
import { setFlash, redirect } from "sveltekit-flash-message/server";
import { superValidate, setError } from "sveltekit-superforms/server";

import { mailer } from "$lib/utilities/mailer";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import { addUserSchema } from "$lib/utilities/zod-schema";
import { omit, generatePassword } from "$lib/utilities/functions";

export const actions = {
  async default(event) {
    await rateLimit(event, { max: 5, window: 5 });
    let mainVendorId: string | undefined = undefined;
    const form = await superValidate(event, addUserSchema);
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    if (!form.valid) return fail(400, { form });

    let vendorId: string | undefined = undefined;
    form.data.vendorName = form.data.vendorName.toUpperCase();

    const vendor = await prisma.vendor.findFirst({
      where: { vendorName: form.data.vendorName },
      select: { id: true }
    });

    if (!vendor) {
      setError(form, "vendorName", "The vendor with provided name doesn't exist.");
      return fail(400, { form });
    }

    vendorId = vendor.id;

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
      form.data.username = undefined;
    }

    const {
      autoGeneratePassword,
      sendInvitationLink,
      confirmPassword: _c,
      vendorName,
      ...data
    } = form.data;

    if (sendInvitationLink) {
      const token = await createSigner({
        key: async () => process.env.INVITATION_TOKEN_SECRET
      })({ vendorName, email: form.data.email, name: form.data.name, role: form.data.role });

      const oldTokens = await prisma.token.findMany({
        select: { id: true },
        where: {
          AND: [{ identifier: form.data.email }, { tokenType: "ACCOUNT_SETUP" }]
        }
      });

      const ids = oldTokens.map((token) => token.id);
      if (ids.length) {
        await prisma.token.deleteMany({ where: { id: { in: ids } } });
      }

      await prisma.token.create({
        data: {
          token,
          identifier: form.data.email,
          tokenType: "ACCOUNT_SETUP"
        }
      });

      await mailer.sendMail({
        to: form.data.email,
        from: process.env.EMAIL_FROM,
        subject: `Account creation invitation`,
        html: `
      <span>Hi, ${form.data.name}! You've been invited to create an ${form.data.role} account for the vendor ${form.data.vendorName}.</span>
      Click <a href="${process.env.PUBLIC_HOST_NAME}/register?token=${token}">this link</a> to setup your account.
      <br />
    `
      });

      setFlash(
        {
          type: "success",
          id: "create-user",
          message: `An invitation link to the user was sent for account creation.`
        },
        event
      );

      // generate invitation token and send email

      if (shouldRedirect) {
        throw redirect(301, "/users");
      } else {
        return { form };
      }
    } else {
      let _autoGeneratedPassword = undefined;
      if (autoGeneratePassword) {
        _autoGeneratedPassword = generatePassword(12);
        data.password = _autoGeneratedPassword;
      }

      const picture = encodeURI(`https://ui-avatars.com/api/?name=${data.name}`);

      const newUser = await prisma.user.create({
        data: { ...data, vendorId, picture, password: await hash(data.password) },
        include: { vendor: true }
      });

      if (autoGeneratePassword) {
        setFlash(
          {
            type: "success",
            id: "create-user",
            message: `An email with credentials was send to ${newUser.email}.`
          },
          event
        );
      } else {
        setFlash(
          {
            type: "success",
            id: "create-user",
            message: `A new user ${newUser.name}\` was created successfully.`
          },
          event
        );
      }

      await mailer.sendMail({
        to: newUser.email,
        from: process.env.EMAIL_FROM,
        subject: `New user ${newUser.name} for vendor ${newUser.vendor.vendorName} created.`,
        html: _autoGeneratedPassword
          ? `<span>A user <b>${newUser.name}</b> was registered successfully. You can now login to your account using the following credentials: username: <b>${newUser.username}</b>, password (temporary): <b>${_autoGeneratedPassword}</b>
      <br />
      <strong>Don't forget to update your password.</strong>`
          : `<span>A user <b>${newUser.name}</b> was registered successfully. You can now login to your account using your credentials.</span>`
      });

      if (shouldRedirect) {
        throw redirect(301, "/users");
      } else {
        return { form, newUser: omit(newUser, ["password"]) };
      }
    }
  }
};
