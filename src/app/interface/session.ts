import { Format, Venue, Language } from './filter';
import { Movie } from './movie';

export interface Session {
  id: string
  startsAt: string
  date: string
  time: string
  timeBand: string
  price: string
  seatsLeft: string
  isSoldOut: boolean
  venue: Venue[];
  format: Format[];
  language: Language[];
  movie: Movie[];
}
