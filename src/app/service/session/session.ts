import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { filterResponse, Filter } from '../../interface/filter';
import { MovieSessions, SessionQuery, sessionResponse } from '../../interface/session';

const PARAMS = {
  date: 'date',
  venues: 'venues[]',
  formats: 'formats[]',
  languages: 'languages[]',
  timeBands: 'bands[]',
  sort: 'sort',
  page: 'page',
} as const;

class BracketParamCodec extends HttpUrlEncodingCodec {
  override encodeKey(key: string): string {
    return super.encodeKey(key).replace(/%5B/gi, '[').replace(/%5D/gi, ']');
  }
}

@Service()
export class Session {
  private http = inject(HttpClient);

  private readonly sessionURL = 'https://api.kinoxii.redberryinternship.ge/api/sessions';
  private readonly filteroptURL = 'https://api.kinoxii.redberryinternship.ge/api/filter-options';

  private fetchPage(page: number, query: SessionQuery): Observable<sessionResponse> {
    let params = new HttpParams({ encoder: new BracketParamCodec() }).set(
      PARAMS.page,
      String(page),
    );

    if (query.date) params = params.set(PARAMS.date, query.date);
    if (query.sort) params = params.set(PARAMS.sort, query.sort);

    const addMany = (name: string, values: string[]) => {
      values.forEach((value) => (params = params.append(name, String(value))));
    };
    addMany(PARAMS.venues, query.venues);
    addMany(PARAMS.formats, query.formats);
    addMany(PARAMS.languages, query.languages);
    addMany(PARAMS.timeBands, query.timeBands);

    return this.http.get<sessionResponse>(this.sessionURL, { params });
  }

  private fetchEveryPage(query: SessionQuery): Observable<MovieSessions[]> {
    return this.fetchPage(1, query).pipe(
      switchMap((first) => {
        const lastPage = first.meta?.lastPage ?? 1;
        if (lastPage <= 1) {
          return of(first.data ?? []);
        }
        const rest = Array.from({ length: lastPage - 1 }, (_, i) => this.fetchPage(i + 2, query));
        return forkJoin(rest).pipe(
          map((pages) => [...(first.data ?? []), ...pages.flatMap((p) => p.data ?? [])]),
        );
      }),
    );
  }

  fetchAllSessions(query: SessionQuery): Observable<MovieSessions[]> {
    return this.fetchEveryPage(query).pipe(
      catchError((error) => {
        console.warn('Filtered request failed, filtering in the browser instead', error);
        return this.fetchEveryPage({
          ...query,
          venues: [],
          formats: [],
          languages: [],
          timeBands: [],
        });
      }),
    );
  }

  filterByOptions(): Observable<Filter> {
    return this.http.get<filterResponse>(this.filteroptURL).pipe(map((res) => res.data));
  }
}
