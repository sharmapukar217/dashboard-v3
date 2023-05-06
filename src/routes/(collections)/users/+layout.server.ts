import { getUsers } from "$lib/functions/user.server";
import { ensureRoles } from "$lib/utilities/functions";
import { redirect } from "sveltekit-flash-message/server";

export async function load(event) {
  const { currentUser } = await event.parent();

  if (!ensureRoles(currentUser?.role, ["SUPERUSER", "ADMINUSER"])) {
    const flash = {
      id: "auth",
      dismissable: false,
      type: "warning",
      message: "You're now allowed to perform this action."
    };
    throw redirect("/", flash, event);
  }

  const users = await getUsers(currentUser?.id);
  return { users };
}
