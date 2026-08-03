import { Component, Input } from '@angular/core';
import { ticketStatusBadgeClass, ticketStatusLabel } from '@shared/utils/ticket-status';

@Component({
  selector: 'app-ticket-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass">
      <span>{{ displayLabel }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        max-width: 100%;
      }
    `,
  ],
})
export class TicketStatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() label?: string;

  get badgeClass(): string {
    return ticketStatusBadgeClass(this.status);
  }

  get displayLabel(): string {
    return this.label?.trim() || ticketStatusLabel(this.status);
  }
}
