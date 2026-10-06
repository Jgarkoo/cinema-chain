import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LogInOut } from '../service/log-in-out/log-in-out';

export const guestGuard: CanActivateFn = () => {

  const loginService = inject(LogInOut);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    return router.createUrlTree(['/logged-in-home-page']);
  }

  return true;
};
