import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketsResponse } from '../../interface/tickets';

@Injectable({ providedIn: 'root' })
export class Tickets {
  private http = inject(HttpClient);

  private readonly ticketsURL = 'https://api.kinoxii.redberryinternship.ge/api/tickets';
  private readonly ordersURL = 'https://api.kinoxii.redberryinternship.ge/api/orders';

  readonly tickets = signal<Ticket[]>([]);
  readonly loading = signal(false);

  readonly upcoming = computed(() =>
    this.tickets()
      .filter((t) => t.isUpcoming)
      .sort(
        (a, b) => new Date(a.session.startsAt).getTime() - new Date(b.session.startsAt).getTime(),
      ),
  );
  readonly past = computed(() =>
    this.tickets()
      .filter((t) => !t.isUpcoming)
      .sort(
        (a, b) => new Date(b.session.startsAt).getTime() - new Date(a.session.startsAt).getTime(),
      ),
  );
  readonly upcomingCount = computed(() => this.upcoming().length);

  load(): void {
    this.loading.set(true);
    this.http.get<TicketsResponse>(this.ticketsURL).subscribe({
      next: (res) => {
        this.tickets.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.loading.set(false);
      },
    });
  }

  refund(reference: string): Observable<unknown> {
    return this.http.post(`${this.ordersURL}/${encodeURIComponent(reference)}/refund`, null);
  }
}
