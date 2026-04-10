export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  isNew?: boolean;
  featured?: boolean;
  category?: string;
}