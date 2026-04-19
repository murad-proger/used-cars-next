import NextAuth, { AuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabaseClient";

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

        // поиск пользователя в supabase
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .limit(1);

        if (error) {
          console.error(error);
          return null;
        }

        const user: UserRow | undefined = users?.[0];

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

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
    // добавляем данные в jwt токен
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as AuthUser).role;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
      }
      return token;
    },

    // прокидываем данные в session
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