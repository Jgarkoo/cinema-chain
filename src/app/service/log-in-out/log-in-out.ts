import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LogIn, LogInResponse, User } from '../../interface/login';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class LogInOut {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly baseURL = 'https://api.kinoxii.redberryinternship.ge/api';
  readonly logInURL = `${this.baseURL}/login`;
  readonly signUpURL = `${this.baseURL}/register`;
  readonly logOutURL = `${this.baseURL}/logout`;

  private _token = signal<string | null>(this.read(TOKEN_KEY));
  private _user = signal<User | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loggedIn = computed(() => !!this._token());

  logIn(data: LogIn): Observable<LogInResponse> {
    return this.http
      .post<LogInResponse>(this.logInURL, data)
      .pipe(tap(({ data }) => this.setSession(data.token, data.user)));
  }

  signUp(data: any): Observable<any> {
    return this.http.post<any>(this.signUpURL, data);
  }

  logOut(): Observable<unknown> {
    return this.http.post(this.logOutURL, {}).pipe(
      tap({
        next: () => this.clearSession(),
        error: () => this.clearSession(),
      }),
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  setSession(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private read(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private readUser(): User | null {
    try {
      const raw = this.read(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
