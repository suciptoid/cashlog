import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import ModalTransaction from "~/components/transaction/ModalTransaction";
import { requireUser } from "~/lib/cookies";
import { FieldValue, firestore } from "~/lib/firebase.server";
import { accountCollection } from "~/models/account";
import { budgetCollection } from "~/models/budget";
import { categoryCollection } from "~/models/category";
import type { TransactionEntity } from "~/models/transaction";
import { transactionCollection } from "~/models/transaction";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }
  const ref = transactionCollection(user.user_id).doc(id);
  const trx = await ref.get();
  if (!trx.exists) {
    throw new Response("Not Found", { status: 404 });
  }
  return json(trx.data());
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }
  const ref = transactionCollection(user.user_id).doc(id);
  const detail = await ref.get();

  if (!detail.exists) {
    throw new Response("Not Found", { status: 404 });
  }

  if (request.method === "DELETE") {
    await firestore.runTransaction(async (t) => {
      const prev = detail.data();

      // Query account from transaction
      const accRef = accountCollection(user.user_id).doc(prev!.account_id);
      const accQuery = await t.get(accRef);

      // Query Budget by category
      const budgetQuery = await budgetCollection(user.user_id)
        .where("end", ">=", prev!.time)
        .where("category_id", "==", prev!.category_id)
        .get();

      const matchedBudget = budgetQuery.docs.filter(
        (f) => f.data().start <= prev!.time
      );

      if (!accQuery.exists) {
        throw "Account not exists!";
      }
      // Update account balance
      t.update(accRef, {
        balance: FieldValue.increment(-prev!.amount),
      });
      // Update budget usage
      if (matchedBudget.length > 0) {
        matchedBudget.forEach(async (budget) => {
          t.update(budget.ref, {
            used: FieldValue.increment(-Math.abs(prev!.amount)),
          });
        });
      }

      t.delete(ref);
    });
    return redirect("/dashboard/transaction");
  } else if (request.method === "PATCH") {
    const categories = categoryCollection(user.user_id);
    const prev: TransactionEntity = detail.data()!;
    const form = await request.formData();
    const body = Object.fromEntries(form);

    // Get Category
    const categoryChanged = body.category_id !== prev.category_id;

    const catIds = [prev.category_id, body.category_id].filter(
      (f) => f !== undefined && f !== null
    );
    const query = await categories.where("id", "in", catIds).get();

    const results = query.docs.map((doc) => doc.data());

    const newCategory = results.find((f) => f.id === body.category_id);
    // const prevCategory = results.find((f) => f.id === prev.category_id);

    // Make it positive, because from frontend always send positive value
    let newAmount = Math.abs(parseInt(body.amount.toString()));
    if (newCategory?.spending) {
      newAmount = -newAmount;
    }

    // Check associated budget
    const budgetQuery = await budgetCollection(user.user_id)
      .where("end", ">=", prev!.time)
      .where("category_id", "in", catIds)
      .get();

    const matchedBudget = budgetQuery.docs.filter(
      (f) => f.data().start <= prev!.time
    );

    await firestore.runTransaction(async (t) => {
      const accRef = accountCollection(user.user_id).doc(prev.account_id);

      // If account is changed, transfer amount to new account
      if (body.account_id !== prev.account_id) {
        const newAccRef = accountCollection(user.user_id).doc(
          body.account_id.toString()
        );
        // New account should reduced
        t.update(newAccRef, {
          balance: FieldValue.increment(newAmount),
        });
        t.update(accRef, {
          balance: FieldValue.increment(-prev.amount),
        });
      } else if (prev.amount !== newAmount) {
        // If amount is changed, also update account balance
        t.update(accRef, {
          balance: FieldValue.increment(newAmount - prev.amount),
        });
      }

      if (matchedBudget.length > 0) {
        if (categoryChanged) {
          // Get previous category budget
          const prevBudget = matchedBudget.find(
            (f) => f.data().category_id === prev.category_id
          );
          // console.log("category changed", prevBudget?.data());
          // Restore budget usage on previous category
          if (prevBudget) {
            t.update(prevBudget.ref, {
              used: FieldValue.increment(-Math.abs(prev.amount)),
            });
          }
          // Increase budget usage on new category
          const newBudget = matchedBudget.find(
            (f) => f.data().category_id === body.category_id
          );
          if (newBudget) {
            t.update(newBudget.ref, {
              used: FieldValue.increment(Math.abs(newAmount)),
            });
          }
        } else {
          // Category not changed, just update budget usage
          const budget = matchedBudget.find(
            (f) => f.data().category_id === prev.category_id
          );
          if (budget && newAmount !== prev.amount) {
            let usedDiff = newAmount - prev.amount;
            if (usedDiff < 0) {
              usedDiff = Math.abs(usedDiff);
            } else {
              usedDiff = -usedDiff;
            }
            t.update(budget.ref, {
              used: FieldValue.increment(usedDiff),
            });
          }
        }
      }

      // Update transaction itself
      t.update(ref, {
        amount: newAmount,
        category_id: form.get("category_id")?.toString(),
        account_id: form.get("account_id")?.toString(),
        description: form.get("description")?.toString(),
        time: parseInt(form.get("time")!.toString()),
        excluded: form.get("excluded")?.toString() === "true",
        updated_at: Date.now(),
      });
    });

    return redirect("/dashboard/transaction");
  } else {
    throw new Response("Method Not Allowed", { status: 405 });
  }
};

export default function TransactionDetail() {
  const transaction = useLoaderData<TransactionEntity>();
  const navigate = useNavigate();
  return (
    <ModalTransaction
      transaction={transaction}
      onClose={() => navigate("..", { replace: true })}
    />
  );
}
