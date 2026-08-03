import { Component, inject } from '@angular/core';
import { TaskDetailFacade } from '../task-detail.facade';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-task-progression-tab',
  standalone: true,
  imports: [UserAvatarComponent],
  templateUrl: './task-progression-tab.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskProgressionTabComponent {
  readonly f = inject(TaskDetailFacade);
}
