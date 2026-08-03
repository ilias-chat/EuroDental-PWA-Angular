import { Component, effect, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { TaskFormUserOption } from '@core/models/task.model';
import { CreateTaskModalFacade } from './create-task-modal.facade';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  providers: [CreateTaskModalFacade],
  imports: [IonModal, IonSpinner, FormsModule],
  templateUrl: './create-task-modal.component.html',
})
export class CreateTaskModalComponent {
  readonly f = inject(CreateTaskModalFacade);

  readonly isOpen = model(false);
  readonly defaultDate = input.required<string>();
  readonly deploymentId = input<number | null>(null);
  readonly deploymentMembers = input<TaskFormUserOption[]>([]);

  readonly created = output<number>();
  readonly dismissed = output<void>();

  private modalWasOpen = false;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open && !this.modalWasOpen) {
        this.f.init(this.defaultDate(), this.deploymentId(), this.deploymentMembers());
        this.modalWasOpen = true;
      } else if (!open && this.modalWasOpen) {
        this.f.reset();
        this.modalWasOpen = false;
      }
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.dismissed.emit();
  }

  submit(): void {
    this.f.submit((taskId) => {
      this.created.emit(taskId);
      this.isOpen.set(false);
    });
  }
}
