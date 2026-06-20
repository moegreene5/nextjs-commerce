export function formatPrice(price: string | number, currency: string = "USD") {
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  if (typeof price === "string") {
    const numericPrice = parseFloat(price);

    if (!isNaN(numericPrice)) {
      return format(numericPrice);
    }

    return price;
  }

  return format(price);
}
