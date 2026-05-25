export function formatPrice(price: string | number) {
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  if (typeof price === "string") {
    const numericPrice = parseInt(price);

    if (!isNaN(numericPrice)) {
      return format(numericPrice);
    }

    return price;
  }

  return format(price);
}
