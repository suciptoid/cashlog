import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { ModalBudget } from "~/components/budget/ModalBudget";
import { requireUser } from "~/lib/cookies";
import type { BudgetEntity } from "~/models/budget";
import { budgetCollection } from "~/models/budget";
import { categoryCollection } from "~/models/category";
import { transactionCollection } from "~/models/transaction";

interface ActionData {
  values?: Partial<BudgetEntity>;
  errors?: any;
}

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const user = await requireUser(request);
  const form = await request.formData();

  const values = Object.fromEntries(form) as Partial<BudgetEntity>;

  if (!form.has("category_id") || form.get("category_id")?.toString() === "") {
    return {
      values,
      errors: {
        category_id: "Category is required",
      },
    };
  }

  const categoryId = form.get("category_id")!.toString();

  const catRef = categoryCollection(user.user_id).doc(categoryId);
  const cat = await catRef.get();
  if (!cat.exists) {
    return {
      values,
      errors: {
        category_id: "Category does not exist",
      },
    };
  }

  const start = form.get("start")?.toString();
  const end = form.get("end")?.toString();
  if (!start || !end) {
    return {
      values,
      errors: {
        start: "Start date is required",
        end: "End date is required",
      },
    };
  }

  // Get transaction with same category and in the same range
  const trxs = await transactionCollection(user.user_id)
    .where("time", ">=", parseInt(start))
    .where("time", "<=", parseInt(end))
    .where("category_id", "==", categoryId)
    .get();

  let used = 0;

  if (!trxs.empty) {
    used = trxs.docs.reduce((acc, cur) => {
      return acc + cur.data().amount;
    }, 0);
  }

  const amount = parseInt(form.get("amount")?.toString() || "0");

  const budgetRef = budgetCollection(user.user_id).doc();
  await budgetRef.set({
    id: budgetRef.id,
    user_id: user.user_id,
    category_id: cat.id,
    start: parseInt(start),
    end: parseInt(end),
    amount: amount,
    created_at: Date.now(),
    updated_at: Date.now(),
    used: Math.abs(used), // Use absolute number
  });

  return redirect("/dashboard/budget");
};
export default function CreateBudget() {
  const navigate = useNavigate();
  // const action = useActionData<ActionData>();

  return (
    <ModalBudget
      onClose={() => navigate("/dashboard/budget", { replace: true })}
    />
  );
}
