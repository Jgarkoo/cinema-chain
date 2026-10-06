import { Component, computed, inject, signal } from '@angular/core';
import { Movies } from '../../../service/movies/movies';
import { Movie } from '../../../interface/movie';

@Component({
  imports: [],
  selector: 'app-comming-soon',
  styleUrl: './comming-soon.scss',
  templateUrl: './comming-soon.html',
})
export class CommingSoon {

  private comsMovieService = inject(Movies);

  commingSoonMoveis = signal<Movie[]>([]);
  commingsoonMovies = computed(() => this.commingSoonMoveis().slice(0, 4));
  private readonly monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  ngOnInit() {
    this.getComsMovies();
  }

  getComsMovies() {
    this.comsMovieService.fetchCommingSoonMovies().subscribe({
      next: (res) => {
        this.commingSoonMoveis.set(res.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  formatReleaseDate(releaseDate: string): string {
    const [year, month, day] = releaseDate.split('-').map(Number);

    if (!year || !month || !day) {
      return releaseDate;
    }

    return `${day} ${this.monthNames[month - 1]}`;
  }
}
