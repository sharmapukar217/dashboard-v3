import { fail } from "@sveltejs/kit";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { setError, superValidate } from "sveltekit-superforms/server";

import { mailer } from "$lib/utilities/mailer";
import { omit } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { getCurrentUser } from "$lib/functions/auth.server";
import { updatePackageInfoSchema } from "$lib/utilities/zod-schema";
import { getPackageById } from "$lib/functions/package.server";

export async function load(event) {
  const { currentUser } = await event.parent();
  const form = await superValidate(updatePackageInfoSchema);

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

  const packageInfo = await getPackageById(currentUser, event.params.id);

  if (!packageInfo) {
    throw redirect(
      "/packages",
      {
        type: "error",
        id: "packageInfo",
        dismissable: false,
        message: "Package details not found or was deleted!"
      },
      event
    );
  }

  form.data = {
    ...omit(packageInfo, ["vendor"]),
    vendorName: packageInfo.vendor.vendorName
  };

  return { form, packageInfo };
}

export const actions = {
  async default(event) {
    const currentUser = await getCurrentUser(event.locals.sid);
    const form = await superValidate(event.request, updatePackageInfoSchema);

    if (!form.valid) return fail(400, { form });

    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    let mainVendorId: string | undefined = undefined;

    if (!currentUser) {
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

    const packageInfo = await getPackageById(event.params.id);

    if (!packageInfo) {
      throw redirect(
        "/packages",
        {
          id: "users",
          type: "error",
          dismissable: false,
          message: "Package details not found or was deleted!"
        },
        event
      );
    }

    

    if (shouldRedirect) {
      throw redirect(301, "/packages");
    } else {
      return { form, updatedPackageInfo: await getPackageById(event.params.id) };
    }
  }
};
