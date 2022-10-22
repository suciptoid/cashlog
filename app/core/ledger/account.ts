import { z } from "zod";

export enum AccountType {
  Asset = "ASSET",
  Liability = "LIABILITY",
  Equity = "EQUITY",
  Expense = "EXPENSE",
  Income = "INCOME",
}

export enum AccountSubType {
  // Assets
  Bank = "BANK",
  Cash = "CASH",
  Receivable = "RECEIVABLE",
  // Liability
  CreditCard = "CREDITCARD",
  Payable = "PAYABLE",
}

export const AccountSchema = z.object({
  id: z.string().min(10),
  name: z.string(),
  code: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().default("IDR"),
  parent: z
    .string()
    .optional()
    .transform((v) => (v == "" ? null : v)),
  type: z.nativeEnum(AccountType),
  sub_type: z.nativeEnum(AccountSubType).optional(),
});

export const AccountBalanceSchema = z.object({
  balance: z.number().default(0),
  date: z.number(),
  timestamp: z.number().default(Date.now()),
  account: z.string(),
});

export const AccountBalanceSnap = z.map(z.string(), AccountBalanceSchema);

export const AccountBalanceFromSnapshot = z
  .any()
  .transform((v) => new Map(Object.entries(v)))
  .transform((v) => AccountBalanceSnap.parse(v))
  .transform((v) => Array.from(v.values()));

const AccountPartialSchema = AccountSchema.partial();
const AccountCreateSchema = AccountSchema.omit({
  id: true,
});
const AccountWithBalanceSchema = AccountSchema.extend({
  balance: z.number().default(0),
  balance_raw: z.number().default(0),
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

export const shouldFlipBalance = (acc: AccountWithBalance) => {
  return [
    AccountType.Income,
    AccountType.Equity,
    AccountType.Liability,
  ].includes(acc.type);
};

export const personalTemplate = [
  {
    id: "asset",
    name: "Assets",
    type: AccountType.Asset,
    childrens: [
      {
        id: "asset-bank",
        name: "Bank",
        type: AccountType.Asset,
        sub_type: AccountSubType.Bank,
      },
      {
        id: "asset-cash",
        name: "Cash",
        type: AccountType.Asset,
        sub_type: AccountSubType.Cash,
      },
    ],
  },
  {
    id: "income",
    name: "Income",
    type: AccountType.Asset,
    childrens: [
      {
        id: "income-salary",
        name: "Salary",
        type: AccountType.Income,
      },
    ],
  },
  {
    id: "expense",
    name: "Expenses",
    type: AccountType.Expense,
    childrens: [
      {
        id: "expense-grocery",
        name: "Grocery",
        type: AccountType.Expense,
      },
      {
        id: "expense-others",
        name: "Others",
        type: AccountType.Expense,
      },
    ],
  },
];

export const accountTemplates = [
  {
    name: "Personal",
    accounts: personalTemplate,
  },
];

export class Account {
  static toTree(accounts: AccountWithBalance[], parent?: string) {
    return accounts
      .filter((f) => f.parent == parent)
      .map((acc) => {
        const tree = {
          ...acc,
          childrens: Account.toTree(accounts, acc.id),
        } as AccountTree;
        return tree as AccountTree;
      })
      .map((tree) => {
        tree.balance_raw += Account.getSubBalance(tree.childrens);
        if (shouldFlipBalance(tree) && tree.balance_raw !== 0) {
          tree.balance = tree.balance_raw * -1;
        } else {
          tree.balance = tree.balance_raw;
        }
        return tree;
      });
  }

  static getSubBalance(accounts: AccountWithBalance[]) {
    return accounts.reduce((sum, acc) => {
      return sum + acc.balance_raw;
    }, 0);
  }
}
