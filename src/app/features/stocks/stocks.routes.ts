import { Routes } from '@angular/router';
import { StockTransactionsPage } from './stock-transactions-page/stock-transactions-page';

export const STOCKS_ROUTES: Routes = [
  {
    path: '',
    component: StockTransactionsPage,
  },
];
