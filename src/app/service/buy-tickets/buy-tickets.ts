import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LogInOut } from '../log-in-out/log-in-out';
import { AuthModal } from '../auth-modal/auth-modal';

@Injectable({ providedIn: 'root' })
export class BuyTicketNav {
  private router = inject(Router);
  private auth = inject(LogInOut);
  private authModal = inject(AuthModal);

  open(slug: string, sessionId?: number): void {
    const go = () =>
      this.router.navigate(['/buy-ticket'], {
        queryParams: { movie: slug, session: sessionId ?? null },
      });
    if (this.auth.loggedIn()) {
      go();
      return;
    }
    this.authModal.requestLogin().subscribe({ next: go, error: () => {} });
  }
}
