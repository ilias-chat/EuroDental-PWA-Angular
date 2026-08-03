import { Component, inject } from '@angular/core';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { TaskDetailFacade } from '../task-detail.facade';

@Component({
  selector: 'app-task-detail-modals',
  standalone: true,
  imports: [IonModal, IonSpinner],
  templateUrl: './task-detail-modals.component.html',
  styleUrl: '../task-detail.shared.scss',
})
export class TaskDetailModalsComponent {
  readonly f = inject(TaskDetailFacade);
}
