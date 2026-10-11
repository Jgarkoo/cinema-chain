import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { BookingModal } from '../booking-modal/booking-modal';
import { Movies } from '../../service/movies/movies';
import { Booking } from '../../service/booking/booking';
import { LogInOut } from '../../service/log-in-out/log-in-out';
import { MovieDetail } from '../../interface/movie';
import { Showtime } from '../../interface/session';
import { VenueSessions } from '../../interface/booking';

interface Day {
  iso: string;
  weekday: string;
  day: number;
}

interface HallGroup {
  name: string;
  sessions: Showtime[];
}

interface VenueGroup {
  name: string;
  halls: HallGroup[];
}

@Component({
  imports: [Header, Footer, BookingModal, DatePipe],
  selector: 'app-buy-ticket',
  styleUrl: './buy-ticket.scss',
  templateUrl: './buy-ticket.html',
})
export class BuyTicket {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private movieService = inject(Movies);
  private booking = inject(Booking);
  private auth = inject(LogInOut);

  movie = signal<MovieDetail | null>(null);
  loading = signal(true);
  notFound = signal(false);

  days = this.buildDays();
  selectedDate = signal(this.days[0].iso);
  sessionsByDate = signal<Record<string, VenueSessions[]>>({});
  sessionsLoading = signal(true);

  activeSession = signal<Showtime | null>(null);

  weekSessionCount = computed(() =>
    Object.values(this.sessionsByDate()).reduce(
      (sum, venues) => sum + venues.reduce((n, v) => n + v.sessions.length, 0),
      0,
    ),
  );

  venueGroups = computed<VenueGroup[]>(() =>
    (this.sessionsByDate()[this.selectedDate()] ?? []).map((group) => {
      const halls = new Map<string, Showtime[]>();
      for (const session of group.sessions) {
        halls.set(session.hall.name, [...(halls.get(session.hall.name) ?? []), session]);
      }
      return {
        name: group.venue.name,
        halls: [...halls].map(([name, sessions]) => ({ name, sessions })),
      };
    }),
  );

  formatNames = computed(() => (this.movie()?.formats ?? []).map((f) => f.name).join(', '));

  tooYoung = computed(() => {
    const age = Number(this.auth.user()?.age);
    const minAge = this.movie()?.ageRating.minAge ?? 0;
    return Number.isFinite(age) && age > 0 && age < minAge;
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('movie');
      const sessionId = Number(params.get('session'));
      if (!slug) {
        this.router.navigate(['/session']);
        return;
      }
      if (slug !== this.movie()?.slug) {
        this.load(slug);
      }
      if (sessionId) {
        this.openSessionById(sessionId);
      }
    });
  }

  hasSessions(day: Day): boolean {
    const loaded = this.sessionsByDate()[day.iso];
    if (loaded) return loaded.length > 0;
    return this.movie()?.availableDates?.includes(day.iso) ?? false;
  }

  selectDate(iso: string): void {
    this.selectedDate.set(iso);
  }

  openSession(session: Showtime): void {
    if (session.isSoldOut || this.tooYoung()) return;
    this.activeSession.set(session);
  }

  closeSession(): void {
    this.activeSession.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { session: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    const slug = this.movie()?.slug;
    if (slug) this.loadSessions(slug);
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.movieService.fetchMovie(slug).subscribe({
      next: (res) => {
        this.movie.set(res.data);
        this.loading.set(false);
        this.loadSessions(slug);
      },
      error: (error) => {
        console.error(error);
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  private loadSessions(slug: string): void {
    this.sessionsLoading.set(true);
    const requests = this.days.map((day) =>
      this.booking.fetchMovieSessions(slug, day.iso).pipe(
        catchError(() => of<VenueSessions[]>([])),
        map((venues) => [day.iso, venues] as const),
      ),
    );
    forkJoin(requests).subscribe((entries) => {
      const byDate = Object.fromEntries(entries);
      this.sessionsByDate.set(byDate);
      this.sessionsLoading.set(false);
      if (!byDate[this.selectedDate()]?.length) {
        const firstWithSessions = this.days.find((d) => byDate[d.iso]?.length);
        if (firstWithSessions) this.selectedDate.set(firstWithSessions.iso);
      }
    });
  }

  private openSessionById(sessionId: number): void {
    if (this.activeSession()?.id === sessionId) return;
    this.booking.fetchSession(sessionId).subscribe({
      next: (session) => {
        if (this.days.some((d) => d.iso === session.date)) {
          this.selectedDate.set(session.date);
        }
        this.openSession(session);
      },
      error: (error) => console.error(error),
    });
  }

  private buildDays(): Day[] {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { iso, weekday: names[d.getDay()], day: d.getDate() };
    });
  }
}
