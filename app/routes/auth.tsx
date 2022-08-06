import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useSearchParams, useSubmit } from "@remix-run/react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  TwitterAuthProvider,
} from "firebase/auth";
import { useState } from "react";
import { requireUser, sessionCookie } from "~/lib/cookies";
import { auth } from "~/lib/firebase.client";
import { auth as adminAuth } from "~/lib/firebase.server";

const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    if (user) {
      return redirect("/dashboard/transaction");
    }
  } catch (e) {
    const response = e as Response;
    console.log("error get user", response.status);
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const token = form.get("token");
  const expires = 60 * 60 * 24 * 5 * 1000;

  if (!token) {
    return json({ error: "No token" }, { status: 400 });
  }

  const cookie = await adminAuth.createSessionCookie(token.toString(), {
    expiresIn: expires, // 5 Days
  });
  const redirectUrl = form.get("next")?.toString() || "/";
  return redirect(redirectUrl, {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(cookie, {
        maxAge: expires,
      }),
    },
  });
};

export default function Login() {
  const [authenticating, setAuthenticating] = useState(false);
  const submit = useSubmit();
  const [search] = useSearchParams();

  const onLoginWithProvider = async (provider: "google" | "twitter") => {
    setAuthenticating(true);
    try {
      const res = await signInWithPopup(
        auth,
        provider === "google"
          ? googleProvider
          : provider === "twitter"
          ? twitterProvider
          : googleProvider
      );

      const token = await res.user.getIdToken();
      submit(
        { token, next: search.get("next") || "/dashboard/" },
        { method: "post" }
      );
    } catch (err) {
      console.log(err);
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <>
      <div
        id="login"
        className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100"
      >
        <div id="app-logo" className="p-6">
          <Link
            to="/"
            className="flex items-center text-4xl font-bold text-gray-800"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="scroll"
              className="mr-2 h-9 w-9 text-teal-400"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path
                fill="currentColor"
                d="M48 0C21.53 0 0 21.53 0 48v64c0 8.84 7.16 16 16 16h80V48C96 21.53 74.47 0 48 0zm208 412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74 13.41 128 29.92 128 48v368c0 38.87 34.65 69.65 74.75 63.12C234.22 474 256 444.46 256 412.57zM288 384v32c0 52.93-43.06 96-96 96h336c61.86 0 112-50.14 112-112 0-8.84-7.16-16-16-16H288z"
              />
            </svg>
            Cashlog
          </Link>
        </div>
        {/* Login Container */}
        <div
          id="login-container"
          className="w-full max-w-sm rounded-md bg-white px-6 py-4 pb-6"
        >
          <h2 className="pb-3 font-medium text-sm text-gray-700">
            Continue With
          </h2>
          <div className="flex justify-center flex-col">
            <button
              disabled={authenticating}
              onClick={() => onLoginWithProvider("google")}
              className="flex relative mb-2 w-full items-center justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 active:bg-red-400 disabled:bg-gray-400 disabled:text-gray-700"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                className="mr-2 h-4 w-4 text-white absolute left-0 mx-4"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              Google Account
            </button>
            <button
              disabled={authenticating}
              onClick={() => onLoginWithProvider("twitter")}
              className="flex relative w-full items-center justify-center rounded-md bg-blue-400 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 active:bg-blue-500 disabled:bg-gray-400 disabled:text-gray-700"
            >
              <svg
                className="mr-2 h-4 w-4 text-white absolute left-0 mx-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
                />
              </svg>
              Twitter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
