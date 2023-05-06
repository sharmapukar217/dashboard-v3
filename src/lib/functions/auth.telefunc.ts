import { getContext } from "telefunc";
import {
  getCurrentUser,
  getSavedAccounts,
  getUserSessions,
  getConnectedAccounts
} from "./auth.server";

export async function onLoadCurrentUser() {
  return await getCurrentUser(getContext().sid);
}

export async function onLoadSavedAccounts() {
  return await getSavedAccounts(getContext().sid);
}

export async function onLoadUserSessions() {
  const sid = getContext().sid;
  const currentUser = await getCurrentUser(sid);
  return await getUserSessions(currentUser?.id, sid);
}

export async function onLoadConnectedAccounts() {
  const sid = getContext().sid;
  const currentUser = await getCurrentUser(sid);
  return await getConnectedAccounts(currentUser?.id);
}
