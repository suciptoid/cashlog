import { getCurrencySymbol } from "./currency";
import { test, expect } from "vitest";

test("get currency symbol", () => {
  expect(getCurrencySymbol("USD")).toBe("$");
});
