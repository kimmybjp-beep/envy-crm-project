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
  const photoFile = formData.get("storefrontPhoto");
  let imageUrl: string | null = null;

  if (!(photoFile instanceof File) || photoFile.size === 0 || !photoFile.type.startsWith("image/")) {
    redirect("/register?message=photo-required");
  }

  const extension = photoFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const photoPath = `pending/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("storefront-photos")
    .upload(photoPath, photoFile, {
      cacheControl: "3600",
      contentType: photoFile.type,
      upsert: false
    });

  if (uploadError) redirect("/register?message=photo-upload-error");

  const { data: publicUrl } = supabase.storage.from("storefront-photos").getPublicUrl(photoPath);
  imageUrl = publicUrl.publicUrl;

  const { error } = await supabase.from("stores").insert({
    name: parsed.data.name,
    owner_name: parsed.data.ownerName,
    phone: parsed.data.phone,
    password_hash: hash,
    password_salt: salt,
    tier: "TIER3",
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    image_url: imageUrl,
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
