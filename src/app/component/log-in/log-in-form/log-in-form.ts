import { Component, inject } from '@angular/core';
import { LogInOut } from '../../../service/log-in-out/log-in-out';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';


@Component({
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  selector: 'app-log-in-form',
  styleUrl: './log-in-form.scss',
  templateUrl: './log-in-form.html',
})
export class LogInForm {
  private router = inject(Router);
  private logService = inject(LogInOut);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  login() {
    if (!this.loginForm.valid) {
      return;
    }

    this.logService.logIn(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/logged-in-home-page']);
      },
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailTouched() {
    return this.email?.touched ?? false;
  }

  get passwordTouched() {
    return this.password?.touched ?? false;
  }
}
