import { CartItem } from "@/entities/cart";
import { formatPrice } from "@/utils/format-price";
import Image from "next/image";

export default function OrderItem({ cartItem }: { cartItem: CartItem }) {
  const itemTotalPrice = cartItem.currentPrice * cartItem.quantity;
  const originalTotalPrice = cartItem.priceAtAdded * cartItem.quantity;
  const hasPriceChange = cartItem.priceChange.changed;

  return (
    <li className="flex items-center justify-between gap-4 md:gap-6 xl:gap-8 py-2">
      <div className="flex gap-3 items-center">
        <div className="h-16 w-16 rounded-md min-w-16 min-h-16 max-h-16 max-w-16 border border-[#ddd] flex justify-center items-center relative bg-white">
          <div className="bg-[rgba(0,0,0,0.6)] w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white absolute -top-2 -right-2">
            {cartItem.quantity}
          </div>
          <Image
            className="object-contain max-h-12 max-w-12"
            src={cartItem.image}
            alt={cartItem.name}
            height={48}
            width={48}
          />
        </div>
        <div className="flex flex-col gap-0.5 font-medium">
          <p className="text-sm x410:text-base text-wrap line-clamp-2 capitalize ">
            {cartItem.name}
          </p>
          <p className="text-xs sm:text-sm text-wrap">{cartItem.size}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 text-sm x410:text-base font-geologica">
        {hasPriceChange ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-semibold">{formatPrice(itemTotalPrice)}</span>
            <span className="line-through text-gray-500 text-sm">
              {formatPrice(originalTotalPrice)}
            </span>
          </div>
        ) : (
          <span>{formatPrice(itemTotalPrice)}</span>
        )}
      </div>
    </li>
  );
}
