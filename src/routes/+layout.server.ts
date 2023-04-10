import { getCurrentUser } from "$lib/functions/auth.server";
import { loadFlash, redirect } from "sveltekit-flash-message/server";

export async function load(event) {
  const flash = loadFlash(event).flash;
  const currentUser = await getCurrentUser(event.locals.sid);

  if (!event.route.id?.startsWith("/(auth)") && !currentUser) {
    const message = "Please login to your account to continue.";
    throw redirect("/login", { id: "auth", type: "error", message }, event);
  }

  return { flash, currentUser };
}
