import { Routes } from '@angular/router';
import { PublicLayout } from './core/layouts/public-layout/public-layout';
import { ProtectedLayout } from './core/layouts/protected-layout/protected-layout';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    component: PublicLayout,
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register-page/register-page').then((m) => m.RegisterPage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    component: ProtectedLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
      },
    ],
  },
];
