import NodeCache from "node-cache";
import type { RequestEvent } from "@sveltejs/kit";
import { redirect } from "sveltekit-flash-message/server";

const cache = new NodeCache();

type RateLimitProps = { id?: string; max: number; window: number; message?: string };
export async function rateLimit(
  event: RequestEvent,
  { id = "api", max, window, message }: RateLimitProps
) {
  const count = cache.get<number>(event.locals.sid) || 0;
  if (count >= max) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ttl = new Date(cache.getTtl(event.locals.sid)!).getTime();
    const remaning = Math.floor((ttl - Date.now()) / 1000) + 1;

    if (!message) message = `Too many requests! Try in ${remaning} seconds.`;
    throw redirect({ id, type: "warning", message }, event);
  } else {
    cache.set(event.locals.sid, count + 1, window);
  }
}
