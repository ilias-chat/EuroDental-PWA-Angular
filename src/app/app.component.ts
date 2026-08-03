import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { PushNotificationsService } from '@core/services/push-notifications.service';
import { PwaInstallPage } from './features/pwa-install/pwa-install.page';
import { PwaInstallService } from './core/services/pwa-install.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, PwaInstallPage],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly push = inject(PushNotificationsService);
  readonly pwa = inject(PwaInstallService);

  async ngOnInit(): Promise<void> {
    if (this.pwa.isStandalone() && this.auth.isAuthenticated) {
      void this.push.enableForCurrentUser();
    }
  }
}
