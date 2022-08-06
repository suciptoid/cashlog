import type { CollectionReference } from "firebase-admin/firestore";
import { firestore } from "~/lib/firebase.server";

export interface AccountEntity {
  id: string;
  user_id: string;
  balance: number;
  name: string;
  currency: string;
  account_number?: string;
  created_at: number; // Epoch
  updated_at: number; // Epoch
}

export const accountCollection = (userId: string) =>
  firestore.collection(
    `users/${userId}/accounts`
  ) as CollectionReference<AccountEntity>;
