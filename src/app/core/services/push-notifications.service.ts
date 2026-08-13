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

    if (
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

    const subscriptionApiUrl = environment.apiUrl;
    const vapidKey = await this.getVapidPublicKey();
    if (!vapidKey) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing && !this.subscriptionUsesVapidKey(existing, vapidKey)) {
      await existing.unsubscribe();
    }

    const current = await registration.pushManager.getSubscription();
    const subscription =
      current ??
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

    await this.storeSubscription(subscriptionApiUrl, json.endpoint, p256dh, auth, this.preferredContentEncoding());
  }

  /** The API has no browser-unsubscribe endpoint yet, so the subscription remains inactive after logout. */
  async disableForCurrentUser(): Promise<void> {
    return;
  }

  private async getVapidPublicKey(): Promise<string | null> {
    const configuredKey = environment.vapidPublicKey?.trim();
    if (configuredKey) {
      return configuredKey;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ public_key?: string | null }>(`${environment.apiUrl}/webpush/vapid-public-key`)
      );

      return response.public_key?.trim() || null;
    } catch {
      try {
        const response = await firstValueFrom(
          this.http.get<{ public_key?: string | null }>(
            `${environment.notificationApiUrl}/notifications/vapid-public-key`
          )
        );

        return response.public_key?.trim() || null;
      } catch {
        return null;
      }
    }
  }

  private async storeSubscription(
    apiUrl: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    contentEncoding: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(`${apiUrl}/webpush/subscribe`, {
        endpoint,
        keys: { p256dh, auth },
        contentEncoding,
      })
    );

    if (!environment.notificationApiUrl) {
      return;
    }

    try {
      await firstValueFrom(
        this.http.post(`${environment.notificationApiUrl}/notifications/push-subscriptions`, {
          endpoint,
          keys: { p256dh, auth },
          content_encoding: contentEncoding,
        })
      );
    } catch {
      // The CRM API may not accept the mobile token. Mobile subscription is enough for delivery.
    }
  }

  private subscriptionUsesVapidKey(subscription: PushSubscription, vapidKey: string): boolean {
    const currentKey = subscription.options.applicationServerKey;
    if (!currentKey) {
      return true;
    }

    return this.arrayBufferToBase64Url(currentKey) === this.normalizeBase64Url(vapidKey);
  }

  private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return this.normalizeBase64Url(btoa(binary));
  }

  private normalizeBase64Url(value: string): string {
    return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private preferredContentEncoding(): string {
    const encodings = PushManager.supportedContentEncodings;
    return encodings.includes('aes128gcm') ? 'aes128gcm' : encodings[0] || 'aesgcm';
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
