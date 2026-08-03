import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AppSideMenuService } from '@core/services/app-side-menu.service';
import { ThemeService } from '@core/services/theme.service';
import { avatarFallbackUrl, resolveAvatarUrl } from '@shared/utils/asset-url';

/** Matches panel + backdrop transition in SCSS */
const CLOSE_MS = 420;

@Component({
  selector: 'app-app-side-menu',
  standalone: true,
  templateUrl: './app-side-menu.component.html',
  styleUrl: './app-side-menu.component.scss',
})
export class AppSideMenuComponent implements OnDestroy {
  readonly menu = inject(AppSideMenuService);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  /** Keeps overlay in DOM during exit animation */
  readonly rendered = signal(false);
  readonly visible = signal(false);

  private avatarFallbackByUserId: Record<number, string> = {};
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly syncOpen = effect(() => {
    if (this.menu.open()) {
      this.clearCloseTimer();
      this.rendered.set(true);
      this.visible.set(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.visible.set(true));
      });
    }
  });

  private readonly bodyLock = effect(() => {
    document.body.classList.toggle('ed-side-menu-open', this.rendered());
  });

  ngOnDestroy(): void {
    this.clearCloseTimer();
    if (this.rendered()) {
      this.menu.close();
      this.rendered.set(false);
      this.visible.set(false);
    }
    document.body.classList.remove('ed-side-menu-open');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.rendered()) {
      this.close();
    }
  }

  avatarSrc(user: { id: number; name: string; image: string | null }): string {
    return this.avatarFallbackByUserId[user.id] ?? resolveAvatarUrl(user.name, user.image);
  }

  onAvatarError(user: { id: number; name: string }): void {
    this.avatarFallbackByUserId[user.id] = avatarFallbackUrl(user.name);
  }

  close(): void {
    if (!this.rendered()) {
      return;
    }
    // Clear service state immediately so a new menu instance (after route change) does not reopen.
    this.menu.close();
    this.visible.set(false);
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      this.rendered.set(false);
      this.closeTimer = null;
    }, CLOSE_MS);
  }

  onCongesClick(): void {
    this.close();
    void this.router.navigateByUrl('/leave-requests');
  }

  onSuiviClick(): void {
    this.close();
    void this.router.navigateByUrl('/suivi');
  }

  onThemeClick(): void {
    this.theme.toggle();
  }

  /** Fermeture animée puis déconnexion API */
  logout(): void {
    this.close();
    this.auth.logout();
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
