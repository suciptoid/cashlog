import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ModalBudget } from "~/components/budget/ModalBudget";
import { requireUser } from "~/lib/cookies";
import type { BudgetEntity } from "~/models/budget";
import { budgetCollection } from "~/models/budget";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  if (!params.id) {
    throw new Response(null, { status: 404 });
  }
  const ref = budgetCollection(user.user_id).doc(params.id);
  const budget = await ref.get();
  if (!budget.exists) {
    throw new Response(null, { status: 404 });
  }
  return budget.data();
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  if (!params.id) {
    throw new Response(null, { status: 404 });
  }
  const ref = budgetCollection(user.user_id).doc(params.id);
  const budget = await ref.get();
  if (!budget.exists) {
    throw new Response(null, { status: 404 });
  }

  if (request.method === "PATCH") {
    const form = await request.formData();
    const data = Object.fromEntries(form);
    await ref.update({
      user_id: user.user_id,
      amount: parseInt(data.amount.toString()),
      category_id: data.category_id,
      start: parseInt(data.start.toString()),
      end: parseInt(data.end.toString()),
      updated_at: Date.now(),
    });
    return redirect(`/dashboard/budget`);
  } else if (request.method === "DELETE") {
    await ref.delete();
    return redirect("/dashboard/budget");
  } else {
    throw new Response(null, { status: 405 });
  }
};

export default function BudgetDetail() {
  const navigate = useNavigate();
  const budget = useLoaderData<BudgetEntity>();
  return (
    <ModalBudget
      budget={budget}
      onClose={() => navigate("/dashboard/budget", { replace: true })}
    />
  );
}
