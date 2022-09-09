import { initializeApp } from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9999";

const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://test.fireabseio.com",
});
const database = getDatabase(app);

const rules = {
  rules: {
    book: {
      transactions: {
        ".indexOn": ["entry_time"],
      },
    },
  },
};

describe("testing double entry accounting", () => {
  afterAll(async () => {
    await database.ref("book").set(null);
  });

  beforeAll(async () => {
    // Apply rules
    const res = await fetch(
      "http:/127.0.0.1:9999/.settings/rules.json?access_token=123&ns=test",
      {
        method: "PUT",
        body: JSON.stringify(rules),
      }
    );
    expect(res.status).toBe(200);

    await database.ref("book/accounts").set({
      asset: {
        id: "asset",
        name: "Asset",
        type: "asset",
      },
      equity: {
        name: "Equity",
        type: "equity",
        id: "equity",
      },
      liability: {
        name: "Liability",
        type: "liability",
        id: "liability",
      },
      expense: {
        name: "Expense",
        type: "expense",
        id: "expense",
      },
      income: {
        name: "Income",
        type: "income",
        id: "income",
      },
      opening_balance: {},
    });
  });

  it("create account", async () => {
    // Create opening balance
    await database.ref("book/accounts/opening_balance").set({
      name: "Opening Balance",
      type: "equity",
      parent: "equity",
      id: "opening_balance",
    });
    // Create cash account
    await database.ref("book/accounts/cash").set({
      name: "Cash",
      type: "asset",
      parent: "asset",
      id: "cash",
    });

    // Create transaction entry / split
    for (let x = 1; x <= 5; x++) {
      // Create transaction
      const trxRef = database.ref("/book/transactions").push();
      await trxRef.set({
        id: trxRef.key,
        description: x + " initial balance after setup account",
        timestamp: Date.now(),
        entry_time: Date.now(),
        accounts: ["opening_balance", "cash"],
        entries: [
          {
            account: "opening_balance",
            amount: -100000 * x,
          },
          {
            account: "cash",
            amount: 100000 * x,
          },
        ],
      });
    }

    // Query transaction by account
    const data = await database
      .ref("/book/transactions")
      .orderByChild("entry_time")
      .startAt(new Date("2022-09-08 00:00").getTime())
      .endAt(new Date("2022-09-08 23:59").getTime())
      .limitToFirst(3)
      // .equalTo("accounts/cash")
      .get();

    // console.log(data.val());
    const transactions: any[] = [];
    data.forEach((snap) => {
      // console.log(snap.val());
      transactions.push(snap.val());
    });

    console.log(transactions);

    // Balance for cash
    const cashBalance = transactions.reduce((sum, val) => {
      const cash = val.entries.find(
        (f: { account: string }) => f.account === "cash"
      );

      return sum + cash.amount;
    }, 0);

    const openingbalance = transactions.reduce((sum, val) => {
      const cash = val.entries.find(
        (f: { account: string }) => f.account === "opening_balance"
      );

      return sum + cash.amount;
    }, 0);

    console.log("cash balance", cashBalance.toLocaleString());
    console.log("opening balance", openingbalance.toLocaleString());

    // transaction list for cash
    const cashTrx = transactions.reduce((trxs, trx) => {
      const cash = trx.entries
        .filter((f: { account: string }) => f.account === "cash")
        .map((m: any) => {
          const tr = {
            ...trx,
            ...m,
          };

          delete tr.entries;
          delete tr.accounts;

          return tr;
        });
      trxs = trxs.concat(cash);
      return trxs;
    }, []);
    console.log(cashTrx);

    // console.log(data.toJSON());
  });
});
