import type { AccountEntity } from "./account";
import type { CategoryEntity } from "./category";
import type { CollectionReference } from "firebase-admin/firestore";
import { firestore } from "~/lib/firebase.server";

export interface TransactionEntity {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  description: string;
  time: number;
  transfer_id?: string;
  excluded?: boolean;
  created_at: number;
  updated_at: number;
}

export interface TransactionItem extends TransactionEntity {
  category?: CategoryEntity;
  account?: AccountEntity;
}

export const transactionCollection = (userId: string) =>
  firestore.collection(
    `users/${userId}/transactions`
  ) as CollectionReference<TransactionEntity>;
