// lib/auth.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        //  Fetch user from database
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials?.password as string,
          user.password
        );

        if (!isValid) return null;

      //RETURN custom fields here
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Store role in JWT token
      }
      return token;
    },
  
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role; 
      }
      return session;
    },
  },
};