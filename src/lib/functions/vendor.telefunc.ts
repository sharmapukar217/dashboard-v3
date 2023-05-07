import { getContext } from "telefunc";
import { getCurrentUser } from "./auth.server";
import { getVendors, getVendorById } from "./vendor.server";

export async function onLoadVendors() {
  const currentUser = await getCurrentUser(getContext().sid);
  return await getVendors(currentUser?.id);
}

export async function onLoadVendorById(vendorId?: string) {
  const currentUser = await getCurrentUser(getContext().sid);
  if (!currentUser) return null;

  return await getVendorById(vendorId);
}
