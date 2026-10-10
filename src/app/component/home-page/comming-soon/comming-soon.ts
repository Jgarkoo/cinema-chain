import { Component, computed, inject, signal } from '@angular/core';
import { Movies } from '../../../service/movies/movies';
import { Movie } from '../../../interface/movie';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-comming-soon',
  styleUrl: './comming-soon.scss',
  templateUrl: './comming-soon.html',
})
export class CommingSoon {
  private comsMovieService = inject(Movies);

  private notifiedSlugs = signal<Set<string>>(new Set());
  private pendingSlugs = signal<Set<string>>(new Set());

  comingSoonMoveis = signal<Movie[]>([]);
  comingsoonMovies = computed(() => this.comingSoonMoveis().slice(0, 4));
  private readonly monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  isNotified(movie: Movie): boolean {
    return this.notifiedSlugs().has(movie.slug);
  }

  isPending(movie: Movie): boolean {
    return this.pendingSlugs().has(movie.slug);
  }

  ngOnInit() {
    this.getComsMovies();
  }

  getComsMovies() {
    this.comsMovieService.fetchCommingSoonMovies().subscribe({
      next: (res) => {
        this.comingSoonMoveis.set(res.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  notify(movie: Movie): void {
    if (this.isPending(movie) || this.isNotified(movie)) {
      return;
    }

    this.pendingSlugs.update((set) => new Set(set).add(movie.slug));

    this.comsMovieService.fetchNotification(movie.slug).subscribe({
      next: () => {
        this.pendingSlugs.update((set) => {
          const next = new Set(set);
          next.delete(movie.slug);
          return next;
        });
        this.notifiedSlugs.update((set) => new Set(set).add(movie.slug));
      },
      error: (error) => {
        console.error(error);
        this.pendingSlugs.update((set) => {
          const next = new Set(set);
          next.delete(movie.slug);
          return next;
        });
      },
    });
  }
  formatReleaseDate(releaseDate: string): string {
    const [year, month, day] = releaseDate.split('-').map(Number);

    if (!year || !month || !day) {
      return releaseDate;
    }

    return `${day} ${this.monthNames[month - 1]}`;
  }
}
