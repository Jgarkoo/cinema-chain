import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgClass } from '@angular/common';
import { LogInOut } from '../../../service/log-in-out/log-in-out';
import { Router, RouterLink } from '@angular/router';


@Component({
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  selector: 'app-register-form',
  styleUrl: './register-form.scss',
  templateUrl: './register-form.html',
})
export class RegisterForm {
  private regService = inject(LogInOut);
  private router = inject(Router);

  file: File | null = null;

  photoIsUploaded = false;

  readonly avatarImage = 'img/Frame 394.png';

  registerForm: FormGroup = new FormGroup(
    {
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password_confirmation: new FormControl('', [Validators.required, Validators.minLength(3)]),
    },
    { validators: passwordMatchValidator },
  );

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const fd = new FormData();

    fd.append('username', `${this.registerForm.get('username')!.value}`);
    fd.append('email', `${this.registerForm.get('email')!.value}`);
    fd.append('password', `${this.registerForm.get('password')!.value}`);
    fd.append('password_confirmation', `${this.registerForm.get('password_confirmation')!.value}`);

    if (this.file) {
      fd.append('image', this.file);
      console.log(this.file);
    }

    this.regService.signUp(fd).subscribe({
      next: () => {
        this.regService.loginGuard();
        this.registerForm.reset();
        this.router.navigate(['/logged-in-home-page']);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const selectedFile = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Only JPG, PNG or WEBP images are allowed.');
      input.value = '';
      this.file = null;
      this.photoIsUploaded = false;
      return;
    }
    this.file = selectedFile;
    this.photoIsUploaded = true;
  }

  cancelFile() {
    this.file = null;
    this.photoIsUploaded = false;
    const input = document.querySelector('.avatar-file-input') as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
  }

  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get pConfirmation() {
    return this.registerForm.get('password_confirmation');
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordConfirmation = control.get('password_confirmation')?.value;

  if (!password || !passwordConfirmation) {
    return null;
  }

  return password === passwordConfirmation ? null : { passwordsDoNotMatch: true };
}
