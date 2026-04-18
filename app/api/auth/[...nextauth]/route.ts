import NextAuth, { AuthOptions, User } from "next-auth";
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

interface AuthUser extends User {
  role: "ADMIN" | "USER";
}

// Не меняем тип token, используем стандартный JWT
export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const [rows] = await db.query<UserRow>(
          "SELECT * FROM users WHERE email = $1 LIMIT 1",
          [credentials.email]
        );

        const user = rows[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

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
    // JWT callback — строго по типу NextAuth
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as AuthUser).role;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.name = token.name ?? undefined;
        session.user.email = token.email ?? undefined;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/*
Файлы, для оздания регистрации-авторизации и в целом бекенд движений:

/auth.ts
/next-auth.d.ts
/app/api/auth (всё, что в нем етсть)
*/