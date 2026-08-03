import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';
import { NotificationsService } from '@core/services/notifications.service';
import { formatNotificationDate } from '@shared/utils/notification-date';

const CLOSE_MS = 320;

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [IonSpinner],
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss',
})
export class NotificationsPanelComponent implements OnDestroy {
  readonly notifications = inject(NotificationsService);

  readonly rendered = signal(false);
  readonly visible = signal(false);

  readonly formatDate = formatNotificationDate;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly syncOpen = effect(() => {
    if (this.notifications.open()) {
      this.clearCloseTimer();
      this.rendered.set(true);
      this.visible.set(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.visible.set(true));
      });
      return;
    }

    if (this.rendered()) {
      this.visible.set(false);
      this.clearCloseTimer();
      this.closeTimer = setTimeout(() => {
        this.rendered.set(false);
        this.closeTimer = null;
      }, CLOSE_MS);
    }
  });

  private readonly bodyLock = effect(() => {
    document.body.classList.toggle('ed-notifications-open', this.rendered());
  });

  ngOnDestroy(): void {
    this.clearCloseTimer();
    this.notifications.open.set(false);
    this.rendered.set(false);
    this.visible.set(false);
    document.body.classList.remove('ed-notifications-open');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.notifications.open()) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.notifications.closePanel();
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
