import { Component, inject, signal } from '@angular/core';
import { Movies } from '../../service/movies/movies';
import { Movie } from '../../interface/movie';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-see-all-now-playing',
  styleUrl: './see-all-now-playing.scss',
  templateUrl: './see-all-now-playing.html',
})
export class SeeAllNowPlaying {
  private nowPlayingService = inject(Movies);
  nowPlayingMovies = signal<Movie[]>([]);

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
