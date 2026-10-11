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
    title: 'Home-Page',
    path: 'home-page',
    loadComponent: () =>
      import('./component/home-page/notloged-in-homepage/notloged-in-homepage').then(
        (m) => m.NotlogedInHomepage,
      ),
    canActivate: [guestGuard],
  },
  {
    title: 'Now Playing Movies',
    path: 'now-playing-movies',
    loadComponent: () =>
      import('./component/see-all-now-playing/see-all-now-playing').then((m) => m.SeeAllNowPlaying),
  },
  {
    title: 'Coming Soon Movies',
    path: 'coming-soon-movies',
    loadComponent: () =>
      import('./component/see-all-comming-soon/see-all-comming-soon').then(
        (m) => m.SeeAllCommingSoon,
      ),
  },
  {
    title: 'session',
    path: 'session',
    loadComponent: () => import('./component/sessions/sessions').then((m) => m.Sessions),
  },
  {
    title: 'Home Page',
    path: 'logged-in-home-page',
    loadComponent: () =>
      import('./component/home-page/loged-in-homepage/loged-in-homepage').then(
        (m) => m.LogedInHomepage,
      ),
    canActivate: [logInGuard],
  },
  {
    title: 'profile page',
    path: 'profile',
    loadComponent: () => import('./component/profile/profile').then((m) => m.Profile),
    canActivate: [logInGuard],
  },
  {
    title: 'purchase ticket',
    path: 'buy-ticket',
    loadComponent: () =>
      import('./component/buy-ticket/buy-ticket').then(
        (m) => m.BuyTicket,
      ),
    canActivate: [logInGuard],
  },
];
