export const formatAZN = (value: number) => {
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
};