import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { hasAuthToken } from '../auth/auth-storage';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private readonly http = inject(HttpClient);

  /** Requests browser push permission and stores the subscription for the signed-in user. */
  async enableForCurrentUser(): Promise<void> {
    if (!hasAuthToken()) {
      return;
    }

    const vapidKey = environment.vapidPublicKey?.trim();
    if (
      !vapidKey ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey) as BufferSource,
      }));

    const json = subscription.toJSON();
    const keys = json.keys;
    const p256dh = keys?.['p256dh'];
    const auth = keys?.['auth'];
    if (!json.endpoint || !p256dh || !auth) {
      return;
    }

    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/webpush/subscribe`, {
        endpoint: json.endpoint,
        keys: { p256dh, auth },
        contentEncoding: 'aesgcm',
      })
    );
  }

  /** The API has no browser-unsubscribe endpoint yet, so the subscription remains inactive after logout. */
  async disableForCurrentUser(): Promise<void> {
    return;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const output = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) {
      output[i] = raw.charCodeAt(i);
    }
    return output;
  }
}
