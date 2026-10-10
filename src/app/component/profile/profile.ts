import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { MyProfile } from '../my-profile/my-profile';
import { MyTickets } from '../my-tickets/my-tickets';
import { Tickets } from '../../service/tickets/tickets';

@Component({
  imports: [Footer, Header, MyProfile, MyTickets, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {

  private route = inject(ActivatedRoute);
  private ticketsService = inject(Tickets);

  activeTab = toSignal(
    this.route.queryParamMap.pipe(
      map((params): 'info' | 'tickets' => (params.get('tab') === 'tickets' ? 'tickets' : 'info')),
    ),
    { initialValue: 'info' as 'info' | 'tickets' },
  );

  upcomingCount = this.ticketsService.upcomingCount;

  ngOnInit(): void {
    this.ticketsService.load();
  }
}
