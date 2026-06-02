"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const rewardSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  pointsRequired: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true)
});

export async function createRewardAction(formData: FormData) {
  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    pointsRequired: formData.get("pointsRequired"),
    stock: formData.get("stock"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) redirect("/admin/rewards?message=invalid");

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("rewards").insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
    points_required: parsed.data.pointsRequired,
    stock: parsed.data.stock,
    is_active: parsed.data.isActive
  });

  if (error) redirect("/admin/rewards?message=reward-error");

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  redirect("/admin/rewards?message=reward-saved");
}

export async function updateRewardAction(formData: FormData) {
  const rewardId = z.string().uuid().parse(formData.get("rewardId"));
  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    pointsRequired: formData.get("pointsRequired"),
    stock: formData.get("stock"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) redirect("/admin/rewards?message=invalid");

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("rewards")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      points_required: parsed.data.pointsRequired,
      stock: parsed.data.stock,
      is_active: parsed.data.isActive
    })
    .eq("id", rewardId);

  if (error) redirect("/admin/rewards?message=reward-error");

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  redirect("/admin/rewards?message=reward-saved");
}

export async function redeemRewardAction(formData: FormData) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("envy_store_id")?.value;

  if (!storeId) redirect("/login");

  const rewardId = z.string().uuid().parse(formData.get("rewardId"));
  const supabase = getSupabaseClient();
  const [{ data: store }, { data: reward }] = await Promise.all([
    supabase.from("stores").select("id,points").eq("id", storeId).single(),
    supabase.from("rewards").select("*").eq("id", rewardId).eq("is_active", true).single()
  ]);

  if (!store || !reward) redirect("/rewards?message=reward-not-found");
  if (store.points < reward.points_required) redirect("/rewards?message=not-enough-points");
  if (reward.stock < 1) redirect("/rewards?message=out-of-stock");

  const { error: redemptionError } = await supabase.from("reward_redemptions").insert({
    reward_id: reward.id,
    store_id: store.id,
    points_spent: reward.points_required,
    status: "PENDING"
  });

  if (redemptionError) redirect("/rewards?message=redeem-error");

  await Promise.all([
    supabase.from("stores").update({ points: store.points - reward.points_required }).eq("id", store.id),
    supabase.from("rewards").update({ stock: reward.stock - 1 }).eq("id", reward.id)
  ]);

  revalidatePath("/home");
  revalidatePath("/rewards");
  revalidatePath("/admin/rewards");
  redirect("/rewards?message=redeem-success");
}
