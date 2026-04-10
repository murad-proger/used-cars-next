"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FiltersProps } from "@/@types/filtersProps";
import CustomSelect from "./CustomSelect";
import PriceRange from "./PriceRange";

export default function Filters({
  brands,
  models,
  priceMin,
  priceMax,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrand = searchParams.get("brand") ?? "all";
  const selectedModels = searchParams.getAll("model");
  const selectedSort = searchParams.get("sort") ?? "all";
  const engineMin = Number(searchParams.get("engineMin")) || 0;
  const engineMax = Number(searchParams.get("engineMax")) || 8000;

  function updateParam(key: string, value: string | string[]) {
    const params = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => {
        if (v !== "all") params.append(key, v);
      });
      if (value.length === 0) params.delete(key);
    } else {
      if (value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.replace(`?${params.toString()}`);
  }

  function updatePrice(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("priceMin", String(min));
    params.set("priceMax", String(max));
    router.replace(`?${params.toString()}`);
  }

  function updateEngine(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("engineMin", String(min));
    params.set("engineMax", String(max));
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5 w-full sm:max-w-60 rounded-lg border bg-white p-4 pb-6 dark:bg-zinc-900">
      <h3 className="text-xl font-semibold text-amber-600">Filtrlər</h3>

      <CustomSelect
        label="Marka"
        value={selectedBrand}
        onChange={(value) => updateParam("brand", value)}
        options={brands.map((b) => ({ label: b, value: b }))}
        multiple={false}
      />

      <CustomSelect
        label="Model"
        value={selectedModels.length ? selectedModels : []}
        onChange={(value) => updateParam("model", value)}
        options={models.map((m) => ({ label: m, value: m }))}
        multiple={true}
      />

      <PriceRange
        key={`${priceMin}-${priceMax}`}
        label="Qiymət"
        symbol="₼"
        min={0}
        max={2000000}
        valueMin={priceMin}
        valueMax={priceMax}
        onChange={updatePrice}
      />

      <PriceRange
        key={`engine-${engineMin}-${engineMax}`}
        label={"Motorun həcmi"}
        symbol=""
        min={0}
        max={8000}
        valueMin={engineMin}
        valueMax={engineMax}
        onChange={updateEngine}
      />

      <CustomSelect
        label="Sırala"
        value={selectedSort}
        onChange={(value) => updateParam("sort", value)}
        options={[
          { label: "Price ↑", value: "price_asc" },
          { label: "Price ↓", value: "price_desc" },
          { label: "Brand A–Z", value: "brand_asc" },
          { label: "Brand Z–A", value: "brand_desc" },
        ]}
        multiple={false}
      />
    </div>
  );
}