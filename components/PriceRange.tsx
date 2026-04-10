"use client";

import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

type Props = {
  label: string;
  symbol: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
};

export default function PriceRange({
  label,
  symbol,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: Props) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);

  const steps = 500;
  const step = Math.max(1, Math.floor((max - min) / steps));

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold">{label}</label>

      <Slider.Root
        className="relative flex items-center w-full h-2 select-none touch-none bg-zinc-200 rounded"
        min={min}
        max={max}
        step={step}
        value={[localMin, localMax]}
        onValueChange={(vals) => {
          setLocalMin(vals[0]);
          setLocalMax(vals[1]);
        }}
        onValueCommit={(vals) => onChange(vals[0], vals[1])} // только после отпускания
      >
        <Slider.Track className="relative flex-1 h-2 bg-zinc-400 rounded">
          <Slider.Range className="absolute h-2 bg-amber-500 rounded" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-amber-500 rounded-full shadow cursor-pointer" />
        <Slider.Thumb className="block w-5 h-5 bg-amber-500 rounded-full shadow cursor-pointer" />
      </Slider.Root>

      <div className="flex justify-between text-sm text-zinc-600">
        <span>{localMin} {symbol}</span>
        <span>{localMax} {symbol}</span>
      </div>
    </div>
  );
}