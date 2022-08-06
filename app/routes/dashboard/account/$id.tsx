import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ModalAccount } from "~/components/account/ModalAccount";
import { requireUser } from "~/lib/cookies";
import type { AccountEntity } from "~/models/account";
import { accountCollection } from "~/models/account";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }
  const acc = await accountCollection(user.user_id).doc(id).get();

  if (!acc.exists) {
    throw new Response("Not Found", { status: 404 });
  }

  return json(acc.data());
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const ref = accountCollection(user.user_id).doc(id);
  if (request.method === "DELETE") {
    await ref.delete();
    return redirect("/dashboard/account");
  } else if (request.method === "PATCH") {
    const form = await request.formData();
    const update: Partial<AccountEntity> = {};
    if (form.has("name")) {
      update.name = form.get("name")?.toString();
    }
    if (form.has("account_number")) {
      update.account_number = form.get("account_number")?.toString();
    }
    if (form.has("currency")) {
      update.currency = form.get("currency")?.toString();
    }
    await ref.update(update);
    return redirect("/dashboard/account");
  } else {
    throw new Response(`Method ${request.method} not allowed`, { status: 405 });
  }
};

export default function AccountDetail() {
  const navigate = useNavigate();
  const account = useLoaderData<AccountEntity>();

  const fetcher = useFetcher();

  return (
    <ModalAccount
      account={account}
      onDelete={() => fetcher.submit(null, { method: "delete" })}
      onClose={() => navigate("/dashboard/account", { replace: true })}
    />
  );
}
