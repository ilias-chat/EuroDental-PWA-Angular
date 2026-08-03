import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginResponse } from '../models/user.model';
import { NotificationsService } from '@core/services/notifications.service';
import { PushNotificationsService } from '@core/services/push-notifications.service';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './auth-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationsService);
  private readonly push = inject(PushNotificationsService);

  readonly user = signal<AuthUser | null>(this.loadUser());
  readonly token = signal<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));

  get isAuthenticated(): boolean {
    return !!this.token();
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          this.token.set(res.token);
          this.user.set(res.user);
        })
      );
  }

  logout() {
    const token = this.token();
    if (token) {
      this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({ error: () => undefined });
    }
    void this.push.disableForCurrentUser();
    this.notifications.stopPolling();
    this.notifications.open.set(false);
    this.notifications.unreadCount.set(0);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  refreshMe() {
    return this.http.get<AuthUser | { user: AuthUser }>(`${environment.apiUrl}/me`).pipe(
      tap((res) => {
        const user: AuthUser = 'user' in res && res.user ? res.user : (res as AuthUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  hasPermission(code: string): boolean {
    return this.user()?.permissions?.includes(code) ?? false;
  }

  /**
   * Technician: `mobile_tasks` / `mobile_tasks_read`.
   * Admin tasks list (Blade `/mobile/tasks-admin`): `tasks_admin`.
   */
  canAccessMobileTasks(): boolean {
    return (
      this.hasPermission('mobile_tasks') ||
      this.hasPermission('mobile_tasks_read') ||
      this.hasTasksAdminPermission()
    );
  }

  /** Admin tasks tab (`/mobile/tasks-admin`). Code may be `tasks_admin` or `tasks-admin`. */
  canAccessTasksAdmin(): boolean {
    return this.hasTasksAdminPermission();
  }

  private hasTasksAdminPermission(): boolean {
    return this.hasPermission('tasks_admin') || this.hasPermission('tasks-admin');
  }

  /** Laravel mobile nav: `mobile_stock`; seeder also uses `mobile_stock_read`. */
  canAccessMobileStock(): boolean {
    return (
      this.hasPermission('mobile_stock') || this.hasPermission('mobile_stock_read')
    );
  }

  canProposeTasks(): boolean {
    return this.hasPermission('mobile_tasks_propose');
  }

  canAccessTasksTracking(): boolean {
    return this.hasPermission('tasks_tracking');
  }

  /** Laravel mobile create task (`/mobile/tasks` FAB). */
  canCreateTasks(): boolean {
    return this.hasPermission('mobile_tasks_write');
  }

  /** Laravel mobile tickets: `tickets_create` or `tickets_manage`. */
  canAccessTickets(): boolean {
    return this.hasPermission('tickets_create') || this.hasPermission('tickets_manage');
  }

  canCreateTickets(): boolean {
    return this.hasPermission('tickets_create');
  }

  canManageTickets(): boolean {
    return this.hasPermission('tickets_manage');
  }

  /** First tab the user is allowed to open after login or when a guard denies access. */
  defaultAppTabPath(): string {
    if (this.canAccessMobileTasks()) {
      return '/tabs/tasks';
    }
    if (this.canProposeTasks()) {
      return '/tabs/propose';
    }
    if (this.canAccessTickets()) {
      return '/tabs/tickets';
    }
    if (this.canAccessMobileStock()) {
      return '/tabs/stock';
    }
    return '/tabs/deplacement';
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
