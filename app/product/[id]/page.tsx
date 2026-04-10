import { db } from "@/lib/db";
import { Product } from "@/@types/product";
import { formatAZN } from "@/utils/formatAZN";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import LikeButton from "@/components/LikeButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    notFound();
  }

  const [rows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [
    productId,
  ]);

  const product = (rows as Product[])[0];

  if (!product) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isLoggedIn = session?.user;

  const {
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
    liked,
    raiting,
  } = product;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-baseline py-2 px-3 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col lg:flex-row gap-10 mb-7 w-full">
          <div className="w-full lg:w-2/3 rounded-lg overflow-hidden">
            {images?.[0] ? (
              <ProductGallery images={images} brand={brand} model={model} />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/3 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {brand} {model} {year}
            </h1>
            <div className="flex flex-col items-start gap-4 mb-6">
              <div className="sm:flex sm:justify-between sm:items-center sm:w-full text-3xl font-bold text-amber-600">
                <div>{formatAZN(price)} AZN</div>
                <LikeButton initialLiked={liked} id={productId} />
              </div>
              {isLoggedIn ? <AddToCartButton productId={productId} /> : ""}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
              <div>
                <b>Yürüş:</b> {mileage.toLocaleString()} km
              </div>
              <div>
                <b>Kuzov:</b> {bodyType}
              </div>
              <div>
                <b>Rəng:</b> {color}
              </div>
              <div>
                <b>Sükan:</b> {steeringWheel}-hand
              </div>
              <div>
                <b>Reytinq:</b> ⭐ {raiting}
              </div>
              <div>
                <b>Mühərrik:</b> {displacement} L
              </div>
              <div>
                <b>Yanacaq:</b> {engineType}
              </div>
              <div>
                <b>Sürətlər qutusu:</b> {transmission}
              </div>
              <div>
                <b>Ötürücü:</b> {drivetrain}
              </div>
            </div>
          </div>
        </div>

        {description && (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </div>
        )}
      </main>
    </div>
  );
}
