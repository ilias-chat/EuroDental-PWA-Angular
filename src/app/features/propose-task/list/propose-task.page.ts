import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { ProposedTaskApiService } from '@core/services/proposed-task-api.service';
import {
  ProposedTaskClientOption,
  ProposedTaskFormPayload,
  ProposedTaskItem,
  ProposedTaskTypeOption,
} from '@core/models/proposed-task.model';
import {
  filterClients,
  isPendingProposal,
  proposalStatusBadgeClass,
} from '../utils/propose-task-display';
import { resolveAvatarUrl } from '@shared/utils/asset-url';

interface ProposeFormState {
  task_name: string;
  task_type: string;
  client_id: number | null;
  description: string;
  urgent: boolean;
}

@Component({
  selector: 'app-propose-task',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonSpinner,
  ],
  templateUrl: './propose-task.page.html',
  styleUrl: './propose-task.page.scss',
})
export class ProposeTaskPage implements OnInit {
  private readonly api = inject(ProposedTaskApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly proposals = signal<ProposedTaskItem[]>([]);
  readonly clients = signal<ProposedTaskClientOption[]>([]);
  readonly taskTypes = signal<ProposedTaskTypeOption[]>([]);
  readonly showFormModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly editMode = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly deleteTargetId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly deleting = signal(false);
  readonly form = signal<ProposeFormState>(this.emptyForm());
  readonly clientSearch = signal('');
  readonly showClientDropdown = signal(false);
  readonly selectedClient = signal<ProposedTaskClientOption | null>(null);

  readonly proposalStatusBadgeClass = proposalStatusBadgeClass;
  readonly isPendingProposal = isPendingProposal;
  readonly resolveClientAvatar = resolveAvatarUrl;

  readonly filteredClients = computed(() =>
    filterClients(this.clients(), this.clientSearch())
  );

  readonly descriptionRequired = computed(() => this.selectedClient() == null);

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent): void {
    this.loading.set(!event);
    this.error.set(null);

    this.api
      .index()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.proposals.set(res.proposed_tasks ?? []);
          this.clients.set(res.clients ?? []);
          this.taskTypes.set(res.task_types ?? []);
          this.loading.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
        error: (err) => {
          const msg =
            err?.status === 403
              ? "Vous n'êtes pas autorisé à proposer des tâches."
              : 'Impossible de charger vos propositions.';
          this.error.set(msg);
          this.proposals.set([]);
          this.loading.set(false);
          event?.target && (event.target as HTMLIonRefresherElement).complete();
        },
      });
  }

  openCreateModal(): void {
    this.editMode.set(false);
    this.editingId.set(null);
    this.resetForm();
    this.showFormModal.set(true);
  }

  openEditModal(proposal: ProposedTaskItem): void {
    this.editMode.set(true);
    this.editingId.set(proposal.id);
    this.form.set({
      task_name: proposal.task_name,
      task_type: proposal.task_type,
      client_id: proposal.client_id,
      description: proposal.description ?? '',
      urgent: proposal.urgent,
    });

    const client =
      proposal.client_id != null
        ? this.clients().find((c) => c.id === proposal.client_id) ?? null
        : null;

    if (client) {
      this.selectedClient.set(client);
      this.clientSearch.set(client.name);
    } else if (proposal.client_name) {
      this.selectedClient.set({
        id: proposal.client_id!,
        name: proposal.client_name,
        image: proposal.client_image,
        city: proposal.client_city,
      });
      this.clientSearch.set(proposal.client_name);
    } else {
      this.selectedClient.set(null);
      this.clientSearch.set('');
    }

    this.showClientDropdown.set(false);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editMode.set(false);
    this.editingId.set(null);
    this.resetForm();
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
    if (id == null || this.deleting()) {
      return;
    }

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
            this.removeProposal(id);
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

  onClientSearchInput(value: string): void {
    this.clientSearch.set(value);
    this.showClientDropdown.set(true);
    if (!value.trim()) {
      this.clearClient();
    }
  }

  selectClient(client: ProposedTaskClientOption): void {
    this.selectedClient.set(client);
    this.form.update((f) => ({ ...f, client_id: client.id }));
    this.clientSearch.set(client.name);
    this.showClientDropdown.set(false);
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.form.update((f) => ({ ...f, client_id: null }));
    this.clientSearch.set('');
  }

  hideClientDropdown(): void {
    this.showClientDropdown.set(false);
  }

  updateFormField<K extends keyof ProposeFormState>(key: K, value: ProposeFormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  submitForm(): void {
    const f = this.form();
    if (!f.task_name.trim() || !f.task_type.trim()) {
      return;
    }
    if (this.descriptionRequired() && !f.description.trim()) {
      return;
    }
    if (this.submitting()) {
      return;
    }

    const payload: ProposedTaskFormPayload = {
      task_name: f.task_name.trim(),
      task_type: f.task_type.trim(),
      client_id: f.client_id,
      description: f.description.trim(),
      urgent: f.urgent,
    };

    this.submitting.set(true);
    const req$ = this.editMode()
      ? this.api.update(this.editingId()!, payload)
      : this.api.store(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async (res) => {
        this.submitting.set(false);
        if (res.success && res.proposal) {
          await this.presentToast(res.message, 'success');
          this.upsertProposal(res.proposal);
          this.closeFormModal();
        } else {
          await this.presentToast(res.message || 'Une erreur est survenue', 'danger');
        }
      },
      error: async (err) => {
        this.submitting.set(false);
        const message =
          err?.error?.message ??
          (err?.status === 422 ? 'Erreur de validation' : 'Une erreur est survenue');
        await this.presentToast(message, 'danger');
      },
    });
  }

  private upsertProposal(item: ProposedTaskItem): void {
    this.proposals.update((list) => {
      const index = list.findIndex((p) => p.id === item.id);
      if (index === -1) {
        return [item, ...list];
      }
      const next = [...list];
      next[index] = item;
      return next;
    });
  }

  private removeProposal(id: number): void {
    this.proposals.update((list) => list.filter((p) => p.id !== id));
  }

  private resetForm(): void {
    this.form.set(this.emptyForm());
    this.clientSearch.set('');
    this.selectedClient.set(null);
    this.showClientDropdown.set(false);
  }

  private emptyForm(): ProposeFormState {
    return {
      task_name: '',
      task_type: '',
      client_id: null,
      description: '',
      urgent: false,
    };
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const t = await this.toast.create({ message, duration: 2800, color, position: 'bottom' });
    await t.present();
  }
}
