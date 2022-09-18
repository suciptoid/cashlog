import { z } from "zod";

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
