"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const messageSchema = z.object({
  message: z.string().min(2).max(240)
});

const qrSchema = z.object({
  distributorName: z.string().min(2),
  quantity: z.coerce.number().int().positive().max(5000)
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

export async function generateQrCodesAction(
  _previousState: { ok: boolean; message: string; distributorName?: string; codes?: string[] } | null,
  formData: FormData
) {
  const parsed = qrSchema.safeParse({
    distributorName: formData.get("distributorName"),
    quantity: formData.get("quantity")
  });

  if (!parsed.success) {
    return { ok: false, message: "กรอกชื่อ distributor และจำนวน QR ให้ถูกต้อง" };
  }

  const supabase = getSupabaseClient();
  const { data: batch, error: batchError } = await supabase
    .from("qr_batches")
    .insert({
      distributor_name: parsed.data.distributorName,
      quantity: parsed.data.quantity
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    return { ok: false, message: "สร้าง batch ไม่สำเร็จ" };
  }

  const codes = buildUniqueCodes(parsed.data.quantity);
  const rows = codes.map((code) => ({
    batch_id: batch.id,
    distributor_name: parsed.data.distributorName,
    code
  }));

  const { error } = await supabase.from("qr_codes").insert(rows);

  if (error) {
    return { ok: false, message: "บันทึก QR ลง database ไม่สำเร็จ กรุณากด generate ใหม่" };
  }

  revalidatePath("/admin/qr-generator");
  return {
    ok: true,
    message: `สร้าง QR สำเร็จ ${codes.length} รายการ และกำลังดาวน์โหลด ZIP`,
    distributorName: parsed.data.distributorName,
    codes
  };
}

function buildUniqueCodes(quantity: number) {
  const codes = new Set<string>();

  while (codes.size < quantity) {
    const candidate = Array.from({ length: 18 }, () => randomInt(0, 10).toString()).join("");
    codes.add(candidate);
  }

  return Array.from(codes);
}
