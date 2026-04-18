"use client";

import { Product } from "@/@types/product";
import { formatAZN } from "@/utils/formatAZN";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import LikeButton from "./LikeButton";
import { useSession } from "next-auth/react";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();

  const {
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
    liked,
    raiting,
  } = product;

  return (
    <div
      className="productCard relative sm:max-w-2xs w-full flex flex-col gap-4 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-zinc-900"
    >
      <div className="absolute top-4 right-4 z-10">
        <LikeButton initialLiked={liked} id={id} />
      </div>

      <Link href={`/product/${id}`} className="image w-full h-48 overflow-hidden rounded-lg relative">
        {images?.[0] ? (
          <Image
            src={images[0]}
            alt={`${brand} ${model}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
            <Link href={`/product/${id}`}>
              {brand} {model}, {year} ({displacement})
            </Link>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mileage.toLocaleString()} km | {transmission} | {engineType} | {drivetrain}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {bodyType} | {color} | {steeringWheel}-hand
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-600 text-lg">
              {formatAZN(price)} AZN
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ⭐ {raiting}
            </span>
          </div>

          {session?.user && <AddToCartButton productId={id} />}
        </div>
      </div>
    </div>
  );
}