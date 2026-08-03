import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { AppNotification, NotificationsFeedResponse } from '@core/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  readonly unreadCount = signal(0);
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly items = signal<AppNotification[]>([]);

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  startPolling(intervalMs = 60_000): void {
    this.stopPolling();
    this.refreshUnreadCount();
    this.refreshTimer = setInterval(() => this.refreshUnreadCount(), intervalMs);
  }

  stopPolling(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  refreshUnreadCount(): void {
    this.http
      .get<{ success: boolean; unread_count: number }>(
        `${environment.apiUrl}/notifications/unread-count`
      )
      .subscribe({
        next: (res) => this.unreadCount.set(res.unread_count ?? 0),
        error: () => this.unreadCount.set(0),
      });
  }

  openPanel(): void {
    this.open.set(true);
    this.loadFeed();
  }

  closePanel(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (this.unreadCount() > 0) {
      this.markAllAsRead();
    }
  }

  loadFeed(): void {
    this.loading.set(true);
    this.http
      .get<NotificationsFeedResponse>(`${environment.apiUrl}/notifications`)
      .subscribe({
        next: (res) => {
          this.items.set(res.notifications ?? []);
          this.unreadCount.set(res.unread_count ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.loading.set(false);
        },
      });
  }

  markAllAsRead(): void {
    this.http
      .put<{ success: boolean }>(`${environment.apiUrl}/notifications/mark-all-read`, {})
      .subscribe({
        next: () => {
          this.items.update((list) =>
            list.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }))
          );
          this.unreadCount.set(0);
        },
        error: () => undefined,
      });
  }
}
