export interface LogIn {
  email: string;
  password: string;
}

export interface Format {
  id: string;
  slug: string;
  name: string;
  priceUplift: string;
}

export interface PreferredVenue {
  id: string;
  slug: string;
  name: string;
  city: string;
  formats: Format[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  age: string;
  preferredVenue: PreferredVenue | null;
  profileComplete: boolean;
}

export interface LogInResponse {
  data: {
    user: User;
    token: string;
  };
}
