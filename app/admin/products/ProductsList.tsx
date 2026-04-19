import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/@types/product";
import ProductsListClient from "./ProductsListClient";

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

export default async function ProductsList() {
  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id, brand, model, year, mileage, displacement, enginetype, transmission, drivetrain, bodytype, color, steeringwheel, price, images, description, liked, popular, raiting, added"
    );

  if (error) {
    console.error(error);
    return <ProductsListClient products={[]} />;
  }

  const products: Product[] = (rows ?? []).map((row: ProductRow) => {
    let images: string[] = [];

    if (row.images) {
      try {
        const parsed = JSON.parse(row.images);
        images = Array.isArray(parsed)
          ? parsed
          : [String(row.images)];
      } catch {
        images = String(row.images)
          .split(",")
          .map((url) => url.trim());
      }
    }

    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
      mileage: row.mileage,
      displacement: row.displacement,
      engineType: row.enginetype,
      transmission: row.transmission,
      drivetrain: row.drivetrain,
      bodyType: row.bodytype,
      color: row.color,
      steeringWheel: row.steeringwheel,
      price: row.price,
      images,
      description: row.description ?? "",
      liked: row.liked,
      popular: row.popular,
      raiting: row.raiting,
      added: row.added,
    };
  });

  return <ProductsListClient products={products} />;
}