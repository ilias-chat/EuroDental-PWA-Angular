import { Injectable, computed, effect, signal } from '@angular/core';

export type EdThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'ed_mobile_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<EdThemeMode>(this.loadStoredMode());

  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      this.applyToDocument(this.mode());
    });
  }

  toggle(): void {
    this.setMode(this.mode() === 'light' ? 'dark' : 'light');
  }

  setMode(mode: EdThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  private applyToDocument(mode: EdThemeMode): void {
    const root = document.documentElement;
    root.setAttribute('data-ed-theme', mode);
    root.style.colorScheme = mode;

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', mode);
    }
  }

  private loadStoredMode(): EdThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
