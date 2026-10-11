export interface Movie {
  id: number;
  title: string;
  slug: string;
  posterUrl: string;
  backdropUrl: string;
  runtimeMinutes: number;
  releaseDate: string;
  isComingSoon: boolean;
  isNotified: boolean;
  isFeatured: boolean;
  fromPrice: number;
  genres: Genres[];
  synopsis: string;
  kind: string;
  formats: Formats[];
  ageRating: AgeRate;
}

export interface MoviesResponse {
  data: Movie[];
}

export interface Genres {
  id: number;
  name: string;
  slug: string;
}

export interface Formats {
  id: number;
  slug: string;
  name: string;
  priceUpLift: number;
}

export interface AgeRate {
  code: string;
  minAge: number;
  description: string;
}

export interface MovieDetail extends Movie {
  director: string;
  cast: string;
  availableDates: string[];
  isNotified: boolean;
}

export interface MovieDetailResponse {
  data: MovieDetail;
}
