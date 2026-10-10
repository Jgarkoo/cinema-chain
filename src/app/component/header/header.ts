import {
  Component,
  computed,
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

type AuthMode = 'login' | 'register';

@Component({
  imports: [RouterLink, LogInForm, RegisterForm, NgTemplateOutlet],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header implements OnDestroy {
  auth = inject(LogInOut);
  private authModal = inject(AuthModal);
  private router = inject(Router);

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
    // lets the interceptor open/close the login modal (401 on a protected request)
    effect(() => {
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
    this.authModal.dismissed(); // releases any request waiting for login
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
    if (this.menuOpen() && !(event.target as HTMLElement).closest('.user-menu')) {
      this.closeMenu();
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

  get homePage(): boolean {
    return this.currentURL.includes('/home-page');
  }

  get loggedInHomepage(): boolean {
    return this.currentURL.includes('/logged-in-home-page');
  }
}
