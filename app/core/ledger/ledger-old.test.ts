// import {
//   buildAccountTree,
//   createAccount,
//   getAccountBalance,
//   getAccounts,
//   getAccountTransactions,
// } from "./account";
// import { createBook, deleteBook } from "./book";
// import { createTransaction, getTransaction } from "./transaction";
// import type { AccountWithBalance } from "./types";
// import { afterAll, beforeAll, describe, expect, it } from "vitest";
// import rules from "~/database-rules.json";
import { expect, it } from "vitest";

// describe("Ledger", () => {
//   beforeAll(async () => {
//     const res = await fetch(
//       "http:/127.0.0.1:9999/.settings/rules.json?access_token=123&ns=test",
//       {
//         method: "PUT",
//         body: JSON.stringify(rules),
//       }
//     );
//     expect(res.status).toBe(200);

//     const asset = await createAccount("test", {
//       id: "asset",
//       name: "Asset",
//       accountType: "ASSET",
//       code: "1-1000",
//     });

//     expect(asset.name).toBe("Asset");
//     expect(asset.id).toBeDefined();

//     await createAccount("test", {
//       id: "expense",
//       name: "Expense",
//       accountType: "EXPENSE",
//       code: "5-5000",
//     });
//     const accs = await getAccounts("test");
//     expect(accs.length).toEqual(2);
//   });

//   afterAll(async () => {
//     // await database.ref("/books").set(null);
//   });

//   describe("book", () => {
//     afterAll(() => {
//       deleteBook("hello");
//     });
//     it("create book", async () => {
//       const book = await createBook("hello", "Hello Book Keeping");
//       expect(book).toBeDefined();
//     });

//     it("create book error on existing id", async () => {
//       expect(createBook("hello", "Hello Book Keeping")).rejects.toThrowError();
//     });
//   });

//   describe("transaction", () => {
//     afterAll(() => {
//       deleteBook("test");
//     });
//     it("create transaction", async () => {
//       await createTransaction("test", {
//         dateEntry: new Date("2022-09-01 09:00").getTime(),
//         datePosting: new Date("2022-09-01 09:00").getTime(),
//         description: "test manual journal",
//         entries: [
//           {
//             account: "asset",
//             amount: 100000,
//           },
//           {
//             account: "expense",
//             amount: -100000,
//           },
//         ],
//       });
//     });

//     it("get transaction by account", async () => {
//       const start = new Date("2022-09-01 00:00").getTime();
//       const end = new Date("2022-09-30 00:00").getTime();
//       const trx = await getTransaction("test", start, end);
//       expect(trx.length).toBe(1);
//       const expenseTrx = await getAccountTransactions(
//         "test",
//         start,
//         end,
//         "asset"
//       );
//       expect(expenseTrx.length).toBe(1);
//     });
//   });

//   describe("account", () => {
//     afterAll(() => {
//       deleteBook("test-account");
//     });
//     it("create account", async () => {
//       const asset = await createAccount("test-account", {
//         id: "asset-bank",
//         name: "Bank",
//         accountType: "ASSET",
//       });
//       const equity = await createAccount("test-account", {
//         id: "equity-opening",
//         name: "Equity",
//         accountType: "EQUITY",
//       });

//       expect(asset.id).toBeDefined();
//       expect(equity.id).toBeDefined();
//     });

//     it("get account list", async () => {
//       const accs = await getAccounts("test-account");
//       expect(accs.length).toBe(2);
//       expect(accs[0].name).toBe("Bank");
//     });

//     it("get account balance", async () => {
//       // Dummy transaction
//       const date = new Date("2022-09-10 09:00:00").getTime();
//       await createTransaction("test-account", {
//         dateEntry: date,
//         datePosting: date,
//         description: "Testing opening balance",
//         entries: [
//           {
//             account: "asset-bank",
//             amount: 1000000,
//             memo: "Opening balance",
//           },
//           {
//             account: "equity-opening",
//             amount: -1000000,
//             memo: "Opening balance",
//           },
//         ],
//       });

//       const accs = await getAccountBalance("test-account", date, date);
//       const asset = accs.find((f) => f.id == "asset-bank");
//       const equity = accs.find((f) => f.id == "equity-opening");
//       expect(asset?.balance).toBe(1000000);
//       expect(equity?.balance).toBe(-1000000);
//     });

//     describe("account-tree", () => {
//       const bookId = "test-account-tree";
//       afterAll(() => {
//         deleteBook(bookId);
//       });
//       it("create nested account", async () => {
//         const root = await createAccount(bookId, {
//           accountType: "ASSET",
//           name: "Assets",
//           code: "1000",
//         });
//         const current = await createAccount(bookId, {
//           accountType: "ASSET",
//           name: "Current Assets",
//           code: "1100",
//           parentId: root.id,
//         });
//         await createAccount(bookId, {
//           accountType: "ASSET",
//           name: "Non Current Assets",
//           code: "1200",
//           parentId: root.id,
//         });

//         await createAccount(bookId, {
//           accountType: "ASSET",
//           name: "Checking",
//           code: "1101",
//           parentId: current.id,
//         });
//         await createAccount(bookId, {
//           accountType: "ASSET",
//           name: "Saving",
//           code: "1102",
//           parentId: current.id,
//         });

//         const accounts = await getAccountBalance(
//           bookId,
//           Date.now(),
//           Date.now()
//         );
//         expect(accounts.length).toBe(5);

//         const tree = buildAccountTree(accounts as AccountWithBalance[]);
//         expect(tree.length).toBe(1); // Asset
//         expect(tree[0].subAccounts.length).toBe(2); // Asset:[Current Asset,Non Current Asset]
//         expect(tree[0].subAccounts[0].subAccounts.length).toBe(2);
//         // console.log(JSON.stringify(tree, null, 2));
//       });
//     });
//   });
// });

it("true", () => expect(true).toBeTruthy());