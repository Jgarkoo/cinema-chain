import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Session as SessionApi } from '../../service/session/session';
import { BuyTicketNav } from '../../service/buy-tickets/buy-tickets';
import { Filter } from '../../interface/filter';
import { Movie } from '../../interface/movie';
import { MovieSessions, SessionQuery } from '../../interface/session';

const PAGE_SIZE = 4;

const matches = (selected: string[], value: string): boolean =>
  selected.length === 0 || selected.includes(value);

@Component({
  imports: [Header, Footer],
  selector: 'app-sessions',
  styleUrl: './sessions.scss',
  templateUrl: './sessions.html',
})
export class Sessions {
  private sessionApi = inject(SessionApi);
  private ticketNav = inject(BuyTicketNav);

  filterMovies = signal<Filter | null>(null);
  selectedVenues = signal<string[]>([]);
  selectedAgeRating = signal<string[]>([]);
  selectedFormats = signal<string[]>([]);
  selectedLanguage = signal<string[]>([]);
  selectedTimeOfDay = signal<string[]>([]);
  selectedDate = signal<string | null>(null);
  selectedSort = signal<string | null>(null);
  page = signal(1);

  allGroups = signal<MovieSessions[]>([]);
  loading = signal(true);

  days = this.buildDays();

  activeFiltersCount = computed(
    () =>
      this.selectedVenues().length +
      this.selectedAgeRating().length +
      this.selectedFormats().length +
      this.selectedLanguage().length +
      this.selectedTimeOfDay().length +
      (this.selectedDate() ? 1 : 0),
  );

  filteredGroups = computed<MovieSessions[]>(() => {
    const venues = this.selectedVenues();
    const ageRatings = this.selectedAgeRating();
    const formats = this.selectedFormats();
    const languages = this.selectedLanguage();
    const timeBands = this.selectedTimeOfDay();

    return this.allGroups()
      .filter((group) => matches(ageRatings, group.movie.ageRating.code))
      .map((group) => ({
        ...group,
        sessions: group.sessions.filter(
          (s) =>
            matches(venues, s.venue.slug) &&
            matches(formats, s.format.slug) &&
            matches(languages, s.language.slug) &&
            matches(timeBands, s.timeBand),
        ),
      }))
      .filter((group) => group.sessions.length > 0);
  });

  totalSessions = computed(() =>
    this.filteredGroups().reduce((sum, group) => sum + group.sessions.length, 0),
  );

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredGroups().length / PAGE_SIZE)));

  movieGroups = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filteredGroups().slice(start, start + PAGE_SIZE);
  });

  pages = computed<(number | null)[]>(() => {
    const last = this.totalPages();
    const current = this.page();
    const wanted = new Set([1, last, current - 1, current, current + 1]);
    const numbers = [...wanted].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);

    const result: (number | null)[] = [];
    numbers.forEach((n, i) => {
      if (i > 0 && n - numbers[i - 1] > 1) result.push(null);
      result.push(n);
    });
    return result;
  });

  private query = computed<SessionQuery>(() => ({
    date: this.selectedDate(),
    sort: this.selectedSort(),
    venues: this.selectedVenues(),
    formats: this.selectedFormats(),
    languages: this.selectedLanguage(),
    timeBands: this.selectedTimeOfDay(),
  }));

  constructor() {
    toObservable(this.query)
      .pipe(
        debounceTime(150),
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.sessionApi.fetchAllSessions(query).pipe(
            catchError((error) => {
              console.error(error);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((groups) => {
        if (groups) {
          this.allGroups.set(groups);
        }
        this.loading.set(false);
      });
  }

  ngOnInit() {
    this.getfilterOption();
  }

  getfilterOption() {
    this.sessionApi.filterByOptions().subscribe({
      next: (res) => this.filterMovies.set(res),
    });
  }

  private toggle(target: WritableSignal<string[]>, value: string, checked: boolean) {
    target.update((list) => (checked ? [...list, value] : list.filter((v) => v !== value)));
    this.page.set(1);
  }

  toggleVenue(slug: string, checked: boolean) {
    this.toggle(this.selectedVenues, slug, checked);
  }
  toggleAgeRating(code: string, checked: boolean) {
    this.toggle(this.selectedAgeRating, code, checked);
  }
  toggleFormats(slug: string, checked: boolean) {
    this.toggle(this.selectedFormats, slug, checked);
  }
  toggleLanguage(slug: string, checked: boolean) {
    this.toggle(this.selectedLanguage, slug, checked);
  }
  toggleTimeOfDay(band: string, checked: boolean) {
    this.toggle(this.selectedTimeOfDay, band, checked);
  }

  toggleDate(iso: string) {
    this.selectedDate.update((current) => (current === iso ? null : iso));
    this.page.set(1);
  }

  changeSort(value: string) {
    this.selectedSort.set(value || null);
    this.page.set(1);
  }

  goTo(page: number) {
    this.page.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  clearFilters() {
    this.selectedVenues.set([]);
    this.selectedAgeRating.set([]);
    this.selectedFormats.set([]);
    this.selectedLanguage.set([]);
    this.selectedTimeOfDay.set([]);
    this.selectedDate.set(null);
    this.page.set(1);
  }

  buy(movie: Movie, sessionId: number) {
    this.ticketNav.open(movie.slug, sessionId);
  }

  private buildDays() {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { iso, weekday: names[d.getDay()], day: d.getDate() };
    });
  }
}
