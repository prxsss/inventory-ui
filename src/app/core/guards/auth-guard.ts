import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../auth/token-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.getToken()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
