import { getContext } from "telefunc";
import { getCurrentUser, getSavedAccounts } from "./auth.server";

export async function onLoadCurrentUser() {
  return await getCurrentUser(getContext().sid);
}

export async function onLoadSavedAccounts() {
  return await getSavedAccounts(getContext().sid);
}
