"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        return;
      }

      setOrderId(data.orderId);
      setSuccess(true);

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    window.location.reload(); // обновляем корзину
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "İcra olunur..." : "Sifarişi tamamla"}
      </button>

      {/* модальное окно */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              Təbrik edirik!
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Sifarişiniz uğurla tamamlandı 🎉
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Order ID: {orderId}
            </p>

            <button
              onClick={handleClose}
              className="bg-amber-600 text-white px-5 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}