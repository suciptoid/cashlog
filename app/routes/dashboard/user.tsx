import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser, sessionCookie } from "~/lib/cookies";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieString = await sessionCookie.parse(request.headers.get("Cookie"));
  const user = await getUser(cookieString);
  if (user) {
    return json(user);
  }
  return redirect("/auth");
};

export const action: ActionFunction = async ({ request }) => {
  console.log("request method", request.method);
  if (request.method === "DELETE") {
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  } else {
    return new Response(null, { status: 405 });
  }
};
