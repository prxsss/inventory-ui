import { Routes } from '@angular/router';
import { ProductsPage } from './pages/products-page/products-page';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsPage,
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-product-page/create-product-page').then((m) => m.CreateProductPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-details-page/product-details-page').then((m) => m.ProductDetailsPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/edit-product-page/edit-product-page').then((m) => m.EditProductPage),
  },
];
