import { Format, Venue, Language } from './filter';

export interface Session {
  venue: Venue[];
  format: Format[];
  language: Language[];
}
