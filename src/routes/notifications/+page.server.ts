import { prisma } from "$lib/utilities/prisma.server";
import { setFlash } from "sveltekit-flash-message/server";
import { getCurrentUser } from "$lib/functions/auth.server";

export const actions = {
  async subscribe(event) {
    const formData = Object.fromEntries(await event.request.formData());
    const currentUser = await getCurrentUser(event.locals.sid);
    await prisma.pushSubscription.create({
      data: { subscription: JSON.stringify(formData.subscription), userId: currentUser.userId }
    });
    setFlash({ id: "webpush", type: "info", message: "Subscribed for push notifications." }, event);
    return {};
  },
  async unsubscribe(event) {
    const formData = Object.fromEntries(await event.request.formData());
    const savedSubscription = await prisma.pushSubscription.findFirst({
      where: { subscription: JSON.stringify(formData.subscription) },
      select: { id: true }
    });
    if (savedSubscription) {
      await prisma.pushSubscription.delete({
        where: { id: savedSubscription.id }
      });
    }
    return {};
  }
};
