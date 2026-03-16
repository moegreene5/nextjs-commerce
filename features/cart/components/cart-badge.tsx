import { getCart } from "../cart-queries";
import CartBadgeClient from "./cart-badge-client";

export default async function CartBadge() {
  const cart = await getCart();

  return <CartBadgeClient data={cart} />;
}
