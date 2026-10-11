import { Component, computed, inject, signal } from '@angular/core';
import { Movies } from '../../../service/movies/movies';
import { Movie } from '../../../interface/movie';
import { BuyTicketNav } from '../../../service/buy-tickets/buy-tickets';
import { RecentlyViewed } from '../../../service/recently-veiwed/recently-viewed';
import { RouterLink } from '@angular/router';


@Component({
  imports: [ RouterLink ],
  selector: 'app-futured-films',
  styleUrl: './futured-films.scss',
  templateUrl: './futured-films.html',
})
export class FuturedFilms {
  private movieService = inject(Movies);
  private ticketNav = inject(BuyTicketNav);
  private recent = inject(RecentlyViewed);

  futuredMovies = signal<Movie[]>([]);
  futuredMovieIndex = signal(0);
  currentMovie = computed(() => this.futuredMovies()[this.futuredMovieIndex()]);
  currentGenres = computed(
    () =>
      this.currentMovie()
        ?.genres.map((genre) => genre.name)
        .join(', ') ?? '',
  );
  currentFormats = computed(
    () =>
      this.currentMovie()
        ?.formats.map((format) => format.name)
        .join(' ') ?? '',
  );

  private slideInterval?: ReturnType<typeof setInterval>;

  buyTicket(movie: Movie): void {
    this.recent.add(movie);
    this.ticketNav.open(movie.slug);
  }

  ngOnInit() {
    this.getFuturedMovies();
  }

  getFuturedMovies() {
    this.movieService.fetchFuturedMovies().subscribe({
      next: (res) => {
        this.futuredMovies.set(res.data);
        this.futuredMovieIndex.set(0);

        if (res.data.length > 1) {
          this.startAutoSlide();
        } else {
          this.stopAutoSlide();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.slideInterval = setInterval(() => {
      const moviesCount = this.futuredMovies().length;

      if (moviesCount === 0) {
        return;
      }

      this.futuredMovieIndex.update((index) => (index + 1) % moviesCount);
    }, 5000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = undefined;
    }
  }

  changeMovie(index: number) {
    this.futuredMovieIndex.set(index);
    this.startAutoSlide();
  }

  previousMovie() {
    const moviesCount = this.futuredMovies().length;

    if (moviesCount === 0) {
      return;
    }

    this.futuredMovieIndex.update((index) => (index === 0 ? moviesCount - 1 : index - 1));
    this.startAutoSlide();
  }

  nextMovie() {
    const moviesCount = this.futuredMovies().length;

    if (moviesCount === 0) {
      return;
    }

    this.futuredMovieIndex.update((index) => (index + 1) % moviesCount);
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }
}
