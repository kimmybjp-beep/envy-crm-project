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

const INVALID_QR_FORM_MESSAGE = "\u0e01\u0e23\u0e2d\u0e01\u0e0a\u0e37\u0e48\u0e2d distributor \u0e41\u0e25\u0e30\u0e08\u0e33\u0e19\u0e27\u0e19 QR \u0e43\u0e2b\u0e49\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07";
const QR_CODE_SAVE_ERROR_MESSAGE = "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01 QR \u0e25\u0e07 database \u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08";
const QR_SUCCESS_PREFIX = "\u0e2a\u0e23\u0e49\u0e32\u0e07 QR \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08";

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
    return { ok: false, message: INVALID_QR_FORM_MESSAGE };
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
    return {
      ok: false,
      message: `สร้าง batch ไม่สำเร็จ: ${batchError?.code ?? "NO_CODE"} ${batchError?.message ?? "No batch returned"}`
    };
  }

  const codes = buildUniqueCodes(parsed.data.quantity);
  const rows = codes.map((code) => ({
    batch_id: batch.id,
    distributor_name: parsed.data.distributorName,
    code
  }));

  const { error } = await supabase.from("qr_codes").insert(rows);

  if (error) {
    return { ok: false, message: `${QR_CODE_SAVE_ERROR_MESSAGE}: ${error.code ?? "NO_CODE"} ${error.message}` };
  }

  revalidatePath("/admin/qr-generator");
  return {
    ok: true,
    message: `${QR_SUCCESS_PREFIX} ${codes.length} รายการ และกำลังดาวน์โหลด ZIP`,
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
