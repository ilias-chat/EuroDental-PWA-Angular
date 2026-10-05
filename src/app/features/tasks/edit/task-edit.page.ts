import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { TaskDetail, TaskFormUserOption } from '@core/models/task.model';
import { TaskApiService } from '@core/services/task-api.service';
import { DeploymentApiService } from '@core/services/deployment-api.service';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { TaskFormFacade } from '../shared/task-form/task-form.facade';
import { TaskFormFieldsComponent } from '../shared/task-form/task-form-fields.component';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  providers: [TaskFormFacade],
  imports: [IonContent, IonSpinner, AppHeaderComponent, TaskFormFieldsComponent],
  templateUrl: './task-edit.page.html',
  styleUrl: './task-edit.page.scss',
})
export class TaskEditPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TaskApiService);
  private readonly deployments = inject(DeploymentApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);

  readonly f = inject(TaskFormFacade);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly task = signal<TaskDetail | null>(null);

  get backHref(): string {
    return '/tasks/' + this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('Tâche introuvable.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.getTask(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ task }) => {
        if (!this.canEdit(task)) {
          this.error.set('Vous ne pouvez pas modifier cette tâche.');
          this.loading.set(false);
          return;
        }
        this.task.set(task);
        this.f.initForEdit(task);
        this.loading.set(false);
        if (task.deployment_id) {
          this.loadDeploymentMembers(task.deployment_id);
        }
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'Accès refusé.' : 'Impossible de charger la tâche.');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    void this.router.navigateByUrl(this.backHref);
  }

  save(): void {
    const task = this.task();
    if (!task || this.saving()) return;
    if (!this.canEdit(task)) {
      this.error.set('Vous ne pouvez pas modifier cette tâche.');
      return;
    }
    const form = this.f.form();
    if (!form.task_name.trim() || !form.reference.trim() || !form.task_type || !form.task_date) {
      this.error.set('Renseignez le nom, la référence, le type et la date.');
      return;
    }
    const technicianId = this.auth.canAssignMainTechnician()
      ? form.technician_id
      : this.auth.user()?.id;
    this.f.closeAllDropdowns();
    this.error.set('');
    this.saving.set(true);
    this.api.updateTask(task.id, {
      task_name: form.task_name.trim(),
      reference: form.reference.trim(),
      task_type: form.task_type,
      task_date: form.task_date,
      description: form.description.trim() || null,
      client_id: form.client_id,
      technician_id: technicianId,
      helping_user_ids: form.helping_user_ids.filter((id) => id !== technicianId),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (!res.success) {
          this.error.set(res.message ?? 'Impossible de modifier la tâche.');
          return;
        }
        void this.toast.create({ message: 'Tâche mise à jour.', duration: 2500, position: 'bottom' })
          .then((toast) => toast.present());
        void this.router.navigate(['/tasks', task.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Impossible de modifier la tâche.');
      },
    });
  }

  private canEdit(task: TaskDetail): boolean {
    return this.auth.canCreateTasks() &&
      (this.auth.hasPermission('tasks_view_all') || task.is_main_technician);
  }

  private loadDeploymentMembers(id: number): void {
    this.deployments.show(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ deployment }) => {
        const members = new Map<number, TaskFormUserOption>();
        const add = (userId?: number | null, name?: string | null, image?: string | null) => {
          if (userId && name) members.set(userId, { id: userId, name, image });
        };
        add(deployment.responsible_id, deployment.responsible_name, deployment.responsible_image);
        add(deployment.driver_id, deployment.driver_name, deployment.driver_image);
        for (const member of deployment.team_members ?? []) add(member.id, member.name, member.image);
        for (const member of deployment.hosters_detail ?? []) add(member.id, member.name, member.image);
        this.f.setUserOptions([...members.values()]);
      },
      error: () => this.error.set('Impossible de charger les membres du déplacement.'),
    });
  }
}
