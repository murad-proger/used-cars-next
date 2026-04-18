import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductForm from "../../ProductForm";
import { db } from "@/lib/db";
import { Product } from "@/@types/product";

type Props = { params: { id: string } };

type ProductRow = {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  displacement: string;
  engineType: string;
  transmission: string;
  drivetrain: string;
  bodyType: string;
  color: string;
  steeringWheel: string;
  price: number;
  images: string;
  description: string;
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

  const { id: idParam } = await params;

  const id = Number(idParam);
  if (Number.isNaN(id)) {
    redirect("/admin/products");
  }

  const [rows] = await db.execute<ProductRow>(
    `
    SELECT
      id,
      brand,
      model,
      year,
      mileage,
      displacement,
      engineType,
      transmission,
      drivetrain,
      bodyType,
      color,
      steeringWheel,
      price,
      images,
      description,
      liked,
      popular,
      raiting,
      added
    FROM products
    WHERE id = $1
    `,
    [id],
  );


  if (rows.length === 0) {
    redirect("/admin/products");
  }

  const raw = rows[0];

  // Преобразуем в Product
  const product: Product = {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    year: raw.year,
    mileage: raw.mileage,
    displacement: raw.displacement,
    engineType: raw.engineType,
    transmission: raw.transmission,
    drivetrain: raw.drivetrain,
    bodyType: raw.bodyType,
    color: raw.color,
    steeringWheel: raw.steeringWheel,
    price: raw.price,
    images: raw.images
      ? Array.isArray(raw.images)
        ? raw.images // если массив
        : [raw.images] // если просто строка
      : [],
    description: raw.description,
    liked: raw.liked,
    popular: raw.popular,
    raiting: raw.raiting,
    added: raw.added,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Редактировать продукт</h1>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
