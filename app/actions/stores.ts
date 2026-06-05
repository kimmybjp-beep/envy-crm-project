"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseClient } from "@/lib/supabase";

const storeSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(7),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
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
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined
  });

  if (!parsed.success) redirect("/register?message=invalid");

  const supabase = getSupabaseClient();
  const { hash, salt } = hashPassword(parsed.data.password);
  const phone = parsed.data.phone.trim();
  const { data: existingStore } = await supabase
    .from("stores")
    .select("id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  if (existingStore) redirect("/register?message=store-already-submitted");

  const photoDataUrl = z.string().parse(formData.get("storefrontPhotoDataUrl") || "");
  let imageUrl: string | null = null;

  const photo = parseDataUrlImage(photoDataUrl);

  if (!photo) {
    redirect("/register?message=photo-required");
  }

  const photoPath = `pending/${crypto.randomUUID()}.${photo.extension}`;
  const { error: uploadError } = await supabase.storage
    .from("storefront-photos")
    .upload(photoPath, photo.bytes, {
      cacheControl: "3600",
      contentType: photo.mimeType,
      upsert: false
    });

  if (uploadError) redirect("/register?message=photo-upload-error");

  const { data: publicUrl } = supabase.storage.from("storefront-photos").getPublicUrl(photoPath);
  imageUrl = publicUrl.publicUrl;

  const { error } = await supabase.from("stores").insert({
    name: parsed.data.name,
    owner_name: parsed.data.ownerName,
    phone,
    password_hash: hash,
    password_salt: salt,
    tier: "UNASSIGNED",
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    image_url: imageUrl,
    status: "PENDING_APPROVAL"
  });

  if (error) redirect("/register?message=create-error");

  revalidatePath("/admin");
  redirect("/register?message=store-submitted");
}

function parseDataUrlImage(value: string) {
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!match) return null;

  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const bytes = Buffer.from(match[2], "base64");

  if (!bytes.length || bytes.length > 1_500_000) return null;

  return { bytes, mimeType, extension };
}

export async function reviewStoreAction(formData: FormData) {
  const storeId = z.string().uuid().parse(formData.get("storeId"));
  const status = z.enum(["APPROVED", "REJECTED"]).parse(formData.get("status"));
  const supabase = getSupabaseAdminClient();

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
  const rawRequestId = formData.get("requestId");
  const requestId = typeof rawRequestId === "string" && rawRequestId ? z.string().uuid().parse(rawRequestId) : null;
  const { hash, salt } = hashPassword(password);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("stores")
    .update({
      password_hash: hash,
      password_salt: salt
    })
    .eq("id", storeId);

  if (error) redirect("/admin?message=password-reset-error");

  if (requestId) {
    await supabase
      .from("password_reset_requests")
      .update({
        status: "RESOLVED",
        resolved_at: new Date().toISOString(),
        resolved_by: "admin"
      })
      .eq("id", requestId);
  } else {
    await supabase
      .from("password_reset_requests")
      .update({
        status: "RESOLVED",
        resolved_at: new Date().toISOString(),
        resolved_by: "admin"
      })
      .eq("store_id", storeId)
      .eq("status", "OPEN");
  }

  revalidatePath("/admin");
  redirect("/admin?message=password-reset");
}

export async function resolvePasswordResetRequestAction(formData: FormData) {
  const requestId = z.string().uuid().parse(formData.get("requestId"));
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("password_reset_requests")
    .update({
      status: "RESOLVED",
      resolved_at: new Date().toISOString(),
      resolved_by: "admin"
    })
    .eq("id", requestId);

  if (error) redirect("/admin?message=password-reset-request-resolve-error");

  revalidatePath("/admin");
  redirect("/admin?message=password-reset-request-resolved");
}

export async function updateStoreTierAction(formData: FormData) {
  const storeId = z.string().uuid().parse(formData.get("storeId"));
  const tier = z.enum(["UNASSIGNED", "DISTRIBUTOR", "TIER2", "TIER3"]).parse(formData.get("tier"));
  const tierLocked = formData.get("tierLocked") === "on";
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("stores")
    .update({
      tier,
      tier_locked: tierLocked
    })
    .eq("id", storeId);

  if (error) redirect("/admin?message=tier-update-error");

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/scan");
  redirect("/admin?message=tier-updated");
}
