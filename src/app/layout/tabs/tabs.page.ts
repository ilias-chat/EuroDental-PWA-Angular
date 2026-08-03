import { Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bulbOutline, carOutline, cubeOutline, listOutline, ticketOutline } from 'ionicons/icons';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
})
export class TabsPage {
  readonly auth = inject(AuthService);

  constructor() {
    addIcons({ carOutline, listOutline, bulbOutline, cubeOutline, ticketOutline });
  }
}
