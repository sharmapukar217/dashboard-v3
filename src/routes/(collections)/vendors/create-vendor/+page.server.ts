import { fail } from "@sveltejs/kit";
import { setFlash, redirect } from "sveltekit-flash-message/server";
import { superValidate, setError } from "sveltekit-superforms/server";

import { mailer } from "$lib/utilities/mailer";
import { omit } from "$lib/utilities/functions";
import { prisma } from "$lib/utilities/prisma.server";
import { rateLimit } from "$lib/utilities/utils.server";
import { addVendorSchema } from "$lib/utilities/zod-schema";

export const actions = {
  async default(event) {
    await rateLimit(event, { max: 5, window: 5 });
    let mainVendorId: string | undefined = undefined;
    const form = await superValidate(event, addVendorSchema);
    const shouldRedirect = !event.request.headers.get("x-sveltekit-action");

    if (!form.valid) return fail(400, { form });

    form.data.vendorName = form.data.vendorName.toUpperCase();

    if (form.data.mainVendorName) {
      const parentVendor = await prisma.vendor.findFirst({
        where: { vendorName: form.data.mainVendorName },
        select: { id: true }
      });
      if (!parentVendor) {
        setError(form, "mainVendorName", "The vendor with provided name doesn't exists");
        return fail(400, { form });
      }
      mainVendorId = parentVendor.id;
    }

    const vendorNamaeExists = await prisma.vendor.count({
      where: { vendorName: form.data.vendorName }
    });

    if (vendorNamaeExists) {
      setError(form, "vendorName", "A vendor with provided name already exists.");
      return fail(400, { form });
    }

    const vendorEmailExists = await prisma.vendor.count({
      where: { vendorEmail: form.data.vendorEmail }
    });

    if (vendorEmailExists) {
      setError(form, "vendorEmail", "This email address is already in use.");
      return fail(400, { form });
    }

    const newVendor = await prisma.vendor.create({
      data: { ...omit(form.data, ["mainVendorName"]), mainVendorId }
    });

    await mailer.sendMail({
      to: newVendor.vendorEmail,
      from: process.env.EMAIL_FROM,
      subject: `New vendor ${newVendor.vendorName} registered`,
      html: `<span>A vendor <b>${newVendor.vendorName}</b> was registered successfully using this email address. You might soon receive your credentials or an account setup email.</span>`
    });

    setFlash(
      {
        type: "success",
        id: "create-vendor",
        message: `A new vendor \`${newVendor.vendorName}\` was created successfully.`
      },
      event
    );

    if (shouldRedirect) {
      throw redirect(301, "/vendors");
    } else {
      return { form, newVendor };
    }
  }
};
