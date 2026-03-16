export const CACHE_TAGS = {
  featuredProducts: "featured-products",
  bestSellers: "best-sellers",
  newArrivals: "new-arrivals",
  allProducts: "all-products",
  productExtras: "product-extras",
  relatedProducts: "related-products",
  product: (slug: string) => `product-${slug}`,
} as const;
