import { writable } from "svelte/store";
import type { getCurrentUser } from "$lib/functions/auth.server";

type User = Awaited<ReturnType<typeof getCurrentUser>>;
export const authStore = writable<{ isLoading: boolean; currentUser?: User }>({
  isLoading: true,
  currentUser: undefined
});
