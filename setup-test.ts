import { installGlobals } from "@remix-run/node";
import "dotenv/config";
import { beforeAll, expect } from "vitest";
import rules from "~/database-rules.json";

installGlobals();

// Set firebase realtime-db rules
beforeAll(async () => {
  // Set rules
  const res = await fetch(
    "http:/127.0.0.1:9999/.settings/rules.json?access_token=123&ns=test",
    {
      method: "PUT",
      body: JSON.stringify(rules),
    }
  );
  expect(res.status).toEqual(200);
});
