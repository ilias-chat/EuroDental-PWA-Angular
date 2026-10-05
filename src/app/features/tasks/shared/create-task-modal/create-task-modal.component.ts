import { Component, effect, inject, input, model, output } from '@angular/core';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { TaskFormUserOption } from '@core/models/task.model';
import { TaskFormFacade } from '../task-form/task-form.facade';
import { TaskFormFieldsComponent } from '../task-form/task-form-fields.component';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  providers: [TaskFormFacade],
  imports: [IonModal, IonSpinner, TaskFormFieldsComponent],
  templateUrl: './create-task-modal.component.html',
})
export class CreateTaskModalComponent {
  readonly f = inject(TaskFormFacade);

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
