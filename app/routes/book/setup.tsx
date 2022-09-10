import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createRootAccount } from "~/core/ledger/account";
import { createUserBookkeeping } from "~/core/ledger/book";
import { requireUser } from "~/lib/cookies";

export default function BookSetupPage() {
  return (
    <div className="w-full p-8">
      <h1 className="text-4xl px-3 py-2 font-bold text-gray-800">
        Setup Bookkeeping
      </h1>
      <p className="px-3 py-2 text-gray-600 text-sm">
        Bookkeeping is where your transaction is stored, one book keeping can
        has many account, transaction and reporting.
      </p>

      <Form method="post" className="w-1/3">
        <fieldset className="flex flex-col px-3">
          <label htmlFor="name font-medium text-sm">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="border rounded-md my-1 py-2 px-3 outline-none focus:ring focus:ring-teal-100"
            placeholder="Bookkeeping name"
          />
        </fieldset>
        <fieldset className="flex flex-col px-3">
          <button
            type="submit"
            className="px-3 py-2 bg-teal-500 rounded-md text-white"
          >
            Create Bookkeeping
          </button>
        </fieldset>
      </Form>
    </div>
  );
}

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const form = await request.formData();
  const book = await createUserBookkeeping(
    user.user_id,
    form.get("name")!.toString()
  );

  // Create root account
  await createRootAccount(book.id);
  return redirect(`/book/${book.id}/accounts`);
};
