import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { TicketDetailFacade } from './ticket-detail.facade';
import { TicketDetailModalsComponent } from './modals/ticket-detail-modals.component';
import {
  ticketUserInitials,
} from '../utils/ticket-display';
import { TicketStatusBadgeComponent } from '@shared/components/ticket-status-badge/ticket-status-badge.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [AppHeaderComponent, IonContent, IonSpinner, TicketDetailModalsComponent, TicketStatusBadgeComponent],
  providers: [TicketDetailFacade],
  templateUrl: './ticket-detail.page.html',
  styleUrl: './ticket-detail.page.scss',
})
export class TicketDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly f = inject(TicketDetailFacade);

  readonly ticketUserInitials = ticketUserInitials;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.f.init(id);
  }
}
