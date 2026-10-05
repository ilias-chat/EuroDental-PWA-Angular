import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskFormFacade } from './task-form.facade';

@Component({
  selector: 'app-task-form-fields',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-form-fields.component.html',
  styleUrl: './task-form-fields.component.scss',
})
export class TaskFormFieldsComponent {
  readonly f = inject(TaskFormFacade);
  readonly allowReferenceGeneration = input(true);
}
