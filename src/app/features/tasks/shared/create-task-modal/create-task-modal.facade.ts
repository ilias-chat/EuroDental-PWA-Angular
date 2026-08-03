import { computed, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastController } from '@ionic/angular/standalone';
import { TaskApiService } from '@core/services/task-api.service';
import {
  ClientSearchItem,
  CreateTaskPayload,
  TaskFormUserOption,
  TaskTypeItem,
} from '@core/models/task.model';
import { avatarFallbackUrl, resolveAvatarUrl } from '@shared/utils/asset-url';

interface CreateTaskFormState {
  task_name: string;
  task_type: string;
  description: string;
  client_id: number | null;
  task_date: string;
  technician_id: number | null;
  helping_user_ids: number[];
}

@Injectable()
export class CreateTaskModalFacade {
  private readonly api = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly taskTypes = signal<TaskTypeItem[]>([]);
  readonly form = signal<CreateTaskFormState>(this.emptyForm());
  readonly creating = signal(false);

  readonly isDeploymentContext = signal(false);
  readonly deploymentMembers = signal<TaskFormUserOption[]>([]);

  readonly selectedClient = signal<ClientSearchItem | null>(null);
  readonly clientDropdownOpen = signal(false);
  readonly clientSearchQuery = signal('');
  readonly clientResults = signal<ClientSearchItem[]>([]);
  readonly clientLoading = signal(false);
  readonly clientHasMore = signal(false);
  private clientPage = 1;

  readonly techDropdownOpen = signal(false);
  readonly techSearchQuery = signal('');
  readonly selectedTechnician = signal<TaskFormUserOption | null>(null);

  readonly helpingUsers = signal<TaskFormUserOption[]>([]);
  readonly showHelpingPicker = signal(false);
  readonly helpingDropdownOpen = signal(false);
  readonly helpingSearchQuery = signal('');
  readonly selectedHelpingUser = signal<TaskFormUserOption | null>(null);

  private readonly avatarFallbackByUserId = signal<Record<number, string>>({});

  readonly filteredTechnicians = computed(() => {
    const q = this.techSearchQuery().trim().toLowerCase();
    const members = this.deploymentMembers();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q));
  });

  readonly availableHelpingUsers = computed(() => {
    const techId = this.form().technician_id;
    const picked = new Set(this.helpingUsers().map((u) => u.id));
    const q = this.helpingSearchQuery().trim().toLowerCase();
    return this.deploymentMembers().filter((m) => {
      if (m.id === techId || picked.has(m.id)) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q);
    });
  });

  private deploymentId: number | null = null;
  private taskTypesLoaded = false;
  private clientSearchTimer: ReturnType<typeof setTimeout> | null = null;

  init(defaultDate: string, deploymentId: number | null, members: TaskFormUserOption[]): void {
    this.deploymentId = deploymentId;
    this.isDeploymentContext.set(members.length > 0);
    this.deploymentMembers.set(members);

    this.form.set({
      ...this.emptyForm(),
      task_date: defaultDate,
      technician_id: null,
    });
    this.selectedTechnician.set(null);
    this.helpingUsers.set([]);
    this.resetClientPicker();
    this.closeUserDropdowns();
    this.loadTaskTypesIfNeeded();
  }

  reset(): void {
    this.deploymentId = null;
    this.isDeploymentContext.set(false);
    this.deploymentMembers.set([]);
    this.form.set(this.emptyForm());
    this.selectedTechnician.set(null);
    this.helpingUsers.set([]);
    this.resetClientPicker();
    this.closeUserDropdowns();
    this.avatarFallbackByUserId.set({});
    this.creating.set(false);
  }

  updateField<K extends keyof CreateTaskFormState>(key: K, value: CreateTaskFormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  clientDisplayName(client: ClientSearchItem | null): string {
    if (!client) return 'Sélectionner un client';
    return client.name ?? `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim();
  }

  clientAvatar(client: ClientSearchItem | null): string {
    if (!client) return avatarFallbackUrl('Client');
    return resolveAvatarUrl(this.clientDisplayName(client), client.image ?? null);
  }

  userAvatar(user: TaskFormUserOption | null): string {
    if (!user) return avatarFallbackUrl('Utilisateur');
    return this.avatarFallbackByUserId()[user.id] ?? resolveAvatarUrl(user.name, user.image ?? null);
  }

  onUserAvatarError(user: TaskFormUserOption): void {
    this.avatarFallbackByUserId.update((m) => ({
      ...m,
      [user.id]: avatarFallbackUrl(user.name),
    }));
  }

  toggleClientDropdown(): void {
    const next = !this.clientDropdownOpen();
    this.closeUserDropdowns();
    this.clientDropdownOpen.set(next);
    if (next && !this.clientResults().length) {
      this.fetchClients(true);
    }
  }

  closeClientDropdown(): void {
    this.clientDropdownOpen.set(false);
  }

  onClientSearchInput(value: string): void {
    this.clientSearchQuery.set(value);
    if (this.clientSearchTimer) clearTimeout(this.clientSearchTimer);
    this.clientSearchTimer = setTimeout(() => this.fetchClients(true), 300);
  }

  loadMoreClients(): void {
    if (this.clientLoading() || !this.clientHasMore()) return;
    this.clientPage += 1;
    this.fetchClients(false);
  }

  pickClient(client: ClientSearchItem): void {
    this.selectedClient.set(client);
    this.form.update((f) => ({ ...f, client_id: client.id }));
    this.clientSearchQuery.set(this.clientDisplayName(client));
    this.closeClientDropdown();
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.form.update((f) => ({ ...f, client_id: null }));
    this.clientSearchQuery.set('');
  }

  toggleTechDropdown(): void {
    const next = !this.techDropdownOpen();
    this.closeUserDropdowns();
    this.clientDropdownOpen.set(false);
    this.techDropdownOpen.set(next);
  }

  pickTechnician(user: TaskFormUserOption): void {
    this.selectedTechnician.set(user);
    this.form.update((f) => ({
      ...f,
      technician_id: user.id,
      helping_user_ids: f.helping_user_ids.filter((id) => id !== user.id),
    }));
    this.helpingUsers.update((list) => list.filter((u) => u.id !== user.id));
    this.techDropdownOpen.set(false);
    this.techSearchQuery.set('');
  }

  openHelpingPicker(): void {
    this.showHelpingPicker.set(true);
    this.selectedHelpingUser.set(null);
    this.helpingSearchQuery.set('');
  }

  cancelHelpingPicker(): void {
    this.showHelpingPicker.set(false);
    this.helpingDropdownOpen.set(false);
    this.selectedHelpingUser.set(null);
    this.helpingSearchQuery.set('');
  }

  toggleHelpingDropdown(): void {
    this.helpingDropdownOpen.update((v) => !v);
  }

  addHelpingUser(): void {
    const user = this.selectedHelpingUser();
    if (!user) return;
    if (this.helpingUsers().some((u) => u.id === user.id)) return;
    this.helpingUsers.update((list) => [...list, user]);
    this.form.update((f) => ({
      ...f,
      helping_user_ids: [...f.helping_user_ids, user.id],
    }));
    this.cancelHelpingPicker();
  }

  removeHelpingUser(userId: number): void {
    this.helpingUsers.update((list) => list.filter((u) => u.id !== userId));
    this.form.update((f) => ({
      ...f,
      helping_user_ids: f.helping_user_ids.filter((id) => id !== userId),
    }));
  }

  closeAllDropdowns(): void {
    this.closeClientDropdown();
    this.closeUserDropdowns();
  }

  submit(onSuccess: (taskId: number) => void): void {
    const form = this.form();
    if (!form.task_name.trim() || !form.task_type || !form.task_date || this.creating()) {
      return;
    }

    this.creating.set(true);
    const payload: CreateTaskPayload = {
      task_name: form.task_name.trim(),
      task_type: form.task_type,
      description: form.description.trim() || null,
      client_id: form.client_id,
      task_date: form.task_date,
      deployment_id: this.deploymentId,
      technician_id: this.isDeploymentContext() ? form.technician_id : null,
      helping_user_ids: this.isDeploymentContext() ? form.helping_user_ids : [],
    };

    this.api
      .createTask(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.creating.set(false);
          if (!res.success) {
            void this.presentToast(res.message ?? 'Erreur lors de la création.');
            return;
          }
          void this.presentToast('Tâche créée avec succès.');
          onSuccess(res.task?.id ?? 0);
        },
        error: (err) => {
          this.creating.set(false);
          void this.presentToast(err?.error?.message ?? 'Erreur lors de la création.');
        },
      });
  }

  private fetchClients(reset: boolean): void {
    if (reset) {
      this.clientPage = 1;
    }
    this.clientLoading.set(true);
    this.api
      .searchCreateClients(this.clientSearchQuery().trim(), this.clientPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const incoming = res.clients ?? [];
          this.clientResults.set(reset ? incoming : [...this.clientResults(), ...incoming]);
          this.clientHasMore.set(!!res.pagination?.has_more);
          this.clientLoading.set(false);
        },
        error: () => {
          if (reset) this.clientResults.set([]);
          this.clientHasMore.set(false);
          this.clientLoading.set(false);
        },
      });
  }

  private resetClientPicker(): void {
    this.selectedClient.set(null);
    this.clientDropdownOpen.set(false);
    this.clientSearchQuery.set('');
    this.clientResults.set([]);
    this.clientLoading.set(false);
    this.clientHasMore.set(false);
    this.clientPage = 1;
    if (this.clientSearchTimer) {
      clearTimeout(this.clientSearchTimer);
      this.clientSearchTimer = null;
    }
  }

  private closeUserDropdowns(): void {
    this.techDropdownOpen.set(false);
    this.techSearchQuery.set('');
    this.helpingDropdownOpen.set(false);
    this.helpingSearchQuery.set('');
    this.showHelpingPicker.set(false);
    this.selectedHelpingUser.set(null);
  }

  private loadTaskTypesIfNeeded(): void {
    if (this.taskTypesLoaded && this.taskTypes().length) {
      return;
    }
    this.api
      .taskTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.taskTypes.set(res.task_types ?? []);
          this.taskTypesLoaded = true;
        },
        error: () => undefined,
      });
  }

  private emptyForm(): CreateTaskFormState {
    return {
      task_name: '',
      task_type: '',
      description: '',
      client_id: null,
      task_date: '',
      technician_id: null,
      helping_user_ids: [],
    };
  }

  private async presentToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2800, position: 'bottom' });
    await t.present();
  }
}
