import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { CreateTaskModalComponent } from '@features/tasks/shared/create-task-modal/create-task-modal.component';
import { DeplacementDetailFacade } from '../deplacement-detail.facade';

@Component({
  selector: 'app-deplacement-detail-modals',
  standalone: true,
  imports: [IonModal, IonSpinner, FormsModule, CreateTaskModalComponent],
  templateUrl: './deplacement-detail-modals.component.html',
})
export class DeplacementDetailModalsComponent {
  readonly f = inject(DeplacementDetailFacade);
}
