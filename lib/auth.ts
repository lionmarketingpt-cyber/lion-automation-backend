import { prisma } from "./prisma";
import { verifyPassword } from "./hash";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user || !user.passwordHash) {
          return null;
        }
        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) {
          return null;
        }
        const result: User = {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email
        };
        return result;
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

export const auth = () => getServerSession(authOptions);
