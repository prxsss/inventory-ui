import { StockTransactionType } from './stock-transaction';

export interface StockHistory {
  id: number;
  type: StockTransactionType;
  quantity: number;
  note: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
