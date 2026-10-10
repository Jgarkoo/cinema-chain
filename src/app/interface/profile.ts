import { User } from './login';

export type ProfileInt = User;

export interface profileResponse {
  data: ProfileInt;
}

export interface UpdateProfile {
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  preferredVenueId: string | null;
}
