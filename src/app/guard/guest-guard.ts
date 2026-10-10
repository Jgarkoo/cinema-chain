import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LogInOut } from '../service/log-in-out/log-in-out';

export const guestGuard: CanActivateFn = () => {

  const auth = inject(LogInOut);
  const router = inject(Router);
  return auth.loggedIn() ? router.createUrlTree(['/logged-in-home-page']) : true;

};
