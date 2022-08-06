import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import Modalcategory from "~/components/category/ModalCategory";
import { requireUser } from "~/lib/cookies";
import type { CategoryEntity } from "~/models/category";
import { categoryCollection } from "~/models/category";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }
  const cat = await categoryCollection(user.user_id).doc(id).get();
  if (!cat.exists) {
    throw new Response("Not Found", { status: 404 });
  }

  return json(cat.data());
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const id = params.id;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const ref = categoryCollection(user.user_id).doc(id);
  if (request.method === "DELETE") {
    await ref.delete();
    return redirect("/dashboard/category");
  } else if (request.method === "PATCH") {
    const form = await request.formData();
    const update: Partial<CategoryEntity> = {};

    if (form.has("name")) {
      update.name = form.get("name")?.toString();
    }

    if (form.has("spending")) {
      update.spending = form.get("spending")?.toString() === "true";
    }

    if (form.has("parent_id")) {
      update.parent_id = form.get("parent_id")?.toString();
    }

    await ref.update(update);
    return redirect("/dashboard/category");
  } else {
    throw new Response(`Method ${request.method} not allowed`, { status: 405 });
  }
};

export default function CategoryDetail() {
  const navigate = useNavigate();
  const category = useLoaderData<CategoryEntity>();

  const fetcher = useFetcher();
  return (
    <Modalcategory
      category={category}
      onDelete={() => fetcher.submit(null, { method: "delete" })}
      onClose={() => navigate("/dashboard/category", { replace: true })}
    />
  );
}
