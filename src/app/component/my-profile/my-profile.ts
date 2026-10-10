import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Profile } from '../../service/profile/profile';
import { LogInOut } from '../../service/log-in-out/log-in-out';
import { ProfileInt, UpdateProfile } from '../../interface/profile';
import { Venue } from '../../interface/filter';

// Georgian mobile: 9 digits starting with 5 (spaces allowed)
const mobileValidator = (control: AbstractControl): ValidationErrors | null =>
  /^5\d{8}$/.test(String(control.value ?? '').replace(/\s/g, '')) ? null : { mobile: true };

const notFutureDate = (control: AbstractControl): ValidationErrors | null =>
  !control.value || control.value <= new Date().toISOString().slice(0, 10)
    ? null
    : { future: true };

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-my-profile',
  styleUrl: './my-profile.scss',
  templateUrl: './my-profile.html',
})
export class MyProfile implements OnInit {
  private profileService = inject(Profile);
  private auth = inject(LogInOut);

  readonly today = new Date().toISOString().slice(0, 10);

  loading = signal(true);
  saving = signal(false);
  venues = signal<Venue[]>([]);
  status = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    mobileNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, mobileValidator],
    }),
    dateOfBirth: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notFutureDate],
    }),
    preferredVenueId: new FormControl<string | null>(null),
  });

  ngOnInit(): void {
    this.getVenues();
    this.getProfile();
  }

  getVenues(): void {
    this.profileService.fetchVenues().subscribe({
      next: (res) => this.venues.set(res.data ?? []),
      error: (error) => console.error(error),
    });
  }

  getProfile(): void {
    this.loading.set(true);
    this.profileService.fetchMyProfile().subscribe({
      next: (res) => {
        this.applyProfile(res.data);
        this.auth.updateUser(res.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: UpdateProfile = {
      fullName: value.fullName.trim(),
      mobileNumber: value.mobileNumber.replace(/\s/g, ''),
      dateOfBirth: value.dateOfBirth,
      preferredVenueId: value.preferredVenueId,
    };

    this.saving.set(true);
    this.status.set(null);

    this.profileService.makeChanges(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.status.set({ type: 'success', text: 'Changes saved' });
        if (res?.data) {
          this.applyProfile(res.data);
          this.auth.updateUser(res.data);
        } else {
          this.getProfile();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.status.set({
          type: 'error',
          text: err.error?.message ?? 'Could not save changes. Please try again.',
        });
      },
    });
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  private applyProfile(profile: ProfileInt): void {
    this.form.patchValue({
      fullName: profile.fullName ?? '',
      email: profile.email ?? '',
      mobileNumber: this.formatMobile(profile.mobileNumber ?? ''),
      dateOfBirth: profile.dateOfBirth ?? '',
      preferredVenueId: profile.preferredVenue?.id ?? null,
    });
    this.form.markAsPristine();
  }

  private formatMobile(raw: string): string {
    return raw
      .replace(/\D/g, '')
      .replace(/(\d{3})(?=\d)/g, '$1 ')
      .trim();
  }
}
