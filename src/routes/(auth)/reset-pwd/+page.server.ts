import { hash } from "argon2";
import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createSigner, createDecoder } from "fast-jwt";
import { redirect } from "sveltekit-flash-message/server";
import { setError, superValidate } from "sveltekit-superforms/server";

import { mailer } from "$lib/utilities/mailer";
import { prisma } from "$lib/utilities/prisma.server";
import { generateOtp } from "$lib/utilities/functions";
import { rateLimit } from "$lib/utilities/utils.server";
import { resetPasswordSchema } from "$lib/utilities/zod-schema";

export const actions = {
  async requestReset(event) {
    await rateLimit(event, { max: 3, window: 60 * 5 });
    const form = await superValidate(event.request, resetPasswordSchema);

    if (!form.valid) return fail(400, { form });

    const userExists = await prisma.user.count({
      where: { email: form.data.email }
    });

    if (!userExists) {
      setError(form, "email", "User with provided email address doesn't exists.");
      return fail(400, { form });
    }

    const otp = generateOtp();

    const token = await createSigner({
      expiresIn: 1000 * 60 * 60 * 24 * 2, // 2 days
      key: async () => env.PASSWORD_RESET_TOKEN_SECRET
    })({ otp });

    const oldTokens = await prisma.token.findMany({
      select: { id: true },
      where: {
        AND: [{ identifier: form.data.email }, { tokenType: "PASSWORD_RESET" }]
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
        tokenType: "PASSWORD_RESET"
      }
    });

    await mailer.sendMail({
      to: form.data.email,
      from: process.env.EMAIL_FROM,
      subject: `Password reset link`,
      html: `
      <span>As per your request, we have sent you this password reset email.</span>
      <span>Your password reset otp is: <b>${otp}</b></span>
      or, click <a href="${process.env.PUBLIC_HOST_NAME}/reset-pwd?token=${token}&email=${form.data.email}">this link</a> to reset your password.
      <strong>Please reset your password within two hours.</strong>
      <br />
      <small>If you're not the one who request this, you can safely ignore this email.</small>
    `
    });

    throw redirect(
      `/reset-pwd?step=2&email=${form.data.email}`,
      {
        id: "reset-password",
        type: "info",
        message: "An email has been sent with password reset token."
      },
      event
    );
  },
  async verifyResetPwdOtp(event) {
    const form = await superValidate(event.request, resetPasswordSchema);

    if (!form.valid) return fail(400, { form });

    const tokenFromDB = await prisma.token.findFirst({
      where: {
        AND: [{ identifier: form.data.email }, { tokenType: "PASSWORD_RESET" }]
      }
    });

    if (!tokenFromDB) {
      setError(form, "otp", "Invalid or expired otp entered.");
      return fail(400, { form });
    }

    const decodedToken = createDecoder()(tokenFromDB.token);

    if (decodedToken?.otp !== form.data.otp) {
      setError(form, "otp", "Invalid or expired otp entered.");
      return fail(400, { form });
    }

    throw redirect(
      `/reset-pwd?email=${form.data.email}&otp=${form.data.otp}`,
      {
        id: "reset-password",
        type: "info",
        message: "Please proceed to change your password."
      },
      event
    );
  },
  async resetPassword(event) {
    const form = await superValidate(event.request, resetPasswordSchema);
    if (!form.valid) return fail(400, { form });

    if (!form.data.otp && !form.data.token) {
      throw redirect(
        {
          id: "reset-pwd",
          type: "error",
          message: "An error occured while trying to reset your password."
        },
        event
      );
    }

    const tokenFromDB = await prisma.token.findFirst({
      where: {
        AND: [
          { tokenType: "PASSWORD_RESET" },
          { OR: [{ identifier: form.data.email }, { token: form.data.token }] }
        ]
      }
    });

    if (!tokenFromDB) {
      throw redirect(
        {
          id: "reset-pwd",
          type: "error",
          message: "An error occured while trying to reset your password."
        },
        event
      );
    }

    const decodedToken = createDecoder()(tokenFromDB.token);

    if (form.data.otp && decodedToken?.otp !== form.data.otp) {
      throw redirect(
        {
          id: "reset-pwd",
          type: "error",
          message: "An error occured while trying to reset your password."
        },
        event
      );
    }

    await prisma.user.update({
      where: { email: form.data.email },
      data: {
        password: await hash(form.data.newPassword)
      }
    });

    await prisma.token.delete({
      where: { id: tokenFromDB.id }
    });

    throw redirect(
      "/login",
      {
        type: "success",
        id: "reset-password",
        message: "Your password was successfully reset. You can now login to your account."
      },
      event
    );
  }
};
