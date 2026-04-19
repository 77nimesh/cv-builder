import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function isAdminUser(
  user: { role?: string | null } | null | undefined
) {
  return user?.role === "ADMIN";
}