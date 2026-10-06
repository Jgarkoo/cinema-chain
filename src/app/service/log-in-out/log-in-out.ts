import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogIn } from '../../interface/login';


@Injectable({
  providedIn: 'root',
})
export class LogInOut {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  logInURL: string;
  logOutURL: string;
  sigUpURL: string;

  constructor() {
    this.logInURL = `https://api.kinoxii.redberryinternship.ge/api/login`;
    this.sigUpURL = `https://api.kinoxii.redberryinternship.ge/api/register`;
    this.logOutURL = `https://api.kinoxii.redberryinternship.ge/api/logout`;
  }

  logIn(data: any): Observable<LogIn[]>{
    return this.http.post<LogIn[]>(this.logInURL, data);
  }

  signUp(data: any): Observable<any>{
    return this.http.post<any>(this.sigUpURL, data);
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return localStorage.getItem('isLoggedIn') === 'true';
  }

  loginGuard(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isLoggedIn', 'true');
    }
  }

  logoutGuard(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
    }
  }
}
