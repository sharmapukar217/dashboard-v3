import { getContext } from "telefunc";
import { getCurrentUser } from "./auth.server";
import { getPackages, getPackageById } from "./package.server";

export async function onLoadPackages() {
  const currentUser = await getCurrentUser(getContext().sid);
  return await getPackages(currentUser);
}

export async function onLoadPackageById(packageId?: string) {
  const currentUser = await getCurrentUser(getContext().sid);
  return await getPackageById(currentUser, packageId);
}
