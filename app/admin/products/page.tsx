import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductsList from "./ProductsList";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Управление продуктами</h1>
      <ProductsList />
    </div>
  );
}
