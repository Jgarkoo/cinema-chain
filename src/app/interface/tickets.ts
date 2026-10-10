export interface TicketSeat {
  label: string;
  type: string;
}

export interface Ticket {
  id: number;
  orderNumber: string;
  movie: {
    title: string;
    posterUrl: string;
    runtimeMinutes: number;
    ageRating: { minAge: number };
  };
  startsAt: string;
  venue: { name: string };
  hall: string;
  format: string;
  language: string;
  seats: TicketSeat[];
  totalPaid: number;
  refundableUntil: string;
}

export interface TicketsResponse {
  data: Ticket[];
}
