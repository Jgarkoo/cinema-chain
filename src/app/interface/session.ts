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
  movie: Movie;
  hall: Hall;
}
