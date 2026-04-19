import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      emailVerifiedAt: string | null;
      isEmailVerified: boolean;
    };
  }

  interface User {
    id: string;
    role: string;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    emailVerifiedAt?: string | null;
    isEmailVerified?: boolean;
  }
}

export {};