import type { CategoryEntity } from "./category";
import type { CollectionReference } from "firebase-admin/firestore";
import { firestore } from "~/lib/firebase.server";

export interface BudgetEntity {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  used?: number;
  start: number;
  end: number;
  created_at: number;
  updated_at: number;
}

export interface BudgetWithCategory extends Required<BudgetEntity> {
  category?: CategoryEntity;
  used: number;
}

export const budgetCollection = (user_id: string) =>
  firestore.collection(
    `users/${user_id}/budgets`
  ) as CollectionReference<BudgetEntity>;
