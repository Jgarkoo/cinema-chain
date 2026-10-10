import { Session } from './session';

export interface TicketContact {
  fullName: string;
  email: string;
  mobileNumber: string;
}

export interface TicketType {
  slug: string;
  name: string;
}

export interface TicketItem {
  id: number;
  seatCode: string;
  ticketType: TicketType;
  price: number;
}

export interface Ticket {
  id: number;
  reference: string;
  status: string;
  totalPrice: number;
  paidAt: string;
  refundedAt: string;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string;
  contact: TicketContact;
  session: Session;
  tickets: TicketItem[];
}

export interface TicketsResponse {
  data: Ticket[];
}
