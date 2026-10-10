import { Injectable, signal } from '@angular/core';
import { Observable, ReplaySubject, switchMap, take, throwError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthModal {
  readonly loginOpen = signal(false);

  private pending: ReplaySubject<boolean> | null = null;

  open(): void {
    this.loginOpen.set(true);
  }

  requestLogin(): Observable<void> {
    if (!this.pending) {
      this.pending = new ReplaySubject<boolean>(1);
    }
    this.loginOpen.set(true);

    return this.pending.pipe(
      take(1),
      switchMap((ok) => (ok ? of(void 0) : throwError(() => new Error('login dismissed')))),
    );
  }

  succeeded(): boolean {
    const hadPending = !!this.pending;
    this.pending?.next(true);
    this.pending = null;
    this.loginOpen.set(false);
    return hadPending;
  }

  dismissed(): void {
    this.pending?.next(false);
    this.pending = null;
    this.loginOpen.set(false);
  }
}
