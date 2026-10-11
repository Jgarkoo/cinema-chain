import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  HoldSeatRequest,
  Order,
  OrderRequest,
  OrderResponse,
  SeatHold,
  SeatHoldResponse,
  SeatMap,
  SeatMapResponse,
  SessionResponse,
  VenueSessions,
  VenueSessionsResponse,
} from '../../interface/booking';
import { Session } from '../../interface/session';

@Injectable({ providedIn: 'root' })
export class Booking {
  private http = inject(HttpClient);

  private readonly baseURL = 'https://api.kinoxii.redberryinternship.ge/api';

  fetchMovieSessions(slug: string, date: string): Observable<VenueSessions[]> {
    return this.http
      .get<VenueSessionsResponse>(`${this.baseURL}/movies/${encodeURIComponent(slug)}/sessions`, {
        params: new HttpParams().set('date', date),
      })
      .pipe(map((res) => res.data ?? []));
  }

  fetchSession(sessionId: number): Observable<Session> {
    return this.http
      .get<SessionResponse>(`${this.baseURL}/sessions/${sessionId}`)
      .pipe(map((res) => res.data));
  }

  fetchSeats(sessionId: number): Observable<SeatMap> {
    return this.http
      .get<SeatMapResponse>(`${this.baseURL}/sessions/${sessionId}/seats`)
      .pipe(map((res) => res.data));
  }

  holdSeats(sessionId: number, seats: HoldSeatRequest[]): Observable<SeatHold> {
    return this.http
      .post<SeatHoldResponse>(`${this.baseURL}/sessions/${sessionId}/holds`, { seats })
      .pipe(map((res) => res.data));
  }

  releaseHold(holdId: string): Observable<unknown> {
    return this.http.delete(`${this.baseURL}/holds/${holdId}`);
  }

  createOrder(body: OrderRequest): Observable<Order> {
    return this.http
      .post<OrderResponse>(`${this.baseURL}/orders`, body)
      .pipe(map((res) => res.data));
  }
}
