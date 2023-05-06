import { getContext } from "telefunc";
import { getCurrentUser } from "./auth.server";
import { getUsers, getUserById } from "./user.server";

export async function onLoadUsers() {
  const currentUser = await getCurrentUser(getContext().sid);
  return await getUsers(currentUser?.id);
}

export async function onLoadUserById(userId: string) {
  const currentUser = await getCurrentUser(getContext().sid);
  if (!currentUser) return null;

  return await getUserById(userId);
}
