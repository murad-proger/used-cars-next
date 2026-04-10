"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/@types/product";

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

export default function ProductForm({ mode, product }: Props) {
  const [brand, setBrand] = useState<string>(product?.brand || "");
  const [model, setModel] = useState<string>(product?.model || "");
  const [year, setYear] = useState<number>(product?.year || 0);
  const [mileage, setMileage] = useState<number>(product?.mileage || 0);
  const [displacement, setDisplacement] = useState<string>(product?.displacement || "");
  const [engineType, setEngineType] = useState<string>(product?.engineType || "");
  const [transmission, setTransmission] = useState<string>(product?.transmission || "");
  const [drivetrain, setDrivetrain] = useState<string>(product?.drivetrain || "");
  const [bodyType, setBodyType] = useState<string>(product?.bodyType || "");
  const [color, setColor] = useState<string>(product?.color || "");
  const [steeringWheel, setSteeringWheel] = useState<string>(product?.steeringWheel || "");
  const [price, setPrice] = useState<number>(product?.price || 0);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [description, setDescription] = useState<string>(product?.description || "");
  const [raiting, setRaiting] = useState<number>(product?.raiting || 0);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
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
      description,
      raiting,
    };

    const url = mode === "create"
      ? "/api/products"
      : `/api/products/${product!.id}`;

    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      alert("Ошибка при сохранении продукта");
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) =>
    setImages(images.filter((_, i) => i !== index));

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block font-semibold mb-1">Марка</label>
        <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label className="block font-semibold mb-1">Модель</label>
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label className="block font-semibold mb-1">Год</label>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label className="block font-semibold mb-1">Пробег</label>
        <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Объём двигателя</label>
        <input type="text" value={displacement} onChange={(e) => setDisplacement(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Тип двигателя</label>
        <input type="text" value={engineType} onChange={(e) => setEngineType(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Трансмиссия</label>
        <input type="text" value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Привод</label>
        <input type="text" value={drivetrain} onChange={(e) => setDrivetrain(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Тип кузова</label>
        <input type="text" value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Цвет</label>
        <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Руль</label>
        <input type="text" value={steeringWheel} onChange={(e) => setSteeringWheel(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Цена</label>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block font-semibold mb-1">Описание</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      {/* Массив изображений */}
      <div>
        <label className="block font-semibold mb-1">Изображения</label>
        {images.map((img, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={img}
              onChange={(e) => updateImage(i, e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder={`Изображение ${i + 1}`}
            />
            <button type="button" onClick={() => removeImageField(i)} className="px-2 bg-red-500 text-white rounded">X</button>
          </div>
        ))}
        <button type="button" onClick={addImageField} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Добавить изображение</button>
      </div>

      <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        {mode === "create" ? "Добавить" : "Сохранить"}
      </button>
    </form>
  );
}