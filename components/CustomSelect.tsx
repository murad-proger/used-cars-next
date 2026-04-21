"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

// Сложный тип для onChange: в зависимости от multiple
type CustomSelectPropsSingle = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  multiple?: false;
};

type CustomSelectPropsMulti = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple: true;
};

type CustomSelectProps = CustomSelectPropsSingle | CustomSelectPropsMulti;

export default function CustomSelect(props: CustomSelectProps) {
  const { label, options, multiple = false } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // В зависимости от multiple достаём value и onChange
  const value = multiple
    ? (props as CustomSelectPropsMulti).value
    : (props as CustomSelectPropsSingle).value;
  const onChange = multiple
    ? (props as CustomSelectPropsMulti).onChange
    : (props as CustomSelectPropsSingle).onChange;

  // Текущий текст кнопки
  const current = multiple
    ? (value as string[]).length > 0
      ? options
          .filter((o) => (value as string[]).includes(o.value))
          .map((o) => o.label)
          .join(", ")
      : "Seçim edin"
    : (options.find((o) => o.value === (value as string))?.label ?? "Seçim edin");

  // закрытие при клике вне
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // toggle option
  const toggleOption = (val: string) => {
    if (!multiple) {
      (onChange as (v: string) => void)(val);
      setOpen(false);
      return;
    }
    const newValues = Array.isArray(value) ? [...value] : [];
    if (newValues.includes(val)) {
      newValues.splice(newValues.indexOf(val), 1);
    } else {
      newValues.push(val);
    }

    (onChange as (v: string[]) => void)(newValues);
  };

  const clearAll = () => {
    if (!multiple) {
      (onChange as (v: string) => void)("all");
    } else {
      (onChange as (v: string[]) => void)([]);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative z-20">
      <span className="text-sm font-semibold">{label}</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full text-gray-600 rounded border bg-white px-3 py-2 text-left"
      >
        {current}
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow">
          <li
            onClick={clearAll}
            className="cursor-pointer px-3 py-2 text-gray-400 hover:bg-gray-100"
          >
            Seçim edin
          </li>

          {options.map((opt) => {
            const selected = multiple
              ? (value as string[]).includes(opt.value)
              : value === opt.value;
            return (
              <li
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={`text-gray-600 cursor-pointer px-3 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                  selected ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                {multiple && (
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="w-4 h-4"
                  />
                )}
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
