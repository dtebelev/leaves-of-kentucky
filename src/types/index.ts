export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  is_unique: boolean;
  status: 'available' | 'sold';
  created_at: string;
}
