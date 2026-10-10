import { Component, ViewChild } from '@angular/core';
import { FuturedFilms } from '../futured-films/futured-films';
import { NowPlaying } from '../now-playing/now-playing';
import { CommingSoon } from '../comming-soon/comming-soon';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';

@Component({
  imports: [FuturedFilms, NowPlaying, CommingSoon, Footer, Header],
  selector: 'app-notloged-in-homepage',
  styleUrl: './notloged-in-homepage.scss',
  templateUrl: './notloged-in-homepage.html',
})
export class NotlogedInHomepage {
  @ViewChild('futuredFilms') futuredFilms!: FuturedFilms;
  @ViewChild('nowPlaying') NowPlaying!: NowPlaying;
  @ViewChild('upcomingFilms') CommingSoon!: CommingSoon;
}
