import { getVendors } from "./vendor.server";
import { prisma } from "$lib/utilities/prisma.server";

export async function getPackages(user: any) {
  if (!user?.id) return [];
  const vendors = await getVendors(user?.id);
  const ids = vendors.map((v) => v.id);

  const packages = await prisma.package.findMany({
    where: { vendorId: { in: ids } },
    orderBy: { updatedAt: "desc" },
    include: {
      vendor: {
        select: { vendorName: true }
      },
      StatusUpdatedBy: {
        select: { username: true }
      }
    }
  });

  return packages;
}
