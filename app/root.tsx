import styles from "./styles/app.css";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { logEvent } from "firebase/analytics";
import { useEffect } from "react";
import { analytics } from "~/lib/firebase.client";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles, as: "style" }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Cashlog",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const pageView = (url: string) => {
      logEvent(analytics, "page_view", {
        page_location: url,
        page_title: document.title,
      });
    };

    pageView(location.pathname);
  }, [location.pathname]);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
