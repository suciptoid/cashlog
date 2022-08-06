import { sessionCookie } from "./cookies";
import { auth } from "./firebase.server";
import { Request } from "@remix-run/node";
import { expect, test } from "vitest";
import { createTestUser } from "~/tests/utils";

test("should parse session cookie", async () => {
  const user = await createTestUser();
  const cookie = await sessionCookie.serialize(user.session);
  const req = new Request("http://google.com/ddd", {
    method: "get",
    headers: {
      Cookie: cookie,
    },
  });
  expect(await sessionCookie.parse(req.headers.get("Cookie"))).toBe(
    user.session
  );
  const session = await auth.verifySessionCookie(user.session);
  expect(session).toBeDefined();

  await user.remove();

  expect(req).toBeDefined();
  expect(req.headers).toBeDefined();
});
