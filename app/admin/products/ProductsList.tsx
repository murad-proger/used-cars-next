import { db } from "@/lib/db";
import { Product } from "@/@types/product";
import ProductsListClient from "./ProductsListClient";

export default async function ProductsList() {
  const [rows] = await db.execute(
    "SELECT id, brand, model, year, mileage, displacement, engineType, transmission, drivetrain, bodyType, color, steeringWheel, price, images, description, liked, popular, raiting, added FROM products"
  );
  const products = rows as Product[];

  return <ProductsListClient products={products} />;
}