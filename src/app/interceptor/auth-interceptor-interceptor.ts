import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { LogInOut } from '../service/log-in-out/log-in-out';
import { AuthModal } from '../service/auth-modal/auth-modal';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(LogInOut);
  const modal = inject(AuthModal);

  if (!req.url.startsWith('https://api.kinoxii.redberryinternship.ge')) {
    return next(req);
  }

  const isAuthCall =
    req.url === auth.logInURL || req.url === auth.signUpURL || req.url === auth.logOutURL;

  const withToken = (r: HttpRequest<unknown>) => {
    const token = auth.token();
    return token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;
  };

  return next(withToken(req)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall) {
        return throwError(() => err);
      }

      auth.clearSession();
      return modal.requestLogin().pipe(
        switchMap(() => next(withToken(req))),
        catchError(() => throwError(() => err)),
      );
    }),
  );
};
