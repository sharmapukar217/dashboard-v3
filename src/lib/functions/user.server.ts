import { prisma } from "$lib/utilities/prisma.server";
import { getVendors } from "./vendor.server";

export async function getUsers(userId?: string) {
  const vendors = await getVendors(userId);
  const ids = vendors.map((v) => v.id);

  return await prisma.user.findMany({
    where: { vendorId: { in: ids } },
    select: {
      id: true,
      name: true,
      role: true,
      picture: true,
      username: true,
      email: true,
      vendor: true
    }
  });
}

export async function getUserById(userId?: string) {
  return await prisma.user.findFirst({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      picture: true,
      username: true,
      email: true,
      vendor: true
    }
  });
}
