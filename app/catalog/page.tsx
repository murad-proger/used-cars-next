import { db } from "@/lib/db";
import { Product } from "@/@types/product";
import Filters from "@/components/Filters";
import Products from "@/components/Products";
import BreadCrumbs from "@/components/BreadCrumbs";

export default async function Catalog({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  const searchParams = await searchParamsPromise;

  const sort =
    typeof searchParams.sort === "string"
      ? searchParams.sort
      : undefined;

  const brand =
    typeof searchParams?.brand === "string" && searchParams.brand !== "all"
      ? searchParams.brand
      : undefined;

  const selectedModels =
    searchParams?.model
      ? Array.isArray(searchParams.model)
        ? searchParams.model.filter((m) => m !== "all")
        : searchParams.model !== "all"
        ? [searchParams.model]
        : []
      : [];

  // BRAND
  if (brand) {
    values.push(brand);
    conditions.push(`brand = $${values.length}`);
  }

  // MODELS
  if (selectedModels.length > 0) {
    values.push(...selectedModels);
    const placeholders = selectedModels
      .map((_, i) => `$${values.length - selectedModels.length + i + 1}`)
      .join(", ");

    conditions.push(`model IN (${placeholders})`);
  }

  // PRICE
  const priceMin =
    typeof searchParams.priceMin === "string"
      ? Number(searchParams.priceMin)
      : 0;

  const priceMax =
    typeof searchParams.priceMax === "string"
      ? Number(searchParams.priceMax)
      : 2000000;

  if (!Number.isNaN(priceMin) && !Number.isNaN(priceMax)) {
    values.push(priceMin, priceMax);
    conditions.push(`price BETWEEN $${values.length - 1} AND $${values.length}`);
  }

  // ENGINE
  const engineMin =
    typeof searchParams.engineMin === "string"
      ? Number(searchParams.engineMin) / 1000
      : 0;

  const engineMax =
    typeof searchParams.engineMax === "string"
      ? Number(searchParams.engineMax) / 1000
      : 8000;

  if (!Number.isNaN(engineMin) && !Number.isNaN(engineMax)) {
    values.push(engineMin, engineMax);
    conditions.push(
      `displacement BETWEEN $${values.length - 1} AND $${values.length}`
    );
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "";

  switch (sort) {
    case "price_asc":
      orderBy = "ORDER BY price ASC";
      break;
    case "price_desc":
      orderBy = "ORDER BY price DESC";
      break;
    case "brand_asc":
      orderBy = "ORDER BY brand ASC";
      break;
    case "brand_desc":
      orderBy = "ORDER BY brand DESC";
      break;
  }

  // PRODUCTS
  const [cars] = await db.query(
    `SELECT * FROM products ${where} ${orderBy}`,
    values
  );

  const products = cars as Product[];

  // BRANDS
  const [brandsRows] = await db.query(
    `SELECT DISTINCT brand FROM products ORDER BY brand`
  );

  // MODELS (FIXED POSTGRES STYLE)
  const [modelsRows] = await db.query(
    brand
      ? `SELECT DISTINCT model FROM products WHERE brand = $1 ORDER BY model`
      : `SELECT DISTINCT model FROM products ORDER BY model`,
    brand ? [brand] : []
  );

  const brands = (brandsRows as { brand: string }[]).map((b) => b.brand);

  const models = (modelsRows as { model: string }[]).map((m) => m.model);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-baseline py-2 px-3 bg-white dark:bg-black sm:items-start">
        <BreadCrumbs />
        <h1 className="font-bold text-3xl text-amber-600 mb-7">Catalog</h1>

        <div className="flex flex-col sm:flex-row gap-5 w-full">
          <Filters
            brands={brands}
            models={models}
            priceMin={priceMin}
            priceMax={priceMax}
            engineMin={engineMin}
            engineMax={engineMax}
          />
          <Products products={products} />
        </div>
      </main>
    </div>
  );
}