import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Tickets } from '../../service/tickets/tickets';
import { Ticket } from '../../interface/tickets';

const REFUND_CUTOFF_MS = 2 * 60 * 60 * 1000;

@Component({
  imports: [DatePipe],
  selector: 'app-my-tickets',
  styleUrl: './my-tickets.scss',
  templateUrl: './my-tickets.html',
})
export class MyTickets {
  private ticketsService = inject(Tickets);

  filter = signal<'upcoming' | 'past'>('upcoming');
  tickets = this.ticketsService.tickets;
  loading = this.ticketsService.loading;
  upcoming = this.ticketsService.upcoming;
  past = this.ticketsService.past;

  visible = computed(() => (this.filter() === 'upcoming' ? this.upcoming() : this.past()));

  refundingId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  refundDeadline(order: Ticket): Date {
    return new Date(new Date(order.session.startsAt).getTime() - REFUND_CUTOFF_MS);
  }

  canRefund(order: Ticket): boolean {
    return order.isRefundable && order.status === 'paid';
  }

  refund(ticket: Ticket): void {
    if (this.refundingId() !== null || !confirm('Refund this order?')) {
      return;
    }

    this.refundingId.set(ticket.id);
    this.errorMessage.set(null);

    this.ticketsService.refund(ticket.reference).subscribe({
      next: () => {
        this.refundingId.set(null);
        this.ticketsService.load();
      },
      error: (err: HttpErrorResponse) => {
        this.refundingId.set(null);
        this.errorMessage.set(err.error?.message ?? 'Refund failed. Please try again.');
      },
    });
  }
}
