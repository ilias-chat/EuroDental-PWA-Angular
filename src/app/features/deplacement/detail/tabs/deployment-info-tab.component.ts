import { Component, inject } from '@angular/core';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { DeploymentListItem, DeploymentMember } from '@core/models/deployment.model';
import { DeplacementDetailFacade } from '../deplacement-detail.facade';
import { formatDeploymentDate } from '../../utils/deployment-display';

@Component({
  selector: 'app-deployment-info-tab',
  standalone: true,
  imports: [UserAvatarComponent],
  templateUrl: './deployment-info-tab.component.html',
  styleUrl: '../deplacement-detail.shared.scss',
})
export class DeploymentInfoTabComponent {
  readonly f = inject(DeplacementDetailFacade);
  readonly formatDeploymentDate = formatDeploymentDate;

  listedTeamMembers(dep: DeploymentListItem): DeploymentMember[] {
    const exclude = new Set<number>();
    if (dep.responsible_id) exclude.add(dep.responsible_id);
    if (dep.driver_id) exclude.add(dep.driver_id);
    return (dep.team_members ?? []).filter((member) => !exclude.has(member.id));
  }
}
