"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, ProductCard, ProductVariant } from "@/entities/product";
import { addToCart } from "@/features/cart/cart-actions";
import { useAppForm } from "@/hooks/form";
import { useCartAlertStore } from "@/store/add-product-store";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AddToCartFormProps = {
  product: ProductCard;
};

const AddToCartForm = ({ product }: AddToCartFormProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );

  const { show } = useCartAlertStore();
  const { quantityInStore, isOutOfStock, displayPrice, price, salePrice } =
    selectedVariant;
  const isOnSale = product.isOnSale && salePrice !== null;

  const form = useAppForm({
    defaultValues: { quantity: 1 },
    onSubmit: async ({ value }) => {
      const response = await addToCart({
        quantity: value.quantity,
        productId: product.id,
        variantId: selectedVariant.id,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      show({
        id: product.id,
        name: product.name,
        image: product.images[0]?.url,
        slug: product.slug,
        variantSize: selectedVariant.size,
        displayPrice: selectedVariant.displayPrice,
        originalPrice: selectedVariant.price,
        isOnSale,
      });
    },
  });

  const handleIncrement = (current: number) => {
    if (current >= quantityInStore) {
      toast.error(
        `Only ${quantityInStore} item${
          quantityInStore === 1 ? "" : "s"
        } left in stock`,
      );
      return;
    }
    form.setFieldValue("quantity", current + 1);
  };

  const handleDecrement = (current: number) => {
    if (current <= 1) return;
    form.setFieldValue("quantity", current - 1);
  };

  const handleInputChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || raw === "") {
      form.setFieldValue("quantity", 1);
      return;
    }
    if (parsed < 1) {
      toast.error("Minimum quantity is 1");
      form.setFieldValue("quantity", 1);
      return;
    }
    if (parsed > quantityInStore) {
      toast.error(
        `Only ${quantityInStore} item${
          quantityInStore === 1 ? "" : "s"
        } left in stock`,
      );
      form.setFieldValue("quantity", quantityInStore);
      return;
    }
    form.setFieldValue("quantity", parsed);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-gray-900 font-geologica">
          {formatPrice(displayPrice)}
        </span>
        {isOnSale && (
          <span className="text-base text-gray-400 line-through">
            {formatPrice(price)}
          </span>
        )}
        {isOnSale && product.sale?.label && (
          <span className="text-xs bg-black text-white px-2 py-0.5">
            {product.sale.label}
          </span>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                setSelectedVariant(variant);
                form.setFieldValue("quantity", 1);
              }}
              aria-label={`Select size ${variant.size}${
                variant.isOutOfStock ? ", out of stock" : ""
              }`}
              aria-pressed={selectedVariant.id === variant.id}
              aria-disabled={variant.isOutOfStock}
              className={cn(
                "px-3 py-1.5 text-sm border rounded-md transition-all tracking-widest font-geologica",
                selectedVariant.id === variant.id
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-700 hover:border-black",
                variant.isOutOfStock && "opacity-40 line-through",
              )}
              disabled={variant.isOutOfStock}
            >
              {variant.size}
            </button>
          ))}
        </div>
      )}

      {product.variants.length === 1 && (
        <span className="inline-block px-3 py-1 font-geologica tracking-widest bg-black text-white rounded-md text-sm w-fit">
          {selectedVariant.size}
        </span>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="my-4 flex w-full gap-3"
      >
        <form.Field name="quantity">
          {(field) => (
            <div className="flex items-center rounded-[49px] gap-2 border border-black min-h-14 md:min-h-16 px-2">
              <Button
                type="button"
                variant="ghost"
                className="w-fit px-0.5 disabled:opacity-30"
                onClick={() => handleDecrement(field.state.value)}
                aria-label="Decrease quantity"
                disabled={field.state.value <= 1}
              >
                <Minus aria-hidden="true" />
              </Button>

              <Input
                type="number"
                id="quantity"
                aria-label="Product quantity"
                aria-live="polite"
                className="w-12 text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-blue-300 rounded-sm p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={field.state.value}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={field.handleBlur}
                min={1}
                max={quantityInStore}
              />

              <Button
                type="button"
                variant="ghost"
                className="w-fit px-0.5"
                onClick={() => handleIncrement(field.state.value)}
                aria-label="Increase quantity"
                disabled={field.state.value >= quantityInStore}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          )}
        </form.Field>

        <form.AppForm>
          <form.SubscribeButton
            className="rounded-[49px] uppercase min-h-14 md:min-h-16 px-8 h-auto flex-1 tracking-widest hover:bg-white border border-primary hover:text-black disabled:opacity-50"
            disabled={isOutOfStock || form.state.isSubmitting}
            label={
              form.state.isSubmitting
                ? "Adding..."
                : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"
            }
          />
        </form.AppForm>
      </form>
    </div>
  );
};

export default AddToCartForm;
