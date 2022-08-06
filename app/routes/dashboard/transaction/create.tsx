import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import ModalTransaction from "~/components/transaction/ModalTransaction";
import { requireUser } from "~/lib/cookies";
import dayjs from "~/lib/dayjs";
import { FieldValue, firestore } from "~/lib/firebase.server";
import { accountCollection } from "~/models/account";
import { budgetCollection } from "~/models/budget";
import { categoryCollection } from "~/models/category";
import { transactionCollection } from "~/models/transaction";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();

  const data = {
    amount: parseFloat(form.get("amount")?.toString() || "0"),
    time: form.has("time")
      ? dayjs(
          parseInt(form.get("time")?.toString() || dayjs().valueOf().toString())
        ).valueOf()
      : Date.now(),
    description: form.get("description")?.toString(),
    category_id: form.get("category_id")?.toString(),
    account_id: form.get("account_id")?.toString(),
    excluded: form.get("excluded")?.toString() === "true" || false,
  };

  if (!data.category_id || !data.account_id) {
    throw new Error("Missing category or account");
  }

  const cat = await categoryCollection(user.user_id)
    .doc(data.category_id!)
    .get();

  if (!cat.exists) {
    throw new Error("Category collection does not exist");
  }

  const category = cat.data();
  let amount = data.amount;
  if (category?.spending) {
    amount = -Math.abs(amount);
  } else {
    amount = Math.abs(amount);
  }

  const ref = transactionCollection(user.user_id).doc();
  const accRef = accountCollection(user.user_id).doc(data.account_id);

  // Check budget if exists
  const budgetQuery = await budgetCollection(user.user_id)
    .where("category_id", "==", data.category_id)
    .where("end", ">=", data.time)
    .get();

  const matchedBudget = budgetQuery.docs.filter(
    (f) => f.data().start <= data.time
  );

  await firestore.runTransaction(async (t) => {
    // Update budget if exists
    if (matchedBudget.length > 0) {
      matchedBudget.forEach((b) => {
        t.update(b.ref, {
          used: FieldValue.increment(Math.abs(amount)),
        });
      });
    }
    // Create Transaction
    t.set(ref, {
      id: ref.id,
      user_id: user.user_id,
      amount,
      category_id: data.category_id!,
      account_id: data.account_id!,
      description: data.description || "",
      time: data.time,
      created_at: Date.now(),
      updated_at: Date.now(),
      excluded: data.excluded,
    });
    // Update account balance
    t.update(accRef, {
      balance: FieldValue.increment(amount),
    });
  });

  return redirect("/dashboard/transaction");
};

export default function CreateTransaction() {
  const navigate = useNavigate();
  return <ModalTransaction onClose={() => navigate("..", { replace: true })} />;
}
