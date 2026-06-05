"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const messageSchema = z.object({
  message: z.string().min(2).max(240)
});

export async function publishAdminMessageAction(formData: FormData) {
  const parsed = messageSchema.safeParse({
    message: formData.get("message")
  });

  if (!parsed.success) redirect("/admin?message=invalid");

  const supabase = getSupabaseClient();
  await supabase.from("admin_messages").update({ is_active: false }).eq("is_active", true);
  const { error } = await supabase.from("admin_messages").insert({
    message: parsed.data.message,
    is_active: true
  });

  if (error) redirect("/admin?message=message-error");

  revalidatePath("/home");
  revalidatePath("/admin");
  redirect("/admin?message=message-saved");
}
