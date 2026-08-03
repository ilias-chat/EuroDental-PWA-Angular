import { Component, inject } from '@angular/core';
import { DeplacementDetailFacade } from '../deplacement-detail.facade';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-deployment-timeline-tab',
  standalone: true,
  imports: [UserAvatarComponent],
  templateUrl: './deployment-timeline-tab.component.html',
  styleUrl: '../../../tasks/detail/task-detail.shared.scss',
})
export class DeploymentTimelineTabComponent {
  readonly f = inject(DeplacementDetailFacade);
}
