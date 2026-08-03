import { Component, Input } from '@angular/core';
import { taskStatusBadgeClass } from '../../utils/task-status';

@Component({
  selector: 'app-task-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass">
      @if (showPing) {
        <span class="task-status-badge__ping" aria-hidden="true"></span>
      }
      <span>{{ status }}</span>
      @if (urgent) {
        <i class="fa-solid fa-exclamation-triangle task-status-badge__urgent" aria-hidden="true"></i>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        max-width: 100%;
      }

      .task-status-badge__ping {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
        animation: task-status-ping 2s infinite;
      }

      .task-status-badge__urgent {
        font-size: 11px;
        opacity: 0.9;
      }

      @keyframes task-status-ping {
        0% {
          box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 45%, transparent);
        }
        70% {
          box-shadow: 0 0 0 8px transparent;
        }
        100% {
          box-shadow: 0 0 0 0 transparent;
        }
      }
    `,
  ],
})
export class TaskStatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() urgent = false;
  @Input() showPing = false;

  get badgeClass(): string {
    return taskStatusBadgeClass(this.status);
  }
}
