import { Venue } from './filter';
import { Session, Showtime } from './session';
import { Ticket } from './tickets';

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable';

export interface Seat {
  id: number;
  code: string;
  label: string;
  state: SeatState;
  aisleAfter: boolean;
  isMine: boolean;
}

export interface SeatRow {
  label: string;
  seats: Seat[];
}

export interface SeatSection {
  name: string;
  rows: SeatRow[];
}

export interface SeatMap {
  sessionId: number;
  hall: { id: number; name: string; venue: Venue };
  sections: SeatSection[];
}

export interface SeatMapResponse {
  data: SeatMap;
}

export interface SessionResponse {
  data: Session;
}

export interface VenueSessions {
  venue: Venue;
  sessions: Showtime[];
}

export interface VenueSessionsResponse {
  data: VenueSessions[];
}

export interface HoldSeatRequest {
  seatId: number;
  ticketType: string;
}

export interface HeldSeat {
  seatId: number;
  code: string;
  ticketType: { slug: string; name: string };
  price: number;
}

export interface SeatHold {
  holdId: string;
  sessionId: number;
  expiresAt: string;
  secondsRemaining: number;
  isLive: boolean;
  subtotal: number;
  seats: HeldSeat[];
}

export interface SeatHoldResponse {
  data: SeatHold;
}

export interface OrderRequest {
  holdId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export type Order = Ticket;

export interface OrderResponse {
  data: Order;
}
