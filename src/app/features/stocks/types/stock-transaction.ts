import { Product } from '../../products/types/product';

export type StockTransactionType = 'IN' | 'OUT';

export interface StockTransaction {
  id: number;
  productName: string;
  type: StockTransactionType;
  quantity: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockTransactionRequest {
  productId: number;
  type: StockTransactionType;
  quantity: number;
  note: string | null;
}
