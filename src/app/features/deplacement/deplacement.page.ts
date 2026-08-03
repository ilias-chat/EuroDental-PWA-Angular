import { Component, OnInit, inject } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { DeplacementFacade } from './deplacement.facade';
import { formatDeploymentDate } from './utils/deployment-display';
import { DeploymentListItem } from '@core/models/deployment.model';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

@Component({
  selector: 'app-deplacement',
  standalone: true,
  imports: [
    IonContent,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    UserAvatarComponent,
  ],
  providers: [DeplacementFacade],
  templateUrl: './deplacement.page.html',
  styleUrl: './deplacement.page.scss',
})
export class DeplacementPage implements OnInit, ViewWillEnter {
  readonly f = inject(DeplacementFacade);
  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly formatDeploymentDate = formatDeploymentDate;

  ngOnInit(): void {
    this.f.init();
  }

  ionViewWillEnter(): void {
    this.f.onViewEnter();
  }

  extraTeamMembers(dep: DeploymentListItem) {
    const members = dep.team_members ?? [];
    const exclude = new Set<number>();
    if (dep.responsible_id) exclude.add(dep.responsible_id);
    if (dep.driver_id && dep.driver_id !== dep.responsible_id) exclude.add(dep.driver_id);
    return members.filter((m) => !exclude.has(m.id));
  }

  showDriver(dep: DeploymentListItem): boolean {
    return !!dep.driver_name && dep.driver_id !== dep.responsible_id;
  }
}
