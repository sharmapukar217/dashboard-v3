import { fail } from "@sveltejs/kit";
import { verify, hash } from "argon2";
import { setFlash, redirect } from "sveltekit-flash-message/server";
import { setError, superValidate } from "sveltekit-superforms/server";

import { omit, pick } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import {
  getSavedAccounts,
  getUserSessions,
  getCurrentUser,
  formatUserData,
  getConnectedAccounts
} from "$lib/functions/auth.server";
import { reportSchema, profileSchema, updateVendorSchema, updatePasswordSchema } from "$lib/utilities/zod-schema";

export async function load({ parent, locals }) {
  const { currentUser } = await parent();

  const profileForm = await superValidate(profileSchema, {
    id: "profile-form"
  });

  if (currentUser) {
    profileForm.data = currentUser;
  }

  const vendorForm = await superValidate(updateVendorSchema, {
    id: "vendor-form"
  });

  const vendor = await prisma.vendor.findFirst({
    where: { id: currentUser.vendorId },
    select: { vendorName: true, vendorEmail: true, vendorAddress: true, mainVendor: true }
  });

  if (vendor) {
    vendorForm.data = {
      ...omit(vendor, ["mainVendor"]),
      mainVendorName: vendor.mainVendor?.vendorName
    };
  }

  const userSessions = await getUserSessions(currentUser?.id, locals.sid);
  const connectedAccounts = await getConnectedAccounts(currentUser?.id);
  const savedAccounts = await getSavedAccounts(locals.sid)

  return { profileForm, vendorForm, userSessions, connectedAccounts, savedAccounts };
}

export const actions = {

  async report(event) {
    await rateLimit(event, { max: 5, window: 5 });

    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");
    const reportForm = await superValidate(event.request, reportSchema, {
      id: "report-form"
    });

    if (!reportForm.valid) return fail(400, { reportForm });

    const user = await getCurrentUser(event.locals.sid);

    if (!user) {
      throw redirect(
        "/login",
        {
          id: "auth",
          type: "error",
          message: "Please login to your account to continue.",
          dismissable: false
        },
        event
      );
    }

    // add report
    await prisma.userReport.create({
      data: {
        ...pick(reportForm.data, ["userId", "reportType", "description", "screenshots"]),
        userId: user.id
      }
    });

    setFlash({
      id: "report",
      type: "success",
      message: "Your report was submitted to the admins."
    }, event);

    if (shouldRedirect) throw redirect(301, "/settings");
    else return { reportForm };
  },

  async updateProfile(event) {
    await rateLimit(event, { max: 5, window: 5 });

    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");
    const profileForm = await superValidate(event.request, profileSchema, {
      id: "profile-form"
    });

    if (!profileForm.valid) return fail(400, { profileForm });

    const user = await getCurrentUser(event.locals.sid);

    if (!user) {
      throw redirect(
        "/login",
        {
          id: "auth",
          type: "error",
          message: "Please login to your account to continue.",
          dismissable: false
        },
        event
      );
    }

    if (!!profileForm.data.email && profileForm.data.email !== user.email) {
      const emailExists = await prisma.user.count({
        where: {
          AND: [{ id: { not: user.id } }, { email: profileForm.data.email }]
        }
      });

      if (emailExists) {
        setError(profileForm, "email", "This email address is already in use.");
        return fail(400, { profileForm });
      }
    }

    if (!!profileForm.data.username?.trim()) {
      if (profileForm.data.username !== user.username) {
        const usernameExists = await prisma.user.count({
          where: {
            AND: [{ id: { not: user.id } }, { username: profileForm.data.username }]
          }
        });

        if (usernameExists) {
          setError(profileForm, "username", "This username address is already in use.");
          return fail(400, { profileForm });
        }
      }
    } else {
      profileForm.data.username = undefined;
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: profileForm.data
    });

    if (updatedProfile) {
      profileForm.data.name = updatedProfile.name;
      profileForm.data.email = updatedProfile.email;
      profileForm.data.username = updatedProfile.username;
    }

    setFlash(
      {
        type: "success",
        id: "update-profile",
        message: `Your profile is updated successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/settings");
    } else {
      return { profileForm, updatedProfile: formatUserData(updatedProfile) };
    }
  },
  async updateVendorInfo(event) {
    await rateLimit(event, { max: 5, window: 5 });

    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");
    const vendorForm = await superValidate(event.request, updateVendorSchema, {
      id: "vendor-form"
    });

    if (!vendorForm.valid) return fail(400, { vendorForm });

    const user = await getCurrentUser(event.locals.sid);

    if (!user) {
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

    vendorForm.data.vendorName = vendorForm.data.vendorName.toUpperCase();
    const vendor = await prisma.vendor.findFirstOrThrow({
      where: { id: user.vendorId },
      select: { id: true, vendorName: true, vendorEmail: true }
    });

    if (!!vendorForm.data.vendorName && vendorForm.data.vendorName !== vendor.vendorName) {
      const nameExists = await prisma.vendor.count({
        where: { vendorName: vendorForm.data.vendorName }
      });

      if (nameExists) {
        setError(vendorForm, "vendorName", "A vendor with this name already exists.");
        return fail(400, { vendorForm });
      }
    }

    if (!!vendorForm.data.vendorEmail && vendorForm.data.vendorEmail !== vendor.vendorEmail) {
      const emailExists = await prisma.vendor.count({
        where: {
          AND: [{ id: { not: vendor.id } }, { vendorEmail: vendorForm.data.vendorEmail }]
        }
      });

      if (emailExists) {
        setError(vendorForm, "vendorEmail", "This email address is already in use.");
        return fail(400, { vendorForm });
      }
    }

    const updatedVendor = await prisma.vendor.update({
      data: vendorForm.data,
      where: { id: vendor.id },
      select: {
        id: true,
        vendorName: true,
        vendorEmail: true,
        vendorAddress: true,
        mainVendor: true
      }
    });

    setFlash(
      {
        type: "success",
        id: "update-vendor",
        message: `The info about your vendor is updated successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/settings");
    } else {
      return { vendorForm, updatedVendor };
    }
  },
  async updatePassword(event) {
    await rateLimit(event, { max: 5, window: 5 });
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");
    const updatePasswordForm = await superValidate(event.request, updatePasswordSchema, {
      id: "update-password-form"
    });

    if (!updatePasswordForm.valid) return fail(400, { updatePasswordForm });

    const session = await prisma.session.findFirst({
      where: { sid: event.locals.sid },
      select: { currentUser: true }
    });

    if (!session?.currentUser) {
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

    const isValid = await verify(
      session.currentUser.password,
      updatePasswordForm.data.currentPassword
    );

    if (!isValid) {
      setError(updatePasswordForm, "currentPassword", "Invalid password.");
      return fail(400, { updatePasswordForm });
    }

    if (updatePasswordForm.data.currentPassword === updatePasswordForm.data.newPassword) {
      setError(updatePasswordForm, "newPassword", "Your new password shouldn't match the old one.");
      return fail(400, { updatePasswordForm });
    }

    await prisma.user.update({
      where: { id: session.currentUser.id },
      data: { password: await hash(updatePasswordForm.data.newPassword) }
    });

    setFlash(
      {
        type: "success",
        id: "update-password",
        message: `Your password was updated successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/settings");
    } else {
      return { updatePasswordForm, success: true };
    }
  },
  async revokeSession(event) {
    const sid = (await event.request.formData()).get("sid");
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

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

    const data: any = {};

    const selectedSession = await prisma.session.findFirst({
      where: { sid },
      select: { currentUserId: true, savedAccounts: true }
    });

    // handle logout
    if (selectedSession.currentUserId === currentUser.id) {
      data.currentUser = { disconnect: true };
    }

    // handle remove from saved list
    if (selectedSession.savedAccounts?.includes(currentUser.id)) {
      const savedAccounts = selectedSession.savedAccounts
        .split(",")
        .filter((id) => id !== currentUser.id);
      data.savedAccounts = savedAccounts.join(",");
    }

    await prisma.session.update({ where: { sid }, data });

    setFlash(
      { id: "auth", type: "info", message: "Account logged out from the selected device." },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/settings");
    } else {
      return {};
    }
  }
};
