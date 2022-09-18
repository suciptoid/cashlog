import { z } from "zod";

// import type { Account, AccountTree } from "./types";

// export const rootAccounts: Partial<Account>[] = [
//   {
//     accountType: "ASSET",
//     name: "Asset",
//   },
//   {
//     accountType: "LIABILITY",
//     name: "Liability",
//   },
//   {
//     accountType: "EQUITY",
//     name: "Equity",
//   },
//   {
//     accountType: "INCOME",
//     name: "Income",
//   },
//   {
//     accountType: "EXPENSE",
//     name: "Expense",
//   },
// ];

// export const createAccount = async (
//   book: string,
//   account: Omit<Account, "id"> & Partial<Pick<Account, "id">>
// ) => {
//   let id = cuid();
//   if (account.id) {
//     id = account.id;
//   }
//   const ref = database.ref(`/books/${book}/accounts/${id}`);

//   const acc = {
//     ...account,
//     id: id,
//   } as Account;

//   await ref.set(acc);
//   return acc;
// };

// export const getAccounts = async (book: string) => {
//   const ref = database.ref(`/books/${book}/accounts`);

//   const snapshots = await ref.get();

//   const data: Account[] = [];
//   snapshots.forEach((snap) => {
//     data.push(snap.val());
//   });
//   return data;
// };

// export const getAccountTransactions = async (
//   book: string,
//   start: number,
//   end: number,
//   account?: string
// ) => {
//   const transactions = await getTransaction(book, start, end);
//   // Flatten transactions entries
//   const entries = getTransactionEntry(transactions);

//   if (account) {
//     return entries.filter((f) => f.account_id == account);
//   }
//   return entries;
// };

// export const getAccountBalance = async (
//   book: string,
//   start: number,
//   end: number
// ) => {
//   const transactions = await getAccountTransactions(book, start, end);
//   const accounts = await getAccounts(book);
//   // TODO: get previous balance (cached)

//   return calculateAccountBalance(accounts, transactions);
// };

// export const createRootAccount = async (book: string) => {
//   for (let x = 0; x < rootAccounts.length; x++) {
//     const acc = rootAccounts[x];
//     await createAccount(book, acc as Account);
//   }
// };

// export const calculateAccountBalance = (
//   accounts: Account[],
//   transactions: TransactionSingle[]
// ) => {
//   return accounts.map((acc) => {
//     return {
//       ...acc,
//       balance: transactions
//         .filter((f) => f.account_id == acc.id)
//         .reduce((sum, tr) => {
//           return sum + tr.amount;
//         }, 0),
//     } as AccountWithBalance;
//   });
// };

// export const buildAccountTree = (
//   accounts: AccountWithBalance[],
//   parent?: string
// ) => {
//   const trees = accounts
//     .filter((f) => f.parentId == parent)
//     .map((acc) => {
//       const tree: AccountTree = {
//         ...acc,
//         subAccounts: buildAccountTree(accounts, acc.id),
//       } as AccountTree;
//       return tree;
//     })
//     .map((tree) => {
//       tree.balance = tree.balance + getSubBalance(tree.subAccounts);
//       return tree;
//     });
//   return trees;
// };

// export const getSubBalance = (accounts: AccountTree[]) => {
//   const bal: number = accounts.reduce((balance, acc) => {
//     if (acc.subAccounts.length > 0) {
//       return balance + acc.balance; //+ getSubBalance(acc.subAccounts);
//     }
//     return balance + acc.balance;
//   }, 0);

//   return bal;
// };

export enum AccountType {
  Asset = "ASSET",
  Liability = "LIABILITY",
  Equity = "EQUITY",
  Expense = "EXPENSE",
  Income = "INCOME",
}

export const AccountSchema = z.object({
  id: z.string().min(10),
  name: z.string(),
  code: z.string().optional(),
  description: z.string().optional(),
  parent: z
    .string()
    .optional()
    .transform((v) => (v == "" ? null : v)),
  type: z.nativeEnum(AccountType),
});

const AccountPartialSchema = AccountSchema.partial();
const AccountCreateSchema = AccountSchema.omit({
  id: true,
});
const AccountWithBalanceSchema = AccountSchema.extend({
  balance: z.number().default(0),
});

const AccountTemplateSchema = z.object({
  name: z.string(),
  accounts: z.array(AccountSchema),
});

export const AccountSnapshot = z.map(z.string(), AccountWithBalanceSchema);

export const AccountFromSnapshot = z
  .any()
  .transform((v) => new Map(Object.entries(v)))
  .transform((v) => AccountSnapshot.parse(v))
  .transform((v) => Array.from(v.values()));

export type AccountData = z.infer<typeof AccountSchema>;
export type AccountPartial = z.infer<typeof AccountPartialSchema>;
export type AccountCreate = z.infer<typeof AccountCreateSchema>;
export type AccountWithBalance = z.infer<typeof AccountWithBalanceSchema>;
export type AccountTemplate = z.infer<typeof AccountTemplateSchema>;

export type AccountTree = AccountWithBalance & {
  childrens: AccountTree[];
};

export const accountTemplates = [
  {
    name: "Personal",
    accounts: {},
  },
];

export class Account {
  static toTree(accounts: AccountWithBalance[], parent?: string) {
    const trees = accounts
      .filter((f) => f.parent == parent)
      .map((acc) => {
        const tree = {
          ...acc,
          childrens: Account.toTree(accounts, acc.id),
        } as AccountTree;
        return tree as AccountTree;
      })
      .map((tree) => {
        tree.balance = tree.balance + Account.getSubBalance(tree.childrens);
        return tree;
      });
    return trees;
  }

  static getSubBalance(accounts: AccountWithBalance[]) {
    return accounts.reduce((sum, acc) => {
      return sum + acc.balance;
    }, 0);
  }
}
