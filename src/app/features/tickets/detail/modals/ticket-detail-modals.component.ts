import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { TicketDetailFacade } from '../ticket-detail.facade';

@Component({
  selector: 'app-ticket-detail-modals',
  standalone: true,
  imports: [IonModal, IonSpinner, FormsModule],
  templateUrl: './ticket-detail-modals.component.html',
})
export class TicketDetailModalsComponent {
  readonly f = inject(TicketDetailFacade);

  onReplyAttachmentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.f.setReplyAttachment(file);
  }
}
