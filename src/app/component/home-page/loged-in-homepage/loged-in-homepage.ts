import { Component } from '@angular/core';
import { CommingSoon } from '../comming-soon/comming-soon';
import { Footer } from '../../footer/footer';
import { FuturedFilms } from '../futured-films/futured-films';
import { Header } from '../../header/header';
import { NowPlaying } from '../now-playing/now-playing';

@Component({
  imports: [CommingSoon, Footer, FuturedFilms, Header, NowPlaying],
  selector: 'app-loged-in-homepage',
  styleUrl: './loged-in-homepage.scss',
  templateUrl: './loged-in-homepage.html',
})
export class LogedInHomepage {}
