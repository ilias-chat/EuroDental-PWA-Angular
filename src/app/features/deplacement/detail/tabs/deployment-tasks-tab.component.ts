import { Component, inject } from '@angular/core';
import { TaskStatusBadgeComponent } from '@shared/components/task-status-badge/task-status-badge.component';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { DeplacementDetailFacade } from '../deplacement-detail.facade';

@Component({
  selector: 'app-deployment-tasks-tab',
  standalone: true,
  imports: [TaskStatusBadgeComponent, UserAvatarComponent],
  templateUrl: './deployment-tasks-tab.component.html',
  styleUrl: '../deplacement-detail.shared.scss',
})
export class DeploymentTasksTabComponent {
  readonly f = inject(DeplacementDetailFacade);
}
