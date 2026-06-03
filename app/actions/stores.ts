"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { getSupabaseClient } from "@/lib/supabase";

const storeSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(7),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  tier: z.enum(["DISTRIBUTOR", "TIER2", "TIER3"]),
  imageUrl: z.string().url().optional().or(z.literal(""))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
});

export async function createStoreAction(formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    tier: formData.get("tier"),
    imageUrl: formData.get("imageUrl") || ""
  });

  if (!parsed.success) redirect("/register?message=invalid");

  const supabase = getSupabaseClient();
  const { hash, salt } = hashPassword(parsed.data.password);
  const { error } = await supabase.from("stores").insert({
    name: parsed.data.name,
    owner_name: parsed.data.ownerName,
    phone: parsed.data.phone,
    password_hash: hash,
    password_salt: salt,
    tier: parsed.data.tier,
    image_url: parsed.data.imageUrl || null,
    status: "PENDING_APPROVAL"
  });

  if (error) redirect("/register?message=create-error");

  revalidatePath("/admin");
  redirect("/login?message=store-submitted");
}

export async function reviewStoreAction(formData: FormData) {
  const storeId = z.string().uuid().parse(formData.get("storeId"));
  const status = z.enum(["APPROVED", "REJECTED"]).parse(formData.get("status"));
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("stores")
    .update({ status })
    .eq("id", storeId);

  if (error) redirect("/admin?message=review-error");

  revalidatePath("/admin");
  revalidatePath("/scan");
  redirect("/admin?message=review-saved");
}

export async function resetStorePasswordAction(formData: FormData) {
  const storeId = z.string().uuid().parse(formData.get("storeId"));
  const password = z.string().min(8).parse(formData.get("password"));
  const { hash, salt } = hashPassword(password);
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("stores")
    .update({
      password_hash: hash,
      password_salt: salt
    })
    .eq("id", storeId);

  if (error) redirect("/admin?message=password-reset-error");

  revalidatePath("/admin");
  redirect("/admin?message=password-reset");
}
