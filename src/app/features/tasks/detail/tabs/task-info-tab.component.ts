import { Component, inject } from '@angular/core';
import { TaskDetailFacade } from '../task-detail.facade';
import { TaskStatusBadgeComponent } from '@shared/components/task-status-badge/task-status-badge.component';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-task-info-tab',
  standalone: true,
  imports: [TaskStatusBadgeComponent, UserAvatarComponent],
  templateUrl: './task-info-tab.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskInfoTabComponent {
  readonly f = inject(TaskDetailFacade);
}
