import { ArrowRightIcon } from "@heroicons/react/outline";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/cookies";

const features = [
  {
    title: "Personal Budgeting",
    description:
      "Don't know where your money goes? Start budgeting and spend wisely.",
  },
  {
    title: "Online Banking Integration",
    soon: true,
    description:
      "Automatically fetch your transaction from your online banking account.",
  },
  {
    title: "Multiple Account",
    description:
      "Track from any account, wallet, cash or bank account in one place.",
  },
  {
    title: "Transaction Category",
    description: "Categorize transaction for easier spending tracking",
  },
  {
    soon: true,
    title: "Import Transaction",
    description:
      "Import previous transaction from another app or files, such as PDF account statement or Excels.",
  },
  {
    soon: true,
    title: "Account Sharing",
    description: "Share and colaborate with your partner ",
  },
];

type LoaderData = Awaited<ReturnType<typeof requireUser>>;

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    if (user) {
      return json(user);
    }
  } catch {
    console.log("no user");
  }
  return null;
};

export const meta: MetaFunction = () => {
  return {
    title: "Cashlog",
  };
};

export default function Index() {
  const user = useLoaderData<LoaderData>();
  return (
    <div className="bg-slate-100">
      {/* Top Nav */}
      <div
        id="top-nav"
        className="m-auto flex w-full max-w-6xl items-center bg-slate-100 px-3"
      >
        <Link
          to="/"
          className="flex items-center text-lg font-bold text-gray-800"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="scroll"
            className="mr-2 h-7 w-7 text-green-400"
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
        <div className="flex flex-grow items-center justify-end py-4">
          {!user && (
            <Link
              to="/auth"
              className="rounded-md bg-green-400 px-6 py-2 text-sm font-medium text-white"
            >
              Sign Up
            </Link>
          )}

          {user && (
            <Link
              to="/dashboard"
              className="rounded bg-green-400 py-2 px-4 text-sm font-medium text-white hover:bg-green-500 active:bg-green-300"
            >
              Go to dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Hero Landing Page */}
      <div
        id="intro"
        className="m-auto grid min-h-[50vh] w-full max-w-6xl grid-cols-1 bg-slate-100  px-4"
      >
        <div id="intro-content" className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Track your cashflow ✨automagically✨
          </h1>
          <p className="w-10/12 py-2 text-gray-600">
            Track your Cashflow and spend wisely with Cashlog personal
            budgeting. Import from your monthly account statement (PDF) or
            connect to your online banking account.
          </p>
          <div id="act-group" className="my-4 flex items-center">
            <Link
              to="/dashboard"
              className="group flex w-full items-center rounded-md bg-green-400 px-6 py-2 text-sm font-bold text-white hover:bg-green-500 active:bg-green-600 sm:w-auto"
            >
              Start tracking{" "}
              <ArrowRightIcon className="ml-3 h-4 w-4 text-white group-hover:ml-4" />
            </Link>
          </div>
        </div>
      </div>
      {/* Features */}
      <div id="features" className="bg-white pb-8">
        <div className="m-auto w-full max-w-6xl px-4">
          <h2 className="py-4 text-3xl font-semibold text-gray-800">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f, key) => (
              <div
                key={`${key}-feature`}
                className="rounded-md border px-4 py-4 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    {f.title}
                  </h3>
                  {f.soon && (
                    <div className="rounded-md bg-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-600">
                      Coming Soon
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
