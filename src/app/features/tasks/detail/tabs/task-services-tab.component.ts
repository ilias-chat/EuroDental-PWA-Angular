import { Component, inject } from '@angular/core';
import { TaskDetailFacade } from '../task-detail.facade';

@Component({
  selector: 'app-task-services-tab',
  standalone: true,
  templateUrl: './task-services-tab.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskServicesTabComponent {
  readonly f = inject(TaskDetailFacade);
}
