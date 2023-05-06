import { getContext } from "telefunc";
import { getPackages } from "./package.server";
import { getCurrentUser } from "./auth.server";

export async function onLoadPackages() {
  const currentUser = await getCurrentUser(getContext().sid);
  return await getPackages(currentUser);
}
