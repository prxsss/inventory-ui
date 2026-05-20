import { Routes } from '@angular/router';
import { PublicLayout } from './core/layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: 'auth',
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
];
