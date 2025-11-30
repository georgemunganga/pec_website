export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  features?: string[];
  inStock: boolean;
  badge?: 'sale' | 'sold-out' | 'new';
  brand?: string;
  skinType?: string[];
  stock?: number;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}
