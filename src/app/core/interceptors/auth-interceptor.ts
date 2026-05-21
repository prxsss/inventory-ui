import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  if (auth.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  return next(req);
};
