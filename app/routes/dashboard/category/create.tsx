import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Modalcategory from "~/components/category/ModalCategory";
import { requireUser } from "~/lib/cookies";
import { categoryCollection } from "~/models/category";

interface FormRequest {
  name: string;
  spending: boolean;
  parent_id?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (request.method !== "POST") {
    throw new Response(null, { status: 405 });
  }

  const form = await request.formData();
  const data: FormRequest = {
    name: form.get("name")?.toString() || "",
    spending: form.get("spending")?.toString() === "true",
    parent_id: form.get("parent_id")?.toString(),
  };

  const ref = categoryCollection(user.user_id).doc();
  try {
    await ref.set({
      id: ref.id,
      user_id: user.user_id,
      created_at: Date.now(),
      updated_at: Date.now(),
      ...data,
    });
    return redirect("/dashboard/category");
  } catch (e) {
    const message = (e as Error).message || "Error creating category";
    return {
      error: {
        message,
      },
      fields: data,
    };
  }
};

export default function CreateCategory() {
  const navigate = useNavigate();
  return (
    <Modalcategory
      onClose={() => navigate("/dashboard/category", { replace: true })}
    />
  );
}
