import { Component, computed, inject, signal } from '@angular/core';
import { Header } from '../header/header';
import { Session } from '../../service/session/session';
import { Filter } from '../../interface/filter';
import { log } from 'node:util';

@Component({
  imports: [Header],
  selector: 'app-sessions',
  styleUrl: './sessions.scss',
  templateUrl: './sessions.html',
})
export class Sessions {
  private sessionService = inject(Session);

  filterMovies = signal<Filter | null>(null);
  selectedVenues = signal<(number | string)[]>([]);
  selectedAgeRating = signal<(number | string)[]>([]);
  selectedFormats = signal<(number | string)[]>([]);
  selectedLanguage = signal<(number | string)[]>([]);
  selectedTimeOfDay = signal<(number | string)[]>([]);

  ngOnInit() {
    this.getSessions();
    this.getfilterOption();
  }

  activeFiltersCount = computed(
    () =>
      this.selectedVenues().length +
      this.selectedAgeRating().length +
      this.selectedFormats().length +
      this.selectedLanguage().length +
      this.selectedTimeOfDay().length,
  );
  venueList = computed(() => Object.values(this.filterMovies()?.venues ?? {}));

  getSessions() {
    this.sessionService.fetchSession().subscribe({
      next: (res) => {
        console.log('Session fetched successfully');
      },
    });
  }

  getfilterOption() {
    this.sessionService.filterByOptions().subscribe({
      next: (res) => {
        (this.filterMovies.set(res)
        );},
    });
  }
  toggleVenue(id: number | string, checked: boolean) {
    this.selectedVenues.update((list) => (checked ? [...list, id] : list.filter((v) => v !== id)));
  }
  toggleAgeRating(id: number | string, checked: boolean) {
    this.selectedAgeRating.update((list) => (checked ? [...list, id] : list.filter((v) => v !== id)));
  }
  toggleFormats(id: number | string, checked: boolean) {
    this.selectedFormats.update((list) => (checked ? [...list, id] : list.filter((v) => v !== id)));
  }
  toggleLanguage(id: number | string, checked: boolean) {
    this.selectedLanguage.update((list) => (checked ? [...list, id] : list.filter((v) => v !== id)));
  }
  toggleTimeOfDay(id: number | string, checked: boolean) {
    this.selectedTimeOfDay.update((list) => (checked ? [...list, id] : list.filter((v) => v !== id)));
  }

  clearFilters() {
    this.selectedVenues.set([]);
    this.selectedAgeRating.set([]);
    this.selectedFormats.set([]);
    this.selectedLanguage.set([]);
    this.selectedTimeOfDay.set([]);
  }
}
