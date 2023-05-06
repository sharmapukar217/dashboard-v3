import { prisma } from "$lib/utilities/prisma.server";

export async function getVendors(userId?: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { vendorId: true }
  });
  if (!user) return [];

  let ids = [user.vendorId];
  const vendors = new Map();

  while (true) {
    const subvendors = await prisma.vendor.findMany({
      orderBy: { id: "desc" },
      include: { mainVendor: true },
      where: { mainVendorId: { in: ids } }
    });

    if (subvendors.length === 0) break;

    ids = [];
    subvendors.forEach((s) => {
      ids.push(s.id);
      vendors.set(s.id, s);
    });
  }

  const userVendor = await prisma.vendor.findFirstOrThrow({
    include: {
      mainVendor: true
    },
    where: { id: user.vendorId }
  });
  vendors.set(userVendor.id, userVendor);

  return Array.from(vendors, ([_keys, values]) => values);
}

export async function getVendorById(vendorId: string) {
  return await prisma.vendor.findFirst({
    where: { id: vendorId },
    include: {
      mainVendor: {
        select: { vendorName: true }
      }
    }
  });
}
