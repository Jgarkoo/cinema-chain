import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MoviesResponse } from '../../interface/movie';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Movies {

  private http = inject(HttpClient);

  private readonly moviesNowPlayingURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/now-playing';
  private readonly futuredMoviesURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/featured';
  private readonly commingSoonURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/coming-soon';

  fetchFuturedMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.futuredMoviesURL);
  }

  fetchNowPlayingMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.moviesNowPlayingURL);
  }

  fetchCommingSoonMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.commingSoonURL);
  }
}
