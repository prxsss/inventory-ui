export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>;
