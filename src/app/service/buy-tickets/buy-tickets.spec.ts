import { TestBed } from '@angular/core/testing';
import { BuyTickets } from './buy-tickets';

describe('BuyTickets', () => {
  let service: BuyTickets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyTickets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
