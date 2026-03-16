"use client";

import { ProductExtrasData } from "@/entities/product";
import { useAppForm } from "@/hooks/form";
import {
  CreateProductInput,
  createProductSchema,
} from "@/schema/product.schema";
import { cn } from "@/utils/cn";
import { useStore } from "@tanstack/react-form";
import { Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { createProduct } from "../product-actions";
import { toast } from "sonner";

const FORM_ID = "create-product-form";

interface Props {
  extras: ProductExtrasData;
}

const EMPTY_VARIANT = { size: "", price: "", quantityInStore: "", sku: "" };

export default function CreateProductForm({ extras }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      categoryId: "",
      isFeatured: false,
      isBestSeller: false,
      primaryIndex: 0,
      slug: "",
      images: [] as File[],
      variants: [{ ...EMPTY_VARIANT }],
      sale: undefined,
    } as CreateProductInput,
    validators: {
      onChange: createProductSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        const formData = new FormData();

        Object.entries(value).forEach(([key, val]) => {
          if (
            key === "images" ||
            key === "variants" ||
            key === "sale" ||
            val === "" ||
            val === null ||
            val === undefined
          )
            return;
          formData.append(key, String(val));
        });

        formData.set("primaryIndex", String(value.primaryIndex));

        value.variants.forEach((variant, i) => {
          formData.append(`variants[${i}].size`, variant.size);
          formData.append(`variants[${i}].price`, variant.price);
          formData.append(
            `variants[${i}].quantityInStore`,
            variant.quantityInStore,
          );
          if (variant.sku) formData.append(`variants[${i}].sku`, variant.sku);
        });

        if (value.sale?.type) formData.append("sale.type", value.sale.type);
        if (value.sale?.value) formData.append("sale.value", value.sale.value);
        if (value.sale?.startDate) {
          const localDate = new Date(value.sale.startDate);
          formData.append("sale.startDate", localDate.toISOString());
        }
        if (value.sale?.endDate) {
          const localDate = new Date(value.sale.endDate);
          formData.append("sale.endDate", localDate.toISOString());
        }
        if (value.sale?.label) formData.append("sale.label", value.sale.label);

        value.images.forEach((img) => formData.append("image", img));

        const res = await createProduct(formData);
        if (!res.success) return { form: res.error };

        form.reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Product created Successfully");
      },
    },
    onSubmitInvalid() {
      const invalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;
      invalidInput?.focus();
    },
  });

  const primary = useStore(
    form.baseStore,
    (state: any) => state.values.primaryIndex as number,
  );

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    form.setFieldValue("images", files);
    form.setFieldValue("primaryIndex", 0);
  };

  const removeImage = (index: number) => {
    const current = form.getFieldValue("images") as File[];
    const updated = current.filter((_, i) => i !== index);
    form.setFieldValue("images", updated);
    if (primary === index) form.setFieldValue("primaryIndex", 0);
    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addVariant = () => {
    const current = form.getFieldValue("variants") as typeof EMPTY_VARIANT[];
    if (current.length >= 5) return;
    form.setFieldValue("variants", [...current, { ...EMPTY_VARIANT }]);
  };

  const removeVariant = (index: number) => {
    const current = form.getFieldValue("variants") as typeof EMPTY_VARIANT[];
    if (current.length === 1) return;
    form.setFieldValue(
      "variants",
      current.filter((_, i) => i !== index),
    );
  };

  const updateVariant = (
    index: number,
    field: keyof typeof EMPTY_VARIANT,
    value: string,
  ) => {
    const current = form.getFieldValue("variants") as typeof EMPTY_VARIANT[];
    const updated = current.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    form.setFieldValue("variants", updated);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form
        id={FORM_ID}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Product Name" required type="text" />
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => <field.TextArea label="Description" required />}
        </form.AppField>

        <div className="grid sm:grid-cols-2 gap-4">
          <form.AppField name="brand">
            {(field) => (
              <field.SelectField
                label="Brand"
                required
                options={extras.brands.map((b) => ({
                  label: b.name,
                  value: b.name,
                }))}
              />
            )}
          </form.AppField>

          <form.AppField name="categoryId">
            {(field) => (
              <field.SelectField
                label="Category"
                required
                options={extras.categories.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="slug">
          {(field) => (
            <field.TextField
              label="Slug (optional — auto-generated from name)"
              type="text"
            />
          )}
        </form.AppField>

        <form.AppField name="variants">
          {(field) => {
            const variants =
              (field.state.value as typeof EMPTY_VARIANT[]) ?? [];
            const error = field.state.meta.errors[0];

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    Variants <span className="text-red-500">*</span>
                    <span className="text-stone-400 font-normal ml-1">
                      (max 5)
                    </span>
                  </span>
                  {variants.length < 5 && (
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 hover:border-stone-400 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add variant
                    </button>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error.message}
                  </p>
                )}

                <div className="space-y-3">
                  {variants.map((variant, i) => (
                    <div
                      key={i}
                      className="border border-stone-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">
                          Variant {i + 1}
                        </span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-stone-700">
                            Size <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variant.size}
                            placeholder="e.g. 30ml, 250ml"
                            onChange={(e) =>
                              updateVariant(i, "size", e.target.value)
                            }
                            className="w-full h-10 px-3 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-stone-700">
                            Price (₦) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            placeholder="e.g. 8500"
                            onChange={(e) =>
                              updateVariant(i, "price", e.target.value)
                            }
                            className="w-full h-10 px-3 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-stone-700">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.quantityInStore}
                            placeholder="e.g. 50"
                            onChange={(e) =>
                              updateVariant(
                                i,
                                "quantityInStore",
                                e.target.value,
                              )
                            }
                            className="w-full h-10 px-3 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-stone-700">
                            SKU
                            <span className="text-stone-400 font-normal ml-1">
                              (optional)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            placeholder="e.g. ORD-NIA-30"
                            onChange={(e) =>
                              updateVariant(i, "sku", e.target.value)
                            }
                            className="w-full h-10 px-3 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        </form.AppField>

        <div className="flex gap-6">
          <form.AppField name="isFeatured">
            {(field) => <field.CheckboxField label="Featured product" />}
          </form.AppField>

          <form.AppField name="isBestSeller">
            {(field) => <field.CheckboxField label="Best seller" />}
          </form.AppField>
        </div>

        <form.AppField name="images">
          {(field) => {
            const images = (field.state.value as File[]) ?? [];
            const previews = images.map((f) => URL.createObjectURL(f));
            const error = field.state.meta.errors[0];

            return (
              <div className="space-y-3">
                <div className="text-sm font-medium text-stone-700">
                  Images <span className="text-red-500">*</span>
                  <span className="text-stone-400 font-normal ml-1">
                    (max 6 · JPG/PNG/WEBP/AVIF · under 5MB each)
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleImages}
                  className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:border file:border-stone-200 file:text-xs file:font-medium file:tracking-widest file:uppercase file:bg-white hover:file:bg-stone-50 cursor-pointer"
                />

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error.message}
                  </p>
                )}

                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative">
                        <button
                          type="button"
                          onClick={() => form.setFieldValue("primaryIndex", i)}
                          className={cn(
                            "relative w-24 h-24 border-2 overflow-hidden block",
                            primary === i
                              ? "border-stone-800"
                              : "border-stone-200 hover:border-stone-400",
                          )}
                        >
                          <Image
                            src={src}
                            alt={`Preview ${i + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                          {primary === i && (
                            <span className="absolute bottom-0 inset-x-0 text-[10px] text-center bg-stone-800 text-white py-0.5">
                              Primary
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        </form.AppField>

        <details className="border border-stone-200 p-4">
          <summary className="cursor-pointer text-sm font-medium text-stone-700 select-none">
            Add sale (optional)
          </summary>

          <div className="space-y-4 mt-4">
            <form.AppField name="sale.type">
              {(field) => (
                <field.SelectField
                  label="Sale type"
                  options={[
                    { label: "Percentage off", value: "percentage" },
                    { label: "Fixed amount off", value: "fixed" },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField name="sale.value">
              {(field) => <field.TextField label="Sale value" type="number" />}
            </form.AppField>

            <div className="grid sm:grid-cols-2 gap-4">
              <form.AppField name="sale.startDate">
                {(field) => (
                  <field.TextField label="Start date" type="datetime-local" />
                )}
              </form.AppField>

              <form.AppField name="sale.endDate">
                {(field) => (
                  <field.TextField label="End date" type="datetime-local" />
                )}
              </form.AppField>
            </div>

            <form.AppField name="sale.label">
              {(field) => (
                <field.TextField
                  label='Sale label (e.g. "Summer Sale")'
                  type="text"
                />
              )}
            </form.AppField>
          </div>
        </details>

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => {
            const formError = error as { form?: string } | string | undefined;
            const message =
              typeof formError === "object" ? formError?.form : undefined;

            return message ? (
              <p className="text-sm text-red-500 text-center" role="alert">
                {message}
              </p>
            ) : null;
          }}
        </form.Subscribe>

        <form.AppForm>
          <form.SubscribeButton
            className="h-14 rounded-3xl w-full hover:bg-white hover:text-black transition-colors duration-200 ease-in border border-black"
            icon={Package}
            label="Create Product"
          />
        </form.AppForm>
      </form>
    </div>
  );
}
