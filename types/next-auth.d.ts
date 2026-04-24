import { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: NonNullable<DefaultSession["user"]> & {
      id: string;
      role: AppRole;
      emailVerifiedAt: string | null;
      isEmailVerified: boolean;
    };
  }

  interface User {
    id: string;
    role: AppRole;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    emailVerifiedAt?: string | null;
    isEmailVerified?: boolean;
  }
}

export {};