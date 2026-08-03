import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { resolveAvatarUrl } from '../../shared/utils/asset-url';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [IonContent, IonButton],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  avatarUrl(name: string, image: string | null): string {
    return resolveAvatarUrl(name, image);
  }

  goToTasks(): void {
    const path = this.auth.canAccessMobileTasks()
      ? '/tabs/tasks'
      : this.auth.defaultAppTabPath();
    void this.router.navigateByUrl(path);
  }

  logout(): void {
    this.auth.logout();
  }
}
