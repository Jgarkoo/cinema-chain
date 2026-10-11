import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Booking } from '../../service/booking/booking';
import { Session as SessionApi } from '../../service/session/session';
import { Tickets } from '../../service/tickets/tickets';
import { LogInOut } from '../../service/log-in-out/log-in-out';
import { MovieDetail } from '../../interface/movie';
import { Showtime } from '../../interface/session';
import { TicketType } from '../../interface/filter';
import { Order, Seat, SeatHold, SeatMap } from '../../interface/booking';

type Step = 'seats' | 'checkout' | 'done';

interface Selected {
  seat: Seat;
  ticketType: string;
}

interface Notice {
  kind: 'warning' | 'error';
  text: string;
  profileLink?: boolean;
}

const DEFAULT_MAX_SEATS = 3;
const EXPIRED_MESSAGE = 'Your hold time expired. Please re-select your seats.';

@Component({
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  selector: 'app-booking-modal',
  styleUrl: './booking-modal.scss',
  templateUrl: './booking-modal.html',
})
export class BookingModal implements OnInit {
  movie = input.required<MovieDetail>();
  session = input.required<Showtime>();
  closed = output<void>();

  private booking = inject(Booking);
  private sessionApi = inject(SessionApi);
  private ticketsService = inject(Tickets);
  private auth = inject(LogInOut);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  step = signal<Step>('seats');
  seatMap = signal<SeatMap | null>(null);
  mapLoading = signal(true);
  selection = signal<Selected[]>([]);
  ticketTypes = signal<TicketType[]>([]);
  maxSeats = signal(DEFAULT_MAX_SEATS);
  hold = signal<SeatHold | null>(null);
  order = signal<Order | null>(null);
  notice = signal<Notice | null>(null);
  holding = signal(false);
  paying = signal(false);
  serverErrors = signal<Record<string, string>>({});

  private now = signal(Date.now());
  private previousBodyOverflow = '';

  allowedTicketTypes = computed(() => {
    const minAge = this.movie().ageRating.minAge;
    return this.ticketTypes().filter(
      (type) => type.blockedFromRatingAge == null || minAge < Number(type.blockedFromRatingAge),
    );
  });

  selectedIds = computed(() => new Set(this.selection().map((s) => s.seat.id)));

  subtotal = computed(() =>
    this.selection().reduce((sum, s) => sum + this.priceFor(s.ticketType), 0),
  );

  secondsLeft = computed(() => {
    const hold = this.hold();
    if (!hold) return 0;
    return Math.max(0, Math.ceil((new Date(hold.expiresAt).getTime() - this.now()) / 1000));
  });

  countdown = computed(() => {
    const seconds = this.secondsLeft();
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  heldSummary = computed(() => this.summarise(this.hold()?.seats ?? []));
  orderSummary = computed(() => this.summarise(this.order()?.tickets ?? []));

  checkoutForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    mobileNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\s*5(\s*\d){8}\s*$/)],
    }),
    cardNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\s*(\d\s*){16}$/)],
    }),
    expiry: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
    }),
    cvv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{3}$/)],
    }),
  });

  constructor() {
    if (this.isBrowser) {
      const timer = setInterval(() => this.tick(), 1000);
      inject(DestroyRef).onDestroy(() => {
        clearInterval(timer);
        this.unlockScroll();
      });
    }
  }

  ngOnInit(): void {
    this.lockScroll();
    this.loadSeats();
    this.sessionApi.filterByOptions().subscribe({
      next: (options) => {
        this.ticketTypes.set(options.ticketTypes ?? []);
        this.maxSeats.set(options.maxSeatsPerOrder || DEFAULT_MAX_SEATS);
      },
      error: (error) => console.error(error),
    });

    const user = this.auth.user();
    this.checkoutForm.patchValue({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      mobileNumber: user?.mobileNumber ?? '',
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  isSelected(seat: Seat): boolean {
    return this.selectedIds().has(seat.id);
  }

  isSelectable(seat: Seat): boolean {
    return seat.state === 'available' || seat.isMine;
  }

  toggleSeat(seat: Seat): void {
    if (!this.isSelectable(seat)) return;

    if (this.isSelected(seat)) {
      this.selection.update((list) => list.filter((s) => s.seat.id !== seat.id));
      return;
    }
    if (this.selection().length >= this.maxSeats()) {
      this.notice.set({ kind: 'warning', text: `You can pick up to ${this.maxSeats()} seats.` });
      return;
    }
    this.notice.set(null);
    this.selection.update((list) => [...list, { seat, ticketType: 'adult' }]);
  }

  changeTicketType(seatId: number, ticketType: string): void {
    this.selection.update((list) =>
      list.map((s) => (s.seat.id === seatId ? { ...s, ticketType } : s)),
    );
  }

  priceFor(ticketType: string): number {
    const ratio = Number(this.ticketTypes().find((t) => t.slug === ticketType)?.priceRatio ?? 1);
    return Math.round(this.session().price * ratio * 100) / 100;
  }

  goToSeats(): void {
    if (this.step() === 'checkout') {
      this.step.set('seats');
    }
  }

  holdSeats(): void {
    if (!this.selection().length || this.holding()) return;

    this.holding.set(true);
    this.notice.set(null);
    const seats = this.selection().map((s) => ({ seatId: s.seat.id, ticketType: s.ticketType }));

    this.booking.holdSeats(this.session().id, seats).subscribe({
      next: (hold) => {
        this.holding.set(false);
        this.hold.set(hold);
        this.now.set(Date.now());
        this.serverErrors.set({});
        this.step.set('checkout');
      },
      error: (err: HttpErrorResponse) => {
        this.holding.set(false);
        this.handleBookingError(err);
      },
    });
  }

  pay(): void {
    const hold = this.hold();
    if (!hold || this.paying()) return;
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.paying.set(true);
    this.notice.set(null);
    this.serverErrors.set({});

    this.booking
      .createOrder({ holdId: hold.holdId, ...this.checkoutForm.getRawValue() })
      .subscribe({
        next: (order) => {
          this.paying.set(false);
          this.hold.set(null);
          this.order.set(order);
          this.step.set('done');
          this.ticketsService.load();
        },
        error: (err: HttpErrorResponse) => {
          this.paying.set(false);
          this.handleBookingError(err);
        },
      });
  }

  fieldError(name: keyof typeof this.checkoutForm.controls): string | null {
    const server = this.serverErrors()[name];
    if (server) return server;

    const control = this.checkoutForm.controls[name];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Enter a valid email';
    if (control.hasError('minlength')) return 'Too short';
    if (control.hasError('maxlength')) return 'Too long';
    const messages: Record<string, string> = {
      mobileNumber: 'Use 9 digits starting with 5',
      cardNumber: 'Card number must be 16 digits',
      expiry: 'Use MM/YY',
      cvv: 'CVV must be 3 digits',
    };
    return messages[name] ?? 'Invalid value';
  }

  viewTickets(): void {
    this.closed.emit();
    this.router.navigate(['/profile'], { queryParams: { tab: 'tickets' } });
  }

  backToHome(): void {
    this.closed.emit();
    this.router.navigate(['/logged-in-home-page']);
  }

  close(): void {
    const hold = this.hold();
    if (hold && this.step() !== 'done') {
      this.booking.releaseHold(hold.holdId).subscribe({ error: () => {} });
    }
    this.closed.emit();
  }

  private handleBookingError(err: HttpErrorResponse): void {
    const body = err.error ?? {};

    if (err.status === 409) {
      const contested: string[] = body.contested ?? [];
      this.dropContested(contested);
      this.notice.set({
        kind: 'warning',
        text: contested.length
          ? `Seat${contested.length > 1 ? 's' : ''} ${contested.join(', ')} ${contested.length > 1 ? 'were' : 'was'} just taken. Pick another seat to continue.`
          : (body.message ?? 'Some of those seats were just taken.'),
      });
      this.hold.set(null);
      this.step.set('seats');
      this.loadSeats();
      return;
    }

    if (err.status === 422 && body.errors) {
      const mapped: Record<string, string> = {};
      for (const [key, messages] of Object.entries(body.errors as Record<string, string[]>)) {
        mapped[key] = messages[0];
      }
      this.serverErrors.set(mapped);
      const onForm = Object.keys(mapped).some((key) => key in this.checkoutForm.controls);
      if (this.step() !== 'checkout' || !onForm) {
        this.notice.set({ kind: 'error', text: Object.values(mapped).join(' ') });
      }
      return;
    }

    if (err.status === 422) {
      const message: string = body.message ?? 'This booking is not allowed.';
      if (this.step() === 'checkout') {
        this.expire(message);
        return;
      }
      this.notice.set({
        kind: 'error',
        text: message,
        profileLink: /profile/i.test(message),
      });
      return;
    }

    if (err.status === 403) {
      this.notice.set({
        kind: 'error',
        text: body.message ?? 'This hold belongs to another account.',
      });
      return;
    }

    this.notice.set({ kind: 'error', text: 'Something went wrong. Please try again.' });
  }

  private dropContested(codes: string[]): void {
    if (!codes.length) return;
    const lost = new Set(codes);
    this.selection.update((list) => list.filter((s) => !lost.has(s.seat.code)));
    this.seatMap.update((map) =>
      map
        ? {
            ...map,
            sections: map.sections.map((section) => ({
              ...section,
              rows: section.rows.map((row) => ({
                ...row,
                seats: row.seats.map((seat) =>
                  lost.has(seat.code) ? { ...seat, state: 'sold' as const, isMine: false } : seat,
                ),
              })),
            })),
          }
        : map,
    );
  }

  private expire(message = EXPIRED_MESSAGE): void {
    this.hold.set(null);
    this.selection.set([]);
    this.step.set('seats');
    this.notice.set({ kind: 'warning', text: message });
    this.loadSeats();
  }

  private tick(): void {
    this.now.set(Date.now());
    if (this.hold() && this.step() !== 'done' && this.secondsLeft() === 0) {
      this.expire();
    }
  }

  private loadSeats(): void {
    this.mapLoading.set(true);
    this.booking.fetchSeats(this.session().id).subscribe({
      next: (map) => {
        this.seatMap.set(map);
        this.mapLoading.set(false);
        this.reconcileSelection(map);
      },
      error: (error) => {
        console.error(error);
        this.mapLoading.set(false);
        this.notice.set({ kind: 'error', text: 'Could not load the seat map. Please try again.' });
      },
    });
  }

  private reconcileSelection(map: SeatMap): void {
    const seats = map.sections.flatMap((section) => section.rows.flatMap((row) => row.seats));
    const byId = new Map(seats.map((seat) => [seat.id, seat]));

    if (!this.selection().length) {
      const mine = seats.filter((seat) => seat.isMine).slice(0, this.maxSeats());
      this.selection.set(mine.map((seat) => ({ seat, ticketType: 'adult' })));
      return;
    }
    this.selection.update((list) =>
      list
        .map((s) => ({ ...s, seat: byId.get(s.seat.id) ?? s.seat }))
        .filter((s) => this.isSelectable(s.seat)),
    );
  }

  private summarise(items: { code?: string; seatCode?: string; ticketType: { name: string } }[]) {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.ticketType.name, (counts.get(item.ticketType.name) ?? 0) + 1);
    }
    return {
      seats: items.map((item) => item.code ?? item.seatCode).join(', '),
      tickets: [...counts].map(([name, count]) => `${count} x ${name}`).join(', '),
    };
  }

  private lockScroll(): void {
    const body = this.document.body;
    if (!body) return;
    this.previousBodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    const body = this.document.body;
    if (!body) return;
    body.style.overflow = this.previousBodyOverflow;
  }
}
