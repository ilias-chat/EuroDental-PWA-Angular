import { Component, Input, signal } from '@angular/core';
import { avatarFallbackUrl, resolveAvatarUrl } from '../../utils/asset-url';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  template: `
    <img
      [src]="displaySrc()"
      [alt]="name"
      class="avatar"
      [class.highlight]="highlight"
      [class.sm]="size === 'sm'"
      (error)="useFallback()"
    />
  `,
  styles: [
    `
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(25, 27, 34, 0.08);
      }
      .avatar.sm {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
      .avatar.highlight {
        outline: 2px solid var(--ed-primary);
        outline-offset: 1px;
      }
    `,
  ],
})
export class UserAvatarComponent {
  @Input({ required: true }) name!: string;
  @Input() image: string | null = null;
  @Input() highlight = false;
  @Input() size: 'md' | 'sm' = 'md';

  private readonly forcedFallback = signal(false);

  displaySrc(): string {
    if (this.forcedFallback()) {
      return avatarFallbackUrl(this.name);
    }
    return resolveAvatarUrl(this.name, this.image);
  }

  useFallback(): void {
    this.forcedFallback.set(true);
  }
}
