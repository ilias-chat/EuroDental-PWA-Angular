import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { LeaveRequestApiService } from '@core/services/leave-request-api.service';
import {
  LeaveRequestFormPayload,
  LeaveRequestItem,
} from '@core/models/leave-request.model';
import {
  calculateLeaveDays,
  canCancelLeaveRequest,
  formatDateTime,
  formatDateWithDay,
  getJustificationLabel,
  getLeaveTypeLabel,
  getStatusLabel,
  leaveDaysLabel,
  statusBadgeClass,
  todayIsoDate,
} from '../utils/leave-request-display';

interface LeaveFormState {
  start_date: string;
  end_date: string;
  leave_type: string;
  description: string;
  justification_method: string;
}

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonSpinner,
  ],
  templateUrl: './leave-requests.page.html',
  styleUrl: './leave-requests.page.scss',
})
export class LeaveRequestsPage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(LeaveRequestApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly requests = signal<LeaveRequestItem[]>([]);
  readonly showModal = signal(false);
  readonly showDetailModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly selectedRequest = signal<LeaveRequestItem | null>(null);
  readonly deleteTargetId = signal<number | null>(null);
  readonly deleting = signal(false);
  readonly editMode = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly form = signal<LeaveFormState>(this.emptyForm());

  readonly formatDateWithDay = formatDateWithDay;
  readonly formatDateTime = formatDateTime;
  readonly calculateLeaveDays = calculateLeaveDays;
  readonly leaveDaysLabel = leaveDaysLabel;
  readonly getLeaveTypeLabel = getLeaveTypeLabel;
  readonly getJustificationLabel = getJustificationLabel;
  readonly getStatusLabel = getStatusLabel;
  readonly statusBadgeClass = statusBadgeClass;
  readonly canCancelLeaveRequest = canCancelLeaveRequest;
  readonly todayIso = todayIsoDate;

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent): void {
    this.loading.set(!event);
    this.error.set(null);

    this.api
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.requests.set(res.leave_requests ?? []);
          this.loading.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
        error: () => {
          this.error.set('Impossible de charger vos demandes de congé.');
          this.requests.set([]);
          this.loading.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
      });
  }

  openDetailModal(request: LeaveRequestItem): void {
    this.selectedRequest.set(request);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedRequest.set(null);
  }

  onDetailCancelClick(event: Event, id: number): void {
    event.stopPropagation();
    this.cancelRequest(id);
  }

  openCreateModal(): void {
    this.editMode.set(false);
    this.editingId.set(null);
    this.form.set(this.emptyForm());
    this.showModal.set(true);
  }

  openEditModal(request: LeaveRequestItem): void {
    this.editMode.set(true);
    this.editingId.set(request.id);
    this.form.set({
      start_date: request.start_date,
      end_date: request.end_date,
      leave_type: request.leave_type ?? '',
      description: request.description ?? '',
      justification_method: request.justification_method ?? '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editMode.set(false);
    this.editingId.set(null);
    this.form.set(this.emptyForm());
  }

  updateFormField<K extends keyof LeaveFormState>(key: K, value: LeaveFormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  onStartDateChange(value: string): void {
    const f = this.form();
    const end = f.end_date && f.end_date < value ? value : f.end_date;
    this.form.set({ ...f, start_date: value, end_date: end });
  }

  submitForm(): void {
    if (this.submitting()) return;

    const f = this.form();
    const payload: LeaveRequestFormPayload = {
      start_date: f.start_date,
      end_date: f.end_date,
    };
    if (f.leave_type) payload.leave_type = f.leave_type;
    if (f.description.trim()) payload.description = f.description.trim();
    if (f.justification_method) payload.justification_method = f.justification_method;

    this.submitting.set(true);
    const req$ = this.editMode()
      ? this.api.update(this.editingId()!, payload)
      : this.api.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async (res) => {
        this.submitting.set(false);
        if (res.success) {
          await this.presentToast(res.message, 'success');
          this.closeModal();
          if (res.leave_request) {
            this.upsertRequest(res.leave_request);
          }
        } else {
          await this.presentToast(res.message || 'Une erreur est survenue', 'danger');
        }
      },
      error: async (err) => {
        this.submitting.set(false);
        await this.presentToast(err?.error?.message ?? 'Une erreur est survenue', 'danger');
      },
    });
  }

  cancelRequest(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    this.api
      .cancel(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (res) => {
          if (res.success) {
            await this.presentToast(res.message, 'success');
            if (res.leave_request) {
              this.upsertRequest(res.leave_request);
            }
          } else {
            await this.presentToast(res.message || 'Une erreur est survenue', 'danger');
          }
        },
        error: async (err) => {
          await this.presentToast(err?.error?.message ?? 'Une erreur est survenue', 'danger');
        },
      });
  }

  requestDelete(id: number): void {
    this.deleteTargetId.set(id);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deleteTargetId.set(null);
    this.deleting.set(false);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id == null || this.deleting()) return;

    this.deleting.set(true);
    this.api
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (res) => {
          this.deleting.set(false);
          if (res.success) {
            await this.presentToast(res.message, 'success');
            this.closeDeleteConfirm();
            this.removeRequest(id);
          } else {
            await this.presentToast(res.message || 'Une erreur est survenue', 'danger');
          }
        },
        error: async (err) => {
          this.deleting.set(false);
          await this.presentToast(err?.error?.message ?? 'Une erreur est survenue', 'danger');
        },
      });
  }

  formMinEndDate(): string {
    return this.form().start_date || this.todayIso();
  }

  /** Insert new or replace existing (same order as API: newest first on create). */
  private upsertRequest(item: LeaveRequestItem): void {
    this.requests.update((list) => {
      const index = list.findIndex((r) => r.id === item.id);
      if (index === -1) {
        return [item, ...list];
      }
      const next = [...list];
      next[index] = item;
      return next;
    });
    if (this.selectedRequest()?.id === item.id) {
      this.selectedRequest.set(item);
    }
  }

  private removeRequest(id: number): void {
    this.requests.update((list) => list.filter((r) => r.id !== id));
    if (this.selectedRequest()?.id === id) {
      this.closeDetailModal();
    }
  }

  private emptyForm(): LeaveFormState {
    return {
      start_date: '',
      end_date: '',
      leave_type: '',
      description: '',
      justification_method: '',
    };
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'bottom' });
    await t.present();
  }
}
