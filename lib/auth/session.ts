import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";

export type AppSession = Session | null;
export type AppSessionUser = NonNullable<Session["user"]>;

export async function getCurrentSession(): Promise<AppSession> {
  return (await auth()) as AppSession;
}

export async function getCurrentUser(): Promise<AppSessionUser | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireCurrentUser(): Promise<AppSessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function isAdminUser(
  user: Pick<AppSessionUser, "role"> | null | undefined
) {
  return user?.role === "ADMIN";
}