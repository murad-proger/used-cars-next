import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [rows] = await db.query<UserRow>(
          "SELECT * FROM users WHERE email = $1 LIMIT 1",
          [credentials.email],
        );
        const user = rows[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        // Приводим id к строке!
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
});

/*
Файлы, для оздания регистрации-авторизации и в целом бекенд движений:

/auth.ts
/next-auth.d.ts
/app/api/auth (всё, что в нем етсть)

*/
