import { computed, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/auth.service';
import { DeploymentApiService } from '@core/services/deployment-api.service';
import {
  DeploymentDetail,
  DeploymentEvent,
  DeploymentExpense,
  DEPLOYMENT_EXPENSE_CATEGORIES,
  DeploymentMember,
} from '@core/models/deployment.model';
import { formatTimelineDate, userInitials } from '@shared/utils/timeline-event';
import {
  expensesTotal,
  formatDateKey,
  formatExpenseAmount,
  getDeploymentTimelineEventMeta,
} from '../utils/deployment-display';
import {
  DEPLOYMENT_DETAIL_TABS,
  DeplacementDetailTab,
} from './deplacement-detail.types';

interface ExpenseFormState {
  id: number | null;
  description: string;
  amount: string;
  expense_date: string;
  category: string;
}

@Injectable()
export class DeplacementDetailFacade {
  private readonly api = inject(DeploymentApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly tab = signal<DeplacementDetailTab>('details');
  readonly loading = signal(true);
  readonly deployment = signal<DeploymentDetail | null>(null);
  readonly deplacementListBackHref = signal('/tabs/deplacement');

  readonly showExpenseModal = signal(false);
  readonly editingExpense = signal(false);
  readonly expenseForm = signal<ExpenseFormState>(this.emptyExpenseForm());
  readonly submittingExpense = signal(false);
  readonly showDeleteExpenseConfirm = signal(false);
  readonly deleteExpenseTarget = signal<DeploymentExpense | null>(null);
  readonly deletingExpense = signal(false);

  readonly showJoinMemberModal = signal(false);
  readonly joinMemberUserId = signal<number | null>(null);
  readonly submittingDeploymentEvent = signal(false);
  readonly showFinishDeploymentConfirm = signal(false);
  readonly showAllEvents = signal(false);
  readonly timelineFilterUserId = signal<number | null>(null);

  readonly showAddTaskModal = signal(false);

  readonly canWriteDeployment = signal(false);

  readonly expenseCategories = DEPLOYMENT_EXPENSE_CATEGORIES;

  readonly formatTimelineDate = formatTimelineDate;
  readonly formatExpenseAmount = formatExpenseAmount;
  readonly userInitials = userInitials;

  private deploymentId = 0;

  init(deploymentId: number, listBackHref: string): void {
    this.deploymentId = deploymentId;
    this.deplacementListBackHref.set(listBackHref);
    this.canWriteDeployment.set(this.auth.hasPermission('deployment_write'));

    const initialTab = this.parseTab(this.route.snapshot.queryParamMap.get('tab'));
    if (initialTab) {
      this.tab.set(initialTab);
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tabFromUrl = this.parseTab(params.get('tab'));
      if (tabFromUrl && tabFromUrl !== this.tab()) {
        this.applyTab(tabFromUrl, false);
      }
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .show(this.deploymentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.deployment.set(res.deployment);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          void this.presentToast('Impossible de charger les détails du déplacement.');
        },
      });
  }

  setTab(value: DeplacementDetailTab): void {
    this.applyTab(value, true);
  }

  parseTab(value: string | null): DeplacementDetailTab | null {
    if (!value) return null;
    return DEPLOYMENT_DETAIL_TABS.includes(value as DeplacementDetailTab)
      ? (value as DeplacementDetailTab)
      : null;
  }

  openTask(taskId: number): void {
    const dep = this.deployment();
    void this.router.navigate(['/tasks', taskId], {
      state: {
        deplacementId: dep?.id ?? this.deploymentId,
        deplacementDate: dep?.deployment_date ?? formatDateKey(new Date()),
        deplacementTab: this.tab(),
      },
    });
  }

  // ─── Expenses ─────────────────────────────────────────────────────────────

  openAddExpense(): void {
    if (this.hasDeploymentEnded()) return;
    const dep = this.deployment();
    this.expenseForm.set({
      ...this.emptyExpenseForm(),
      expense_date: dep?.deployment_date ?? formatDateKey(new Date()),
    });
    this.editingExpense.set(false);
    this.showExpenseModal.set(true);
  }

  openEditExpense(expense: DeploymentExpense): void {
    if (this.hasDeploymentEnded()) return;
    this.expenseForm.set({
      id: expense.id,
      description: expense.description,
      amount: String(expense.amount),
      expense_date: expense.expense_date,
      category: expense.category ?? '',
    });
    this.editingExpense.set(true);
    this.showExpenseModal.set(true);
  }

  closeExpenseModal(): void {
    this.showExpenseModal.set(false);
    this.expenseForm.set(this.emptyExpenseForm());
    this.editingExpense.set(false);
  }

  updateExpenseField<K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]): void {
    this.expenseForm.update((f) => ({ ...f, [key]: value }));
  }

  submitExpense(): void {
    if (this.hasDeploymentEnded()) return;
    const dep = this.deployment();
    const form = this.expenseForm();
    if (!dep || !form.description.trim() || !form.amount || !form.expense_date) {
      return;
    }
    this.submittingExpense.set(true);
    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      expense_date: form.expense_date,
      category: form.category.trim() || null,
    };
    const req = form.id
      ? this.api.updateExpense(dep.id, form.id, payload)
      : this.api.createExpense(dep.id, payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.submittingExpense.set(false);
        if (!res.success || !res.expense) {
          void this.presentToast(res.message ?? 'Erreur lors de l\'enregistrement.');
          return;
        }
        this.deployment.update((d) => {
          if (!d) return d;
          const expenses = [...(d.expenses ?? [])];
          if (form.id) {
            const idx = expenses.findIndex((e) => e.id === form.id);
            if (idx >= 0) expenses[idx] = res.expense!;
          } else {
            expenses.push(res.expense!);
          }
          return { ...d, expenses };
        });
        this.closeExpenseModal();
        void this.presentToast(res.message ?? 'Dépense enregistrée.');
      },
      error: (err) => {
        this.submittingExpense.set(false);
        void this.presentToast(err?.error?.message ?? 'Erreur lors de l\'enregistrement.');
      },
    });
  }

  requestDeleteExpense(expense: DeploymentExpense): void {
    if (this.hasDeploymentEnded()) return;
    this.deleteExpenseTarget.set(expense);
    this.showDeleteExpenseConfirm.set(true);
  }

  closeDeleteExpenseConfirm(): void {
    this.showDeleteExpenseConfirm.set(false);
    this.deleteExpenseTarget.set(null);
    this.deletingExpense.set(false);
  }

  confirmDeleteExpense(): void {
    const dep = this.deployment();
    const expense = this.deleteExpenseTarget();
    if (!dep || !expense || this.deletingExpense()) {
      return;
    }

    this.deletingExpense.set(true);
    this.api
      .deleteExpense(dep.id, expense.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.deletingExpense.set(false);
          if (!res.success) {
            void this.presentToast(res.message ?? 'Suppression impossible.');
            return;
          }
          this.deployment.update((d) =>
            d ? { ...d, expenses: (d.expenses ?? []).filter((e) => e.id !== expense.id) } : d
          );
          this.closeDeleteExpenseConfirm();
          void this.presentToast('Dépense supprimée.');
        },
        error: (err) => {
          this.deletingExpense.set(false);
          void this.presentToast(err?.error?.message ?? 'Suppression impossible.');
        },
      });
  }

  // ─── Deployment events ────────────────────────────────────────────────────

  submitDeploymentEvent(eventType: 'start' | 'end' | 'joined'): void {
    const dep = this.deployment();
    if (!dep) return;
    if (this.hasDeploymentEnded()) return;
    this.submittingDeploymentEvent.set(true);
    const payload =
      eventType === 'joined'
        ? { event_type: eventType, user_id: this.joinMemberUserId() }
        : { event_type: eventType };

    this.api
      .createEvent(dep.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submittingDeploymentEvent.set(false);
          if (!res.success || !res.event) {
            void this.presentToast(res.message ?? 'Erreur lors de l\'enregistrement.');
            return;
          }
          this.deployment.update((d) =>
            d ? { ...d, events: [...(d.events ?? []), res.event!] } : d
          );
          this.showJoinMemberModal.set(false);
          this.joinMemberUserId.set(null);
          if (eventType === 'end') {
            this.showFinishDeploymentConfirm.set(false);
          }
          void this.presentToast(res.message ?? 'Événement ajouté.');
        },
        error: (err) => {
          this.submittingDeploymentEvent.set(false);
          void this.presentToast(err?.error?.message ?? 'Erreur lors de l\'enregistrement.');
        },
      });
  }

  openJoinMemberModal(): void {
    if (this.hasDeploymentEnded()) return;
    this.joinMemberUserId.set(null);
    this.showJoinMemberModal.set(true);
  }

  openFinishDeploymentConfirm(): void {
    if (this.hasDeploymentEnded() || !this.hasDeploymentStarted()) return;
    this.showFinishDeploymentConfirm.set(true);
  }

  closeFinishDeploymentConfirm(): void {
    this.showFinishDeploymentConfirm.set(false);
  }

  confirmFinishDeployment(): void {
    if (this.hasDeploymentEnded() || this.submittingDeploymentEvent()) return;
    this.submitDeploymentEvent('end');
  }

  deploymentExpensesTotal(): number {
    return expensesTotal(this.deployment()?.expenses);
  }

  incompleteTasksCount(): number {
    const tasks = this.deployment()?.tasks ?? [];
    return tasks.filter((t) => t.status !== 'terminée' && t.status !== 'annulée').length;
  }

  membersNotJoined(): { id: number; name: string }[] {
    const events = this.deployment()?.events ?? [];
    return this.deploymentMembersForJoin().filter(
      (member) => !this.hasMemberJoinedEvent(member.id, member.name, events)
    );
  }

  closeJoinMemberModal(): void {
    this.showJoinMemberModal.set(false);
    this.joinMemberUserId.set(null);
  }

  confirmJoinMember(): void {
    if (!this.joinMemberUserId()) return;
    this.submitDeploymentEvent('joined');
  }

  timelineTeamMembers(): DeploymentMember[] {
    const dep = this.deployment();
    if (!dep) return [];
    const members: DeploymentMember[] = [];
    const push = (id?: number | null, name?: string | null, image?: string | null) => {
      if (id && name && !members.some((m) => m.id === id)) {
        members.push({ id, name, image: image ?? null });
      }
    };
    push(dep.responsible_id, dep.responsible_name, dep.responsible_image);
    push(dep.driver_id, dep.driver_name, dep.driver_image);
    for (const member of dep.team_members ?? []) {
      push(member.id, member.name, member.image);
    }
    for (const member of dep.hosters_detail ?? []) {
      push(member.id, member.name, member.image);
    }
    return members;
  }

  setTimelineFilter(userId: number | null): void {
    this.timelineFilterUserId.set(userId);
    this.showAllEvents.set(false);
  }

  isTimelineFilterActive(userId: number | null): boolean {
    return this.timelineFilterUserId() === userId;
  }

  filteredDeploymentEvents(): DeploymentEvent[] {
    const events = this.deployment()?.events ?? [];
    const userId = this.timelineFilterUserId();
    if (userId === null) {
      return events;
    }
    const member = this.timelineTeamMembers().find((m) => m.id === userId);
    return events.filter((ev) => {
      if (ev.user_id != null) {
        return ev.user_id === userId;
      }
      if (member?.name && ev.user_name) {
        return ev.user_name.trim() === member.name.trim();
      }
      return false;
    });
  }

  visibleDeploymentEvents(): DeploymentEvent[] {
    const events = this.filteredDeploymentEvents();
    if (this.showAllEvents() || events.length <= 3) {
      return events;
    }
    return events.slice(-3);
  }

  deploymentEventMeta(ev: DeploymentEvent) {
    return getDeploymentTimelineEventMeta(ev.event_type);
  }

  deploymentEventTimeLabel(ev: DeploymentEvent): string {
    return formatTimelineDate(ev.event_time ?? ev.created_at ?? '');
  }

  hasDeploymentEnded(): boolean {
    return (this.deployment()?.events ?? []).some((e) => e.event_type === 'end');
  }

  hasDeploymentStarted(): boolean {
    return (this.deployment()?.events ?? []).some((e) => e.event_type === 'start');
  }

  deploymentMembersForJoin(): { id: number; name: string }[] {
    const dep = this.deployment();
    if (!dep) return [];
    const members: { id: number; name: string }[] = [];
    const push = (id?: number | null, name?: string | null) => {
      if (id && name && !members.some((m) => m.id === id)) {
        members.push({ id, name });
      }
    };
    push(dep.responsible_id, dep.responsible_name);
    push(dep.driver_id, dep.driver_name);
    for (const m of dep.team_members ?? []) {
      push(m.id, m.name);
    }
    for (const m of dep.hosters_detail ?? []) {
      push(m.id, m.name);
    }
    return members;
  }

  // ─── Add task ─────────────────────────────────────────────────────────────

  openAddTaskModal(): void {
    this.showAddTaskModal.set(true);
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal.set(false);
  }

  setShowAddTaskModal(open: boolean): void {
    this.showAddTaskModal.set(open);
  }

  createTaskDefaultDate(): string {
    return this.deployment()?.deployment_date ?? formatDateKey(new Date());
  }

  createTaskDeploymentId(): number | null {
    return this.deployment()?.id ?? null;
  }

  readonly createTaskDeploymentMembers = computed(() =>
    this.timelineTeamMembers().map((m) => ({
      id: m.id,
      name: m.name,
      image: m.image ?? null,
    }))
  );

  onTaskCreated(): void {
    this.closeAddTaskModal();
    this.applyTab('tasks', true);
    this.load();
  }

  private applyTab(value: DeplacementDetailTab, updateUrl: boolean): void {
    this.tab.set(value);
    if (updateUrl) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: value },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  private hasMemberJoinedEvent(
    memberId: number,
    memberName: string,
    events: DeploymentEvent[]
  ): boolean {
    return events.some(
      (ev) =>
        ev.event_type === 'joined' &&
        (ev.user_id === memberId ||
          (!!ev.user_name && ev.user_name.trim() === memberName.trim()))
    );
  }

  private emptyExpenseForm(): ExpenseFormState {
    return { id: null, description: '', amount: '', expense_date: '', category: '' };
  }

  private async presentToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2800, position: 'bottom' });
    await t.present();
  }
}
