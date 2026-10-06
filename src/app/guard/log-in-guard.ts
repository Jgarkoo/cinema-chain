import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LogInOut } from '../service/log-in-out/log-in-out';

export const logInGuard: CanActivateFn = () => {

  const router = inject(Router);
  const loginService = inject(LogInOut);

  if (loginService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/log-in']);
};
