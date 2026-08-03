import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppSideMenuService {
  readonly open = signal(false);

  openMenu(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  toggle(): void {
    this.open.update((v) => !v);
  }
}
