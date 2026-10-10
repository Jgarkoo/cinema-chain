export interface Filter {
  ageRatings: AgeRating[];
  formats: Format[];
  holdMinutes: number;
  languages: Language[];
  maxSeatsPerOrder: number;
  sorts: SortOption[];
  ticketTypes: TicketType[];
  timeBands: TimeBand[];
  venues: Venue[];
}

export interface TicketType {
  id: string
  name: string
  note: string | null
  priceRate: string
  slug: string
  blockedFromRatingAge: string | null
}

export interface AgeRating {
  id: string
  description: string
  minAge: number
}

export interface TimeBand {
  id: string;
  label: string;
}

export interface Language {
  id: string;
  slug: string;
  name: string;
  code: string;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  city: string;
  formats: Format[];
}

export interface Format {
  id: string;
  slug: string;
  name: string;
  priceUplift: string;
}

export interface filterResponse {
  data: Filter;
}
