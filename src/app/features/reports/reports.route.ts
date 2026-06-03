import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/reports-page/reports-page').then((m) => m.ReportsPage),
  },
  {
    path: 'low-stock',
    loadComponent: () =>
      import('./pages/low-stock-products-page/low-stock-products-page').then(
        (m) => m.LowStockProductsPage,
      ),
  },
];
