import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  Inject,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LogInForm } from '../log-in/log-in-form/log-in-form';
import { LogInOut } from '../../service/log-in-out/log-in-out';
import { RegisterForm } from '../log-in/register-form/register-form';
import { AuthModal } from '../../service/auth-modal/auth-modal';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Movies } from '../../service/movies/movies';
import { Movie } from '../../interface/movie';


type AuthMode = 'login' | 'register';

@Component({
  imports: [RouterLink, LogInForm, RegisterForm, NgTemplateOutlet, ReactiveFormsModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header implements OnDestroy {

  auth = inject(LogInOut);
  private destroyRef = inject(DestroyRef);
  private authModal = inject(AuthModal);
  private router = inject(Router);
  private movieService = inject(Movies);

  authMode: AuthMode | null = null;
  currentURL = '';

  user = this.auth.user;
  menuOpen = signal(false);
  avatarFailed = signal(false);

  firstName = computed(() => {
    const u = this.user();
    return (u?.fullName || u?.username || '').trim().split(/\s+/)[0] ?? '';
  });

  initials = computed(() => {
    const u = this.user();
    const parts = (u?.fullName || u?.username || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  private previousBodyOverflow = '';

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      this.searchControl.valueChanges
        .pipe(
          map((value) => value.trim()),
          debounceTime(300),
          distinctUntilChanged(),
          tap((query) => {
            this.searchQuery.set(query);
            this.searchLoading.set(query !== '');
            if (!query) {
              this.searchResults.set([]);
            }
          }),
          switchMap((query) =>
            query === ''
              ? of<Movie[]>([])
              : this.movieService.searchMovies(query).pipe(
                  map((res) => res.data ?? []),
                  catchError(() => of<Movie[]>([])),
                ),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((movies) => {
          this.searchResults.set(movies);
          this.searchLoading.set(false);
        });
      const open = this.authModal.loginOpen();
      untracked(() => {
        if (open && this.authMode !== 'login') {
          this.openAuthModal('login');
        } else if (!open && this.authMode === 'login') {
          this.closeAuthModal();
        }
      });
    });
  }

  onResultClick(): void {
    this.searchOpen.set(false);
    this.searchControl.setValue('');
  }

  searchMeta(movie: Movie): string {
    const genre = movie.genres?.[0]?.name;
    const runtime = movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : '';
    return [genre, runtime].filter(Boolean).join(' · ');
  }

  searchControl = new FormControl('', { nonNullable: true });
  searchResults = signal<Movie[]>([]);
  searchQuery = signal('');
  searchLoading = signal(false);
  searchOpen = signal(false);
  showSearchPanel = computed(() => this.searchOpen() && this.searchQuery() !== '');
  get authModalIsOpen(): boolean {
    return this.authMode !== null;
  }

  openAuthModal(mode: AuthMode): void {
    this.authMode = mode;
    this.lockScroll();
  }

  closeAuthModal(): void {
    this.authMode = null;
    this.unlockScroll();
    this.authModal.dismissed();
  }

  showLogin(): void {
    this.authMode = 'login';
  }

  showRegister(): void {
    this.authMode = 'register';
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    const done = () => {
      this.closeMenu();
      this.avatarFailed.set(false);
      this.router.navigate(['/home-page']);
    };
    this.auth.logOut().subscribe({ next: done, error: done });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.menuOpen() && !target.closest('.user-menu')) {
      this.closeMenu();
    }
    if (this.searchOpen() && !target.closest('.search-bar')) {
      this.searchOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  private lockScroll(): void {
    if (!this.document.body || this.document.body.style.overflow === 'hidden') return;
    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if (!this.document.body) return;
    this.document.body.style.overflow = this.previousBodyOverflow;
  }
}
