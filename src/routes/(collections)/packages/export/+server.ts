import type { RequestEvent } from "@sveltejs/kit";
import { redirect } from "sveltekit-flash-message/server";

export async function GET(event: RequestEvent) {
  throw redirect("/packages", { type: "success", message: "File exported" }, event);
}
