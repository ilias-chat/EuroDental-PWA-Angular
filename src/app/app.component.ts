import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { PushNotificationsService } from '@core/services/push-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly push = inject(PushNotificationsService);

  async ngOnInit(): Promise<void> {
    if (this.auth.isAuthenticated) {
      void this.push.enableForCurrentUser();
    }
  }
}
