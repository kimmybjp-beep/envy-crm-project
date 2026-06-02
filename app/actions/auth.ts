"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword } from "@/lib/password";
import { getSupabaseClient } from "@/lib/supabase";

const loginSchema = z.object({
  phone: z.string().min(7),
  password: z.string().min(8)
});

const adminLoginSchema = z.object({
  password: z.string().min(1)
});

export async function storeLoginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password")
  });

  if (!parsed.success) redirect("/login?message=invalid");

  const supabase = getSupabaseClient();
  const { data: store, error } = await supabase
    .from("stores")
    .select("id,status,password_hash,password_salt")
    .eq("phone", parsed.data.phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !store) redirect("/login?message=store-not-found");
  if (!store.password_hash || !store.password_salt) redirect("/login?message=password-required");
  if (!verifyPassword(parsed.data.password, store.password_hash, store.password_salt)) {
    redirect("/login?message=auth-error");
  }
  if (store.status !== "APPROVED") redirect("/login?message=not-approved");

  const cookieStore = await cookies();
  cookieStore.set("envy_store_id", store.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  redirect("/home");
}

export async function adminLoginAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    password: formData.get("password")
  });

  if (!parsed.success) redirect("/admin/login?message=invalid");

  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (parsed.data.password !== expectedPassword) {
    redirect("/admin/login?message=admin-error");
  }

  const cookieStore = await cookies();
  cookieStore.set("envy_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/admin");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("envy_store_id");
  cookieStore.delete("envy_admin");
  redirect("/");
}

export async function signInAction(formData: FormData) {
  return storeLoginAction(formData);
}

export async function signUpAction() {
  redirect("/register");
}
