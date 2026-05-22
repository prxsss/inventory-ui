import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { TokenService } from '../auth/token-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  if (tokenService.getToken()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenService.getToken()}`,
      },
    });
  }

  return next(req);
};
