import { fail } from "@sveltejs/kit";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { setError, superValidate } from "sveltekit-superforms/server";

import { omit } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import { getCurrentUser } from "$lib/functions/auth.server";
import { updateVendorSchema } from "$lib/utilities/zod-schema";
import { getVendorById } from "$lib/functions/vendor.server";

export async function load(event) {
  await event.parent();
  const form = await superValidate(updateVendorSchema);
  const vendor = await getVendorById(event.params.id);

  if (!vendor) {
    throw redirect(
      "/vendors",
      {
        id: "vendors",
        type: "error",
        message: "Vendor details not found or was deleted!",
        dismissable: false
      },
      event
    );
  }

  form.data = {
    ...omit(vendor, ["mainVendor"]),
    mainVendorName: vendor.mainVendor?.vendorName
  };

  return { form, vendor };
}

export const actions = {
  async default(event) {
    await rateLimit(event, { max: 5, window: 5 });
    const user = await getCurrentUser(event.locals.sid);
    const form = await superValidate(event.request, updateVendorSchema);
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

  if (!form.valid) return fail(400, { form });
    

    let mainVendorId: string | undefined = undefined;

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

    const vendor = await getVendorById(event.params.id);

    if (!vendor) {
      throw redirect(
        "/vendors",
        {
          id: "vendors",
          type: "error",
          message: "Vendor details not found or was deleted!",
          dismissable: false
        },
        event
      );
    }

    if (form.data.vendorName) {
      form.data.vendorName = form.data.vendorName.toUpperCase();
    }

    if (form.data.mainVendorName) {
      form.data.mainVendorName = form.data.mainVendorName.toUpperCase();
    }

    if (
      vendor.mainVendor?.vendorName &&
      !!form.data.mainVendorName !== vendor.mainVendor?.vendorName
    ) {
      const mainVendor = await prisma.vendor.findFirst({
        where: { vendorName: form.data.mainVendorName },
        select: { id: true }
      });

      if (!mainVendor) {
        setError(form, "mainVendorName", "A vendor with provided name doesn't exists.");
        return fail(400, { form });
      }

      mainVendorId = mainVendor.id;
    }

    if (!!form.data.vendorName && form.data.vendorName !== vendor.vendorName) {
      const nameExists = await prisma.vendor.count({
        where: {
          AND: [{ id: { not: vendor.id } }, { vendorName: form.data.vendorName }]
        }
      });

      if (nameExists) {
        setError(form, "vendorName", "A vendor with this name already exists.");
        return fail(400, { form });
      }
    }

    if (!!form.data.vendorEmail && form.data.vendorEmail !== vendor.vendorEmail) {
      const emailExists = await prisma.user.count({
        where: {
          AND: [{ id: { not: vendor.id } }, { vendorEmail: form.data.vendorEmail }]
        }
      });

      if (emailExists) {
        setError(form, "vendorEmail", "This email address is already in use.");
        return fail(400, { form });
      }
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        ...omit(form.data, ["mainVendorName"]),
        mainVendorId
      }
    });

    setFlash(
      {
        type: "success",
        id: "update-vendor",
        message: `The vendor details was updated successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/vendors");
    } else {
      return { form, updatedVendor: await getVendorById(event.params.id) };
    }
  }
};
