import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../interface/movie';
import { Movies } from '../../service/movies/movies';

@Component({
  imports: [RouterLink],
  selector: 'app-see-all-comming-soon',
  styleUrl: './see-all-comming-soon.scss',
  templateUrl: './see-all-comming-soon.html',
})
export class SeeAllCommingSoon {
  private comsMovieService = inject(Movies);

  private notifiedSlugs = signal<Set<string>>(new Set());
  private pendingSlugs = signal<Set<string>>(new Set());

  comingSoonMoveis = signal<Movie[]>([]);

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
