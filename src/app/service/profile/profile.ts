import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venue } from '../../interface/filter';
import { profileResponse, UpdateProfile } from '../../interface/profile';

@Service()
export class Profile {
  private http = inject(HttpClient);

  private readonly myProfileURL = 'https://api.kinoxii.redberryinternship.ge/api/me';
  private readonly profileURL = 'https://api.kinoxii.redberryinternship.ge/api/profile';
  private readonly venuesURL = 'https://api.kinoxii.redberryinternship.ge/api/venues';

  fetchMyProfile(): Observable<profileResponse> {
    return this.http.get<profileResponse>(this.myProfileURL);
  }

  makeChanges(data: UpdateProfile): Observable<profileResponse> {
    return this.http.put<profileResponse>(this.profileURL, data);
  }

  fetchVenues(): Observable<{ data: Venue[] }> {
    return this.http.get<{ data: Venue[] }>(this.venuesURL);
  }
}
