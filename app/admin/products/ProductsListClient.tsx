"use client";
import { Product } from "@/@types/product";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Props = {
  products: Product[];
};

export default function ProductsListClient({ products }: Props) {
  const [items, setItems] = useState(products);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    const prev = items;

    setItems((current) => current.filter((p) => p.id !== id));

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Ошибка удаления");
      setItems(prev);
    }
  };

  return (
    <div>
      <Link
        href="/admin/products/new"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Добавить новый товар
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-6">
        {items.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <div className="relative w-full h-48">
              <Image
                src={product.images[0] || "/placeholder.png"}
                alt={`${product.brand} ${product.model}`}
                fill
                sizes="(max-width: 640px) 100vw,
                      (max-width: 1024px) 50vw,
                      33vw"
                className="object-cover rounded"
              />
            </div>

            <h2 className="font-semibold text-lg mt-2">{product.brand}</h2>
            <p>{product.model}</p>
            <p>{product.year} г.</p>
            <p>{product.displacement}</p>

            <div className="flex gap-2 mt-4">
              <Link
                href={`/admin/products/edit/${product.id}`}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Редактировать
              </Link>

              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(product.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}