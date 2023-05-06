import { fail } from "@sveltejs/kit";
import { setFlash, redirect } from "sveltekit-flash-message/server";
import { superValidate, setError } from "sveltekit-superforms/server";

import { omit } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import { getCurrentUser } from "$lib/functions/auth.server";
import { addPackageInfoSchema } from "$lib/utilities/zod-schema";

export const actions = {
  async default(event) {
    await rateLimit(event, { max: 5, window: 5 });
    const currentUser = await getCurrentUser(event.locals.sid);

    const form = await superValidate(event, addPackageInfoSchema);
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    if (!form.valid) return fail(400, { form });

    const vendor = await prisma.vendor.findFirst({
      select: { id: true },
      where: { vendorName: form.data.vendorName }
    });

    if (!vendor) {
      setError(form, "vendorName", "A vendor with provided name doesn't exists.");
      return fail(400, { form });
    }

    const data: any = {
      ...omit(form.data, ["vendorName", "remarks"]),
      statusUpdatedBy: currentUser.id,
      vendorId: vendor.id
    };

    if (data.cod === 0) {
      data.customerPaymentMethod = "DIRECTLY_TO_VENDOR";
      data.customerPaymentVerifiedBy = currentUser.id;
      data.customerPaymentVerifiedAt = new Date();
      data.vendorPaymentMethod = "DIRECTLY_TO_VENDOR";
      data.vendorPaymentVerifiedAt = new Date();
      data.deliveryCharge = 0;
      data.vendorPaymentVerifiedBy = currentUser.id;
    }

    const newPackage = await prisma.package.create({
      data,
      include: {
        vendor: {
          select: { vendorName: true }
        }
      }
    });

    setFlash(
      {
        id: "packages",
        type: "success",
        message: `New package info added successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/packages");
    } else {
      return { form, newPackage };
    }
  }
};
