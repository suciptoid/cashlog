import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { ModalAccount } from "~/components/account/ModalAccount";
import { requireUser } from "~/lib/cookies";
import type { AccountEntity } from "~/models/account";
import { accountCollection } from "~/models/account";

type ActionData = {
  account: AccountEntity;
  fields: {
    name: string;
    currency: string;
    balance: number;
    account_number: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();

  const data = {
    name: form.get("name")?.toString() || "",
    account_number: form.get("account_number")?.toString() || "",
    balance: parseInt(form.get("balance")?.toString() || "0"),
    currency: form.get("currency")?.toString() || "USD",
  };

  try {
    const ref = accountCollection(user.user_id).doc();
    await ref.set({
      id: ref.id,
      user_id: user.user_id,
      created_at: Date.now(),
      updated_at: Date.now(),
      ...data,
    });
    return redirect("/dashboard/account");
  } catch {
    return {
      fields: data,
    };
  }
};

export default function CreateAccount() {
  const navigate = useNavigate();

  const action = useActionData<ActionData>();

  return (
    <ModalAccount
      account={action?.account}
      onClose={() => navigate("/dashboard/account", { replace: true })}
    />
  );
}
