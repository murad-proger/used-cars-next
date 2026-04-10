"use client";

import { useState } from "react";

type LikeButtonProps = {
  initialLiked: number;
  id: number;
};

export default function LikeButton({ initialLiked, id }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/liked/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });

      const data = await res.json();
      if (data.success) {
        setLiked((prev) => (prev === 1 ? 0 : 1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="text-2xl transition-transform hover:scale-110 disabled:opacity-50"
      aria-label="Like"
    >
      {liked === 1 ? "❤️" : "🤍"}
    </button>
  );
}