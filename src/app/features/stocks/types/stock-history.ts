import { StockTransactionType } from './stock-transaction';

export interface StockHistory {
  id: number;
  type: StockTransactionType;
  quantity: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
