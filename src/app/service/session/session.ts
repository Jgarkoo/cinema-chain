import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { filterResponse, Filter } from '../../interface/filter';

@Service()
export class Session {
  private http = inject(HttpClient);

  private readonly sessionURL = 'https://api.kinoxii.redberryinternship.ge/api/sessions';
  private readonly filteroptURL = 'https://api.kinoxii.redberryinternship.ge/api/filter-options';

  fetchSession(): Observable<any> {
    return this.http.get(this.sessionURL);
  }

  filterByOptions(): Observable<Filter> {
    return this.http.get<filterResponse>(this.filteroptURL).pipe(map((res) => res.data));
  }
}
