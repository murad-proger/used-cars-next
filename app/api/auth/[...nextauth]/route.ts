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

        const { data: users, error } = await supabase
          .from("users")
          .select("id, name, email, password, role")
          .eq("email", credentials.email)
          .limit(1);

        if (error || !users || users.length === 0) return null;

        const user: UserRow = users[0];

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
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;

        token.id = u.id;
        token.role = u.role;
        token.name = u.name;
        token.email = u.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = (token.id as string) ?? "";
      session.user.role = (token.role as "ADMIN" | "USER") ?? "USER";
      session.user.name = (token.name as string) ?? "";
      session.user.email = (token.email as string) ?? "";

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };