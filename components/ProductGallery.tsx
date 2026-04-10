"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

interface ProductGalleryProps {
  images: string[];
  brand: string;
  model: string;
}

export default function ProductGallery({
  images,
  brand,
  model,
}: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div>
      {/* Главный слайдер */}
      <Swiper
        modules={[Navigation, Thumbs]}
        spaceBetween={10}
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="mb-4 h-96"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-96">
              <Image
                src={img}
                alt={`${brand} ${model} ${index}`}
                fill
                className="object-cover rounded-lg"
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Миниатюры */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Navigation, Thumbs]}
        spaceBetween={10}
        slidesPerView={Math.min(images.length, 6)}
        freeMode
        watchSlidesProgress
        className="h-24 cursor-pointer"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index} className="h-24">
            <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={img}
                alt={`thumb ${index}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
