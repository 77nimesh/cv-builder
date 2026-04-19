import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";

const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? normalizeEmail(credentials.email)
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          password,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      const userId = typeof token.sub === "string" ? token.sub : null;

      if (!userId) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          role: true,
          emailVerified: true,
        },
      });

      if (!dbUser) {
        return token;
      }

      token.name = dbUser.name ?? token.name;
      token.email = dbUser.email ?? token.email;
      token.role = dbUser.role;
      token.emailVerifiedAt = dbUser.emailVerified
        ? dbUser.emailVerified.toISOString()
        : null;
      token.isEmailVerified = Boolean(dbUser.emailVerified);

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role =
          typeof token.role === "string" ? token.role : "USER";
        session.user.emailVerifiedAt =
          typeof token.emailVerifiedAt === "string"
            ? token.emailVerifiedAt
            : null;
        session.user.isEmailVerified = Boolean(token.isEmailVerified);

        if (typeof token.name === "string") {
          session.user.name = token.name;
        }

        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);