import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Book } from "~/core/ledger";

export default function InfoPage() {
  return (
    <div id="book-info-page">
      <Form method="delete">
        <input type="hidden" name="delete" value="true" />
        <button type="submit" className="bg-red-500 text-white px-3 py-2">
          Delete Book
        </button>
      </Form>
    </div>
  );
}

export const action = async ({ request, params }: ActionArgs) => {
  const form = await request.formData();
  if (form.has("delete")) {
    const book = params.book;
    if (book) {
      await Book.withId(book).delete();
      return redirect("/book/setup");
    }
  }

  return null;
};
