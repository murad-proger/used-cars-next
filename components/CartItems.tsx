// components/CartItems.tsx
"use client";

import { Product } from "@/@types/product";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CartItemsProps = {
  items: Product[];
};

export default function CartItems({ items }: CartItemsProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(items);

  async function handleRemove(productId: number) {
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (data.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        router.refresh();
        window.dispatchEvent(new Event("cart-changed")); // это для изменения количества товара корзины в хедере
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="relative flex flex-col sm:flex-row gap-4 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-zinc-900"
        >
          <div className="image w-full sm:max-w-2xs h-48 overflow-hidden rounded-lg relative">
            {item.images?.[0] ? (
              <Image
                src={item.images[0]}
                alt={`${item.brand} ${item.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 justify-between">
            <div>
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                {item.brand} {item.model}, {item.year} ({item.displacement})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.mileage.toLocaleString()} km | {item.transmission} | {item.engineType} | {item.drivetrain}
              </p>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="font-bold text-amber-600 text-lg">{item.price.toLocaleString("ru-RU")} ₼</span>

              <button
                onClick={() => handleRemove(item.id)}
                className="px-4 py-1 bg-red-500 text-white font-semibold rounded shadow hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}