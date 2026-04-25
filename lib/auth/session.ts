import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isSystemAdminRole } from "@/lib/auth/roles";

export type AppSession = Session | null;
export type AppSessionUser = NonNullable<Session["user"]>;

export async function getCurrentSession(): Promise<AppSession> {
  return (await auth()) as AppSession;
}

export async function getCurrentUser(): Promise<AppSessionUser | null> {
  const session = await getCurrentSession();

  const user = session?.user ?? null;

  if (!user?.id) {
    return null;
  }

  return user;
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
  return isSystemAdminRole(user?.role);
}