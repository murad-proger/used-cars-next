import { Product } from "@/@types/product";
import Filters from "@/components/Filters";
import Products from "@/components/Products";
import BreadCrumbs from "@/components/BreadCrumbs";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function Catalog({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await searchParamsPromise;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  const priceMin =
    typeof searchParams.priceMin === "string"
      ? Number(searchParams.priceMin)
      : 0;

  const priceMax =
    typeof searchParams.priceMax === "string"
      ? Number(searchParams.priceMax)
      : 2000000;

  const engineMin =
    typeof searchParams.engineMin === "string"
      ? Number(searchParams.engineMin) / 1000
      : 0;

  const engineMax =
    typeof searchParams.engineMax === "string"
      ? Number(searchParams.engineMax) / 1000
      : 8000;

  // 🔹 PRODUCTS QUERY
  let query = supabase.from("products").select("*");

  if (brand) {
    query = query.eq("brand", brand);
  }

  if (selectedModels.length > 0) {
    query = query.in("model", selectedModels);
  }

  query = query
    .gte("price", priceMin)
    .lte("price", priceMax)
    .gte("displacement", engineMin)
    .lte("displacement", engineMax);

  // SORT
  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "brand_asc":
      query = query.order("brand", { ascending: true });
      break;
    case "brand_desc":
      query = query.order("brand", { ascending: false });
      break;
  }

  const { data: productsData, error: productsError } = await query;

  if (productsError) {
    console.error(productsError);
  }

  const products = (productsData || []) as Product[];

  // 🔹 BRANDS
  const { data: brandsData } = await supabase
    .from("products")
    .select("brand");

  const brands = [
    ...new Set((brandsData || []).map((b) => b.brand)),
  ].sort();

  // 🔹 MODELS
  let modelsQuery = supabase.from("products").select("model");

  if (brand) {
    modelsQuery = modelsQuery.eq("brand", brand);
  }

  const { data: modelsData } = await modelsQuery;

  const models = [
    ...new Set((modelsData || []).map((m) => m.model)),
  ].sort();

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