import { Component, inject, signal } from '@angular/core';
import { Movies } from '../../service/movies/movies';
import { Movie } from '../../interface/movie';
import { RouterLink } from '@angular/router';
import { BuyTicketNav } from '../../service/buy-tickets/buy-tickets';
import { RecentlyViewed } from '../../service/recently-veiwed/recently-viewed';

@Component({
  imports: [RouterLink],
  selector: 'app-see-all-now-playing',
  styleUrl: './see-all-now-playing.scss',
  templateUrl: './see-all-now-playing.html',
})
export class SeeAllNowPlaying {
  private nowPlayingService = inject(Movies);
  private ticketNav = inject(BuyTicketNav);
  private recent = inject(RecentlyViewed);
  nowPlayingMovies = signal<Movie[]>([]);

  buyTicket(movie: Movie): void {
    this.recent.add(movie);
    this.ticketNav.open(movie.slug);
  }

  ngOnInit() {
    this.getNowPlyingMovies();
  }

  getNowPlyingMovies() {
    this.nowPlayingService.fetchNowPlayingMovies().subscribe({
      next: (res) => {
        this.nowPlayingMovies.set(res.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
