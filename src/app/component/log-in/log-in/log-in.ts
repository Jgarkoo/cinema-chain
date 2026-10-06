import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LogInForm } from '../log-in-form/log-in-form';
import { RegisterForm } from '../register-form/register-form';

@Component({
  imports: [LogInForm, RegisterForm],
  selector: 'app-log-in',
  styleUrl: './log-in.scss',
  templateUrl: './log-in.html',
})
export class LogIn {
  private route = inject(ActivatedRoute);

  showLogin = true;

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.showLogin = params.get('mode') !== 'register';
    });
  }

  showRegister(): void {
    this.showLogin = false;
  }

  showLoginForm(): void {
    this.showLogin = true;
  }
}
