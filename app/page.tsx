import { db } from "@/lib/db";

export default async function Home() {
  const [rows] = await db.query("SELECT * FROM users");

  const users = rows as {
    id: number;
    name: string;
    email: string;
    password: number;
    role: string;
  }[];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-baseline py-2 px-3 bg-white dark:bg-black sm:items-start">
        <h1 className="font-bold text-3xl text-amber-600 mb-7 mt-4">
          Əsas Səhifə
        </h1>
        <section className="w-full mb-7">
          <h2 className="text-2xl text-amber-600 mb-3">Users</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {users.length >0 ? users.map((user) => (
              <div
                key={user.id}
                className="min-w-60 sm:min-w-1/5 rounded border border-amber-600 p-4 bg-zinc-50 dark:bg-zinc-900"
              >
                <p>
                  <span className="font-semibold text-amber-600">name:</span> {user.name}
                </p>
                {/* <p>
                  <span className="font-semibold text-amber-600">email:</span> {user.email}
                </p> */}
                <p>
                  <span className="font-semibold text-amber-600">role:</span> {user.role}
                </p>
              </div>
            )) : <u>&#34;no users in db&#34;</u>}
          </div>
        </section>
      </main>
    </div>
  );
}