import { Format, Venue, Language } from './filter';
import { Movie } from './movie';
import { Hall } from './hall';

export interface Session {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: string;
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  venue: Venue;
  format: Format;
  language: Language;
  hall: Hall;
  movie: Movie;
}

export type Showtime = Omit<Session, 'movie'>;

export interface MovieSessions {
  movie: Movie;
  sessions: Showtime[];
}

export interface Meta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalSessions: number;
  totalMovies: number;
  date: string;
}

export interface sessionResponse {
  data: MovieSessions[];
  meta: Meta;
}

export interface SessionQuery {
  date: string | null;
  sort: string | null;
  venues: string[];
  formats: string[];
  languages: string[];
  timeBands: string[];
}
