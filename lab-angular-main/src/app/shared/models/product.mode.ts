export interface Product {
  id?: number;
  name: string;
  description: string;
  manufacturer: string;
  manufacturingDate: string;
  price: number;
  quantity: number;
  category?: string;
  ratings?: {
    userId: number; rating: number; review: string; 
}[];
  availabilityStatus?: string;
  supplier?: { name: string; contact: string };
}