"use client";

import { useEffect, useState } from "react";
import { Product } from "@/@types/product";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkInCart() {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;

      const data: { items: Product[] } = await res.json();
      if (data.items?.some((item) => item.id === productId)) {
        setIsAdded(true);
      }
    }

    checkInCart();

    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ productId: number }>;

      if (ev.detail.productId === productId) {
        setIsAdded(true);
      }
    };

    window.addEventListener("cart-changed", handler);
    return () => window.removeEventListener("cart-changed", handler);
  }, [productId]);

  async function handleAdd() {
    if (isAdded || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAdded(true);

        window.dispatchEvent(
          new CustomEvent("cart-changed", {
            detail: { productId },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return isAdded ? (
    <button
      disabled
      className="mt-2 w-full bg-gray-400 text-white p-2 rounded cursor-not-allowed"
    >
      Əlavə edildi
    </button>
  ) : (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="mt-2 w-full bg-amber-600 text-white p-2 rounded hover:bg-amber-700"
    >
      {loading ? "Əlavə olunur..." : "Səbətə əlavə et"}
    </button>
  );
}