import { auth } from "./firebase.server";
import { createCookie, redirect } from "@remix-run/node";

export const sessionCookie = createCookie("__session", {
  maxAge: 1000 * 60 * 60 * 24 * 5,
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});

// export type UserSession = Awaited<ReturnType<typeof getUser>>;
export type UserSession = {
  name: string;
  picture: string;
  user_id: string;
  email: string;
};
export const getUser = async (cookie: string) => {
  if (!cookie) return null;
  const session = await auth.verifySessionCookie(cookie);
  return {
    name: session.name,
    picture: session.picture,
    user_id: session.user_id,
    email: session.email,
  } as UserSession;
};

export const requireUser = async (req: Request) => {
  try {
    const cookieString = await sessionCookie.parse(req.headers?.get("Cookie"));
    const user = await getUser(cookieString);
    if (!user) throw new Error("User not found");
    return user;
  } catch (e) {
    const url = new URL(req.url);
    throw redirect(`/auth?next=${url.pathname}`);
  }
};
