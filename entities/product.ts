interface Segment {
  name: string;
  id: string;
}

interface Category {
  name: string;
  id: string;
}

interface BrandCategory {
  name: string;
  id: string;
}

export default interface ProductExtrasData {
  segment: Segment[];
  category: Category[];
  brand_category: BrandCategory[];
}

export interface Product {
  image: string[];
  out_of_stock: boolean;
  description: string;
  created_at: string;
  minimumItemsToPurchase: number;
  size: string;
  updated_at: string;
  price: number;
  segment: string;
  brandCategory: string;
  category: string;
  name: string;
  brand: string;
  id: string;
  quantityInStore: number;
}
