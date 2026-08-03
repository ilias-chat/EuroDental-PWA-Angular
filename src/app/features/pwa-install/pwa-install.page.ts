import { Component, inject } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, shareOutline } from 'ionicons/icons';
import { PwaInstallService } from '../../core/services/pwa-install.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [IonButton, IonContent, IonIcon],
  templateUrl: './pwa-install.page.html',
  styleUrl: './pwa-install.page.scss',
})
export class PwaInstallPage {
  readonly pwa = inject(PwaInstallService);

  constructor() {
    addIcons({ downloadOutline, shareOutline });
  }

  reload(): void {
    window.location.reload();
  }
}
