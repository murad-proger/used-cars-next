import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions); // вместо auth()

  if (!session) redirect("/login");

  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-baseline py-2 px-3 bg-white dark:bg-black sm:items-start">
        <h1 className="font-bold text-3xl text-amber-600 mb-7 mt-4">Kabinet</h1>
        <Link
          href="/admin/products"
          className="inline-block px-4 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition"
        >
          Перейти к редактированию товаров
        </Link>
      </main>
    </div>
  );
}
