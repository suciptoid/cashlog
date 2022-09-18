import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Book, BookInfoSchema } from "~/core/ledger/book";
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
            className="px-3 py-2 bg-green-500 rounded-md text-white"
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
  const book = await Book.create(
    BookInfoSchema.omit({ id: true, timestamp: true }).parse(
      Object.fromEntries(form.entries())
    )
  );

  // const asset = await book.createAccount({
  //   name: "Asset",
  //   type: AccountType.Asset,
  // });

  // await book.createAccount({
  //   name: "Bank",
  //   type: AccountType.Asset,
  //   parent: asset.id,
  // });

  // const expense = await book.createAccount({
  //   name: "Expenses",
  //   type: AccountType.Expense,
  // });
  // await book.createAccount({
  //   name: "Belanja",
  //   type: AccountType.Expense,
  //   parent: expense.id,
  // });
  // await book.createAccount({
  //   name: "Equity",
  //   type: AccountType.Equity,
  // });

  // console.log("setup book", book);
  await book.addUser(user.user_id);

  // Create root account
  // await createRootAccount(book.id);
  return redirect(`/book/${book.id}/`);
};
