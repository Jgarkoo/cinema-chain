import { Component, computed, inject, signal } from '@angular/core';
import { Movie } from '../../../interface/movie';
import { Movies } from '../../../service/movies/movies';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-now-playing',
  styleUrl: './now-playing.scss',
  templateUrl: './now-playing.html',
})
export class NowPlaying {
  private nowPlayingService = inject(Movies);

  nowPlayingMovies = signal<Movie[]>([]);
  previewMovies = computed(() => this.nowPlayingMovies().slice(0, 5));

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
