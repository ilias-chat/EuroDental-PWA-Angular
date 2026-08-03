import { Injectable, computed, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  readonly isStandalone = signal(this.detectStandaloneMode());
  readonly canInstall = computed(() => this.deferredPrompt() !== null);
  readonly isIos = this.detectIos();
  readonly isSafari = this.detectSafari();
  readonly installRequested = signal(false);

  constructor() {
    if (!this.isStandalone()) {
      document.documentElement.setAttribute('data-ed-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt.set(event as BeforeInstallPromptEvent);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt.set(null);
      this.installRequested.set(true);
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt();
    if (!prompt) {
      return;
    }

    await prompt.prompt();
    await prompt.userChoice;
    this.deferredPrompt.set(null);
    this.installRequested.set(true);
  }

  private detectStandaloneMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  }

  private detectIos(): boolean {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  private detectSafari(): boolean {
    const userAgent = window.navigator.userAgent;
    return /safari/i.test(userAgent) && !/chrome|android/i.test(userAgent);
  }
}
