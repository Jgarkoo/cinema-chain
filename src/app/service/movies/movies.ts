import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MoviesResponse } from '../../interface/movie';
import { Observable } from 'rxjs';
import { notifyResponse } from '../../interface/notify';

@Injectable({
  providedIn: 'root',
})
export class Movies {
  private http = inject(HttpClient);

  private readonly moviesNowPlayingURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/now-playing';
  private readonly futuredMoviesURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/featured';
  private readonly comingSoonURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies/coming-soon';
  private readonly notifyURL =
    'https://api.kinoxii.redberryinternship.ge/api/movies';
  private readonly searchURL =
    'https://api.kinoxii.redberryinternship.ge/api/search';

  fetchFuturedMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.futuredMoviesURL);
  }

  fetchNowPlayingMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.moviesNowPlayingURL);
  }

  fetchCommingSoonMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.comingSoonURL);
  }

  fetchNotification(movie: string): Observable<notifyResponse> {
    return this.http.post<notifyResponse>(
      `${this.notifyURL}/${encodeURIComponent(movie)}/notify`,
      null,
    );
  }

  searchMovies(query: string): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(this.searchURL, {
      params: new HttpParams().set('q', query),
    });
  }
}
