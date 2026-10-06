import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FuturedFilms } from '../futured-films/futured-films';
import { NowPlaying } from '../now-playing/now-playing';
import { CommingSoon } from '../comming-soon/comming-soon';

@Component({
  imports: [RouterLink, FuturedFilms, NowPlaying, CommingSoon],
  selector: 'app-notloged-in-homepage',
  styleUrl: './notloged-in-homepage.scss',
  templateUrl: './notloged-in-homepage.html',
})
export class NotlogedInHomepage {
  @ViewChild('futuredFilms') futuredFilms!: FuturedFilms;
  @ViewChild('nowPlaying') NowPlaying!: NowPlaying;
  @ViewChild('upcomingFilms') CommingSoon!: CommingSoon;
}
