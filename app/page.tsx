import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
};

export default async function Home() {
  const { data: rows } = await supabase
    .from("users")
    .select("*");

  const users: UserRow[] = rows ?? [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-baseline py-2 px-3 bg-white dark:bg-black sm:items-start">

        <h1 className="font-bold text-3xl text-amber-600 mb-7 mt-4">
          Əsas Səhifə
        </h1>

        <section className="w-full mb-10 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-amber-600 mb-3">
            About this project
          </h2>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            Hi, I’m Murad — a fullstack developer with a focus on frontend development.
            This project is a used car marketplace built with Next.js (App Router), Supabase (PostgreSQL), and deployed on Vercel.
          </p>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mt-3">
            It includes authentication (NextAuth), role-based access control (USER / ADMIN),
            an admin dashboard with full CRUD operations, and a fully functional shopping cart system.
          </p>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mt-3">
            The architecture is designed with clear separation between frontend and backend logic,
            consistent database schema in Supabase, and production deployment on Vercel.
          </p>
        </section>

        {/* USERS SECTION */}
        <section className="w-full mb-7">

          <h2 className="text-2xl text-amber-600 mb-3">
            Users
          </h2>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">

            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="min-w-60 sm:min-w-1/5 rounded border border-amber-600 p-4 bg-zinc-50 dark:bg-zinc-900"
                >
                  <p>
                    <span className="font-semibold text-amber-600">
                      name:
                    </span>{" "}
                    {user.name}
                  </p>

                  <p>
                    <span className="font-semibold text-amber-600">
                      role:
                    </span>{" "}
                    {user.role}
                  </p>
                </div>
              ))
            ) : (
              <u>no users in db</u>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}