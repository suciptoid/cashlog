import type { CollectionReference } from "firebase-admin/firestore";
import { firestore } from "~/lib/firebase.server";

export interface CategoryEntity {
  id: string;
  user_id: string;
  parent_id?: string;
  name: string;
  spending: boolean;
  created_at: number;
  updated_at: number;
}

export const categoryCollection = (userId: string) =>
  firestore.collection(
    `users/${userId}/categories`
  ) as CollectionReference<CategoryEntity>;
