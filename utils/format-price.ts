export function formatPrice(price: string | number) {
  if (typeof price === "string") {
    const numericPrice = parseInt(price);
    if (!isNaN(numericPrice)) {
      return "₦" + numericPrice?.toLocaleString("en-NG");
    } else {
      return price;
    }
  } else {
    return "₦" + price?.toLocaleString("en-NG");
  }
}
