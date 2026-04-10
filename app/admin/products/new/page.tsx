// app/admin/products/new/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/"); // доступ только для ADMIN
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Добавить новый продукт</h1>
      <ProductForm mode="create" />
    </div>
  );
}