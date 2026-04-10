import { Product } from "@/@types/product";
import ProductCard from "./ProductCard";

export default function Products({ products }: { products: Product[] }) {
  return (
    <div className="flex flex-wrap gap-5 w-full">
      {products.map((car) => (
        <ProductCard key={car.id} product={car} />
      ))}
    </div>
  );
}