import { Component, inject, OnInit, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { AppSideMenuService } from '@core/services/app-side-menu.service';
import { NotificationsService } from '@core/services/notifications.service';
import { AppSideMenuComponent } from '@shared/components/app-side-menu/app-side-menu.component';
import { NotificationsPanelComponent } from '@shared/components/notifications-panel/notifications-panel.component';
import { avatarFallbackUrl, resolveAvatarUrl } from '@shared/utils/asset-url';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [IonHeader, IonToolbar, AppSideMenuComponent, NotificationsPanelComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent implements OnInit {
  readonly showBack = input(false);
  readonly backHref = input('/tabs/tasks');

  readonly auth = inject(AuthService);
  readonly menu = inject(AppSideMenuService);
  readonly notifications = inject(NotificationsService);
  private readonly router = inject(Router);

  /** Per-user fallback when the image URL fails to load */
  private readonly avatarFallbacks = signal<Record<number, string>>({});

  ngOnInit(): void {
    this.notifications.refreshUnreadCount();
    this.auth.refreshMe().subscribe({ error: () => undefined });
  }

  avatarSrc(user: { id: number; name: string; image: string | null }): string {
    return this.avatarFallbacks()[user.id] ?? resolveAvatarUrl(user.name, user.image);
  }

  onAvatarError(user: { id: number; name: string }): void {
    this.avatarFallbacks.update((m) => ({
      ...m,
      [user.id]: avatarFallbackUrl(user.name),
    }));
  }

  goBack(): void {
    const href = this.backHref().trim() || '/tabs/tasks';
    const queryIndex = href.indexOf('?');
    const path = queryIndex >= 0 ? href.slice(0, queryIndex) : href;
    const queryParams: Record<string, string> = {};

    if (queryIndex >= 0) {
      const search = href.slice(queryIndex + 1);
      for (const part of search.split('&')) {
        if (!part) continue;
        const [key, ...rest] = part.split('=');
        if (!key) continue;
        queryParams[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
      }
    }

    void this.router.navigate([path], {
      queryParams: Object.keys(queryParams).length ? queryParams : undefined,
    });
  }

  openUserMenu(): void {
    this.menu.openMenu();
  }

  onNotificationsClick(): void {
    if (this.notifications.open()) {
      this.notifications.closePanel();
    } else {
      this.notifications.openPanel();
    }
  }
}
