import { telefunc } from "telefunc";
import type { RequestHandler } from "./$types";

const handler: RequestHandler = async (event) => {
  const { body, statusCode, contentType } = await telefunc({
    url: event.request.url,
    method: event.request.method,
    body: await event.request.text(),
    context: { sid: event.locals.sid }
  });

  return new Response(body, {
    headers: new Headers({ contentType }),
    status: statusCode
  });
};

export { handler as GET, handler as POST };
