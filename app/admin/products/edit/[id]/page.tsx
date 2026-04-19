import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductForm from "../../ProductForm";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/@types/product";

type Props = {
  params: Promise<{ id: string }>;
};

type ProductRow = {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  displacement: string;
  enginetype: string;
  transmission: string;
  drivetrain: string;
  bodytype: string;
  color: string;
  steeringwheel: string;
  price: number;
  images: string;
  description: string | null;
  liked: number;
  popular: number;
  raiting: number;
  added: number;
};

export default async function EditProductPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id: idStr } = await params;
  const id = Number(idStr);

  if (Number.isNaN(id)) {
    redirect("/admin/products");
  }

  const { data: rows, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .limit(1);

  if (error) {
    console.error(error);
    redirect("/admin/products");
  }

  const raw: ProductRow | undefined = rows?.[0];

  if (!raw) {
    redirect("/admin/products");
  }

  let images: string[] = [];

  if (raw.images) {
    try {
      const parsed = JSON.parse(raw.images);
      images = Array.isArray(parsed)
        ? parsed
        : [String(raw.images)];
    } catch {
      images = String(raw.images)
        .split(",")
        .map((url) => url.trim());
    }
  }

  const product: Product = {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    year: raw.year,
    mileage: raw.mileage,
    displacement: raw.displacement,
    engineType: raw.enginetype,
    transmission: raw.transmission,
    drivetrain: raw.drivetrain,
    bodyType: raw.bodytype,
    color: raw.color,
    steeringWheel: raw.steeringwheel,
    price: raw.price,
    images,
    description: raw.description ?? "",
    liked: raw.liked,
    popular: raw.popular,
    raiting: raw.raiting,
    added: raw.added,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Редактировать продукт
      </h1>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}