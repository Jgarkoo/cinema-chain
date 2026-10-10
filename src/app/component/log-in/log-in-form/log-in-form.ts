import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LogInOut } from '../../../service/log-in-out/log-in-out';
import { AuthModal } from '../../../service/auth-modal/auth-modal';

@Component({
  imports: [NgClass, ReactiveFormsModule],
  selector: 'app-log-in-form',
  styleUrl: './log-in-form.scss',
  templateUrl: './log-in-form.html',
})
export class LogInForm {
  @Output() closeForm = new EventEmitter<void>();

  private router = inject(Router);
  private logService = inject(LogInOut);
  private authModal = inject(AuthModal);

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  login() {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.logService.logIn({ email: email.trim(), password }).subscribe({
      next: () => {
        this.loading.set(false);
        const replaying = this.authModal.succeeded();
        this.closeForm.emit();
        if (!replaying) {
          this.router.navigate(['/logged-in-home-page']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set(err.error?.message ?? 'Invalid email or password.');
          this.password?.reset('');
        } else {
          this.errorMessage.set(err.error?.message ?? 'Something went wrong. Please try again.');
        }
      },
    });
  }

  close() {
    this.authModal.dismissed();
    this.closeForm.emit();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
