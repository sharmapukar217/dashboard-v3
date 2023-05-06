import PushNotifications from "node-pushnotifications";
import { prisma } from "$lib/server/utilities/prisma";

const config: PushNotifications.Settings = {
  web: {
    vapidDetails: {
      subject: "mailto:logikinnepal@noreply.com",
      publicKey: process.env.PUBLIC_VAPID_KEY,
      privateKey: process.env.PRIVATE_VAPID_KEY
    }
  }
};

const pushService = new PushNotifications(config);

type SendPushNotificationParams = {
  filters?: string[];
  usernames: string[];
  data: PushNotifications.Data;
};

export async function sendPushNotification({ userIds, filters, data }: SendPushNotificationParams) {
  const dbResult = await prisma.pushSubscription.findMany({
    select: { subscription: true },
    where: { userId: { in: userIds } }
  });

  const subscriptions = dbResult.map(({ subscription }) => JSON.parse(subscription));
  return await pushService.send(subscriptions, data);
}
