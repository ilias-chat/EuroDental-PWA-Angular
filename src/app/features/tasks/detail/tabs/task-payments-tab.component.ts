import { Component, inject } from '@angular/core';
import { TaskDetailFacade } from '../task-detail.facade';

@Component({
  selector: 'app-task-payments-tab',
  standalone: true,
  templateUrl: './task-payments-tab.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskPaymentsTabComponent {
  readonly f = inject(TaskDetailFacade);
}
