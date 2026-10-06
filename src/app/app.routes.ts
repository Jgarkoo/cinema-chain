import { Routes } from '@angular/router';
import { logInGuard } from './guard/log-in-guard';
import { guestGuard } from './guard/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home-page',
    pathMatch: 'full',
  },
  {
    title: 'Home Page',
    path: 'home-page',
    loadComponent: () =>
      import('./component/home-page/notloged-in-homepage/notloged-in-homepage').then((m) => m.NotlogedInHomepage),
    // canActivate: [guestGuard],
  },
  {
    title: 'Log in Page',
    path: 'log-in',
    loadComponent: () => import('./component/log-in/log-in/log-in').then((m) => m.LogIn),
    // canActivate: [guestGuard],
  },
  {
    title: 'Home Page',
    path: 'logged-in-home-page',
    loadComponent: () =>
      import('./component/home-page/loged-in-homepage/loged-in-homepage').then((m) => m.LogedInHomepage),
    // canActivate: [logInGuard],
  },
];
