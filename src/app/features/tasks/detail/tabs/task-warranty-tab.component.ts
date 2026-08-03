import { Component, inject } from '@angular/core';
import { TaskDetailFacade } from '../task-detail.facade';

@Component({
  selector: 'app-task-warranty-tab',
  standalone: true,
  templateUrl: './task-warranty-tab.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskWarrantyTabComponent {
  readonly f = inject(TaskDetailFacade);
}
