import { Injectable, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { CatalogServiceItem } from '@core/models/catalog.model';
import {
  ServiceProposition,
  TaskActionResponse,
  TaskDetail,
  TaskEvent,
  TaskService,
  TaskUserRef,
} from '@core/models/task.model';
import { CatalogService } from '@core/services/catalog.service';
import { TaskActionsService } from '@core/services/task-actions.service';
import { TaskApiService } from '@core/services/task-api.service';
import { TaskBillingService } from '@core/services/task-billing.service';
import { resolveAvatarUrl, resolveStorageUrl } from '@shared/utils/asset-url';
import {
  parseDescriptionMarkdown,
  wrapDescriptionSelection,
} from '@shared/utils/description-markdown';
import { formatFrenchDate, formatShortDate } from '@shared/utils/task-status';
import {
  formatTimelineDate,
  getTimelineEventMeta,
  userInitials,
} from '@shared/utils/timeline-event';
import {
  formatWarrantyPurchaseDate,
  warrantyDaysLeftLabel,
  warrantyProgressPercent,
  warrantyStatusColors,
  warrantyStatusIcon,
  warrantyStatusLabel,
} from '@shared/utils/warranty-ui';
import { DETAIL_TABS, DetailTab } from './task-detail.types';
import {
  applyProgressionActionResult,
  mergeTaskEventsResponse,
} from './rules/task-action-sync';
import {
  canAddAdminDeliveryPayment as canAddAdminDeliveryPaymentRule,
  canEditDescription as canEditDescriptionRule,
  canManageServices as canManageServicesRule,
  canShowClientPaymentSection as canShowClientPaymentSectionRule,
  filterTimelineEvents,
  formatPaymentAmount as formatPaymentAmountRule,
  hasAdminDeliveryDisplay as hasAdminDeliveryDisplayRule,
  isAdminDeliveryAutoTask as isAdminDeliveryAutoTaskRule,
  isRestrictedDetailTab,
  isTeamMemberHighlighted as isTeamMemberHighlightedRule,
  teamMembers as teamMembersRule,
  visibleTimelineEvents,
} from './rules/task-detail.rules';
import {
  canUseProgressionActions as canUseProgressionActionsRule,
  showEnRouteButton as showEnRouteButtonRule,
  showFinishTaskButton as showFinishTaskButtonRule,
} from './rules/task-progression.rules';

@Injectable()
export class TaskDetailFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskApi = inject(TaskApiService);
  private readonly taskActions = inject(TaskActionsService);
  private readonly taskBilling = inject(TaskBillingService);
  private readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastController);
  private readonly sanitizer = inject(DomSanitizer);

  readonly tab = signal<DetailTab>('info');
  readonly loading = signal(true);
  readonly actionLoading = signal<string | null>(null);
  readonly task = signal<TaskDetail | null>(null);
  readonly events = computed(() => this.task()?.events ?? []);
  readonly warranty = computed(() => this.task()?.warranty_products ?? []);
  readonly showAllEvents = signal(false);
  readonly timelineFilterUserId = signal<number | null>(null);

  readonly showServicesModal = signal(false);
  readonly showProposeServiceModal = signal(false);
  readonly showPropositionDetailsModal = signal(false);
  readonly availableServices = signal<CatalogServiceItem[]>([]);
  readonly filteredServices = signal<CatalogServiceItem[]>([]);
  readonly selectedServiceIds = signal<number[]>([]);
  readonly serviceSearch = signal('');
  readonly savingServices = signal(false);
  readonly isProposingService = signal(false);
  readonly proposedServiceName = signal('');
  readonly selectedProposition = signal<ServiceProposition | null>(null);

  readonly showDescriptionEditModal = signal(false);
  readonly descriptionEdit = signal('');
  readonly isSavingDescription = signal(false);

  readonly showPaymentModal = signal(false);
  readonly paymentAmount = signal('');
  readonly isSavingPayment = signal(false);

  readonly showAdminDeliveryPaymentModal = signal(false);
  readonly adminDeliveryPaymentAmount = signal('');
  readonly adminDeliveryPaymentDate = signal('');
  readonly isSavingAdminDeliveryPayment = signal(false);

  readonly showDeliveryReceivedByModal = signal(false);
  readonly deliveryReceivedByUserId = signal<number | null>(null);
  readonly allUsers = signal<{ id: number; name: string; image: string | null }[]>([]);
  readonly loadingUsers = signal(false);

  readonly parseFloat = parseFloat;
  readonly formatFrenchDate = formatFrenchDate;
  readonly formatTimelineDate = formatTimelineDate;
  readonly userInitials = userInitials;
  readonly formatShortDate = formatShortDate;
  readonly warrantyStatusColors = warrantyStatusColors;
  readonly warrantyStatusLabel = warrantyStatusLabel;
  readonly warrantyStatusIcon = warrantyStatusIcon;
  readonly warrantyProgressPercent = warrantyProgressPercent;
  readonly warrantyDaysLeftLabel = warrantyDaysLeftLabel;
  readonly formatWarrantyPurchaseDate = formatWarrantyPurchaseDate;
  readonly tasksListBackHref = signal('/tabs/tasks');

  private taskId = 0;

  init(taskId: number, backHref: string): void {
    this.taskId = taskId;
    this.tasksListBackHref.set(backHref);

    const initialTab = this.parseDetailTab(this.route.snapshot.queryParamMap.get('tab'));
    if (initialTab) {
      this.tab.set(initialTab);
    }

    this.route.queryParamMap.subscribe((params) => {
      const tabFromUrl = this.parseDetailTab(params.get('tab'));
      if (tabFromUrl && tabFromUrl !== this.tab()) {
        this.applyTab(tabFromUrl, false);
      }
    });

    this.load();
  }

  setTab(value: DetailTab): void {
    this.applyTab(value, true);
  }

  parseDetailTab(value: string | null): DetailTab | null {
    if (!value) {
      return null;
    }
    return DETAIL_TABS.includes(value as DetailTab) ? (value as DetailTab) : null;
  }

  applyTab(value: DetailTab, updateUrl: boolean): void {
    const t = this.task();
    let nextTab = value;
    if (t && isAdminDeliveryAutoTaskRule(t) && isRestrictedDetailTab(nextTab)) {
      nextTab = 'info';
    }

    this.tab.set(nextTab);

    if (updateUrl) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: nextTab },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      task: this.taskApi.getTask(this.taskId),
      events: this.taskApi.getTaskEvents(this.taskId),
      lastEvent: this.taskApi.getUserLastEvent(this.taskId),
    }).subscribe({
      next: ({ task, events, lastEvent }) => {
        const t = { ...task.task, user_last_event: lastEvent.last_event };
        if (events.success) {
          t.events = events.events;
          t.warranty_products = events.warranty_products;
          t.service_propositions = events.service_propositions;
          t.is_paid = events.is_paid;
          t.amount_paid = events.amount_paid;
          t.admin_delivery_amount = events.admin_delivery_amount;
          t.admin_delivery_received_by_user_name = events.admin_delivery_received_by_user_name;
          if (events.user_last_event !== undefined) {
            t.user_last_event = events.user_last_event;
          }
        }
        this.task.set(t);
        if (isAdminDeliveryAutoTaskRule(t) && isRestrictedDetailTab(this.tab())) {
          this.applyTab('info', true);
        }
        this.loading.set(false);
      },
      error: async () => {
        this.loading.set(false);
        await this.presentToast('Erreur lors du chargement', 'danger');
      },
    });
  }

  syncTaskProgress(): void {
    this.taskApi.getTaskEvents(this.taskId).subscribe({
      next: (eventsRes) => {
        if (!eventsRes.success) {
          return;
        }
        const current = this.task();
        if (!current) {
          return;
        }
        this.task.set(mergeTaskEventsResponse(current, eventsRes));
      },
    });
  }

  canManageServices(t: TaskDetail): boolean {
    return canManageServicesRule(t);
  }

  canEditDescription(t: TaskDetail): boolean {
    return canEditDescriptionRule(t);
  }

  parsedDescription(text: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(parseDescriptionMarkdown(text));
  }

  openDescriptionEditModal(): void {
    const t = this.task();
    if (!t || !this.canEditDescription(t)) {
      void this.presentToast('Seul le technicien principal peut modifier la description.', 'warning');
      return;
    }
    this.descriptionEdit.set(t.description ?? '');
    this.showDescriptionEditModal.set(true);
  }

  closeDescriptionEditModal(): void {
    this.showDescriptionEditModal.set(false);
    this.descriptionEdit.set('');
    this.isSavingDescription.set(false);
  }

  wrapDescriptionText(
    prefix: string,
    suffix: string,
    textarea: HTMLTextAreaElement | undefined
  ): void {
    if (!textarea) {
      return;
    }
    const { value, selectionStart, selectionEnd } = textarea;
    const result = wrapDescriptionSelection(value, selectionStart, selectionEnd, prefix, suffix);
    this.descriptionEdit.set(result.value);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  saveDescription(): void {
    const t = this.task();
    if (!t || this.isSavingDescription()) {
      return;
    }
    if (!this.canEditDescription(t)) {
      void this.presentToast('Seul le technicien principal peut modifier la description.', 'warning');
      return;
    }

    const trimmed = this.descriptionEdit().trim();
    this.isSavingDescription.set(true);
    this.taskApi.updateDescription(this.taskId, trimmed).subscribe({
      next: async (res) => {
        this.isSavingDescription.set(false);
        if (res.success) {
          this.patchTaskDescription(res.description ?? trimmed);
          this.closeDescriptionEditModal();
          await this.presentToast('Description mise à jour avec succès.', 'success');
        } else {
          await this.presentToast('Impossible de mettre à jour la description.', 'danger');
        }
      },
      error: async (err) => {
        this.isSavingDescription.set(false);
        await this.presentToast(
          err?.error?.message ?? 'Impossible de mettre à jour la description.',
          'danger'
        );
      },
    });
  }

  isTeamMemberHighlighted(t: TaskDetail, memberId: number): boolean {
    return isTeamMemberHighlightedRule(t, memberId, this.auth.user()?.id);
  }

  teamMembers(t: TaskDetail): TaskUserRef[] {
    return teamMembersRule(t);
  }

  setTimelineFilter(userId: number | null): void {
    this.timelineFilterUserId.set(userId);
    this.showAllEvents.set(false);
  }

  isTimelineFilterActive(userId: number | null): boolean {
    return this.timelineFilterUserId() === userId;
  }

  filteredEvents(): TaskEvent[] {
    const t = this.task();
    const members = t ? this.teamMembers(t) : [];
    return filterTimelineEvents(this.events(), this.timelineFilterUserId(), members);
  }

  visibleEvents(): TaskEvent[] {
    return visibleTimelineEvents(this.filteredEvents(), this.showAllEvents());
  }

  eventMeta(ev: TaskEvent) {
    return getTimelineEventMeta(ev.type || ev.event_type || '');
  }

  eventTimeLabel(ev: TaskEvent): string {
    if (ev.formatted_time) {
      return ev.formatted_time.replace(' à ', ' ');
    }
    return formatTimelineDate(ev.event_time ?? '');
  }

  canWrite(): boolean {
    return this.auth.hasPermission('mobile_tasks_write');
  }

  canUseProgressionActions(t: TaskDetail): boolean {
    return canUseProgressionActionsRule(t);
  }

  showEnRouteButton(t: TaskDetail): boolean {
    return showEnRouteButtonRule(t);
  }

  showFinishTaskButton(t: TaskDetail): boolean {
    return showFinishTaskButtonRule(t, this.events(), this.auth.user()?.id);
  }

  async runAction(action: string, loadingKey: string): Promise<void> {
    this.actionLoading.set(loadingKey);
    this.taskActions.postAction(this.taskId, action).subscribe({
      next: async (res) => {
        this.actionLoading.set(null);
        if (res.success) {
          this.applyProgressionActionResult(res, loadingKey);
          this.syncTaskProgress();
          await this.presentToast(res.message || 'Succès', 'success');
        } else {
          await this.presentToast(res.message || 'Erreur', 'danger');
        }
      },
      error: async (err) => {
        this.actionLoading.set(null);
        await this.presentToast(err?.error?.message ?? 'Erreur', 'danger');
      },
    });
  }

  startRoute(): void {
    void this.runAction('start-route', 'start_route');
  }
  endRoute(): void {
    void this.runAction('end-route', 'end_route');
  }
  startVisit(): void {
    void this.runAction('start-visit', 'start_visit');
  }
  pauseVisit(): void {
    void this.runAction('pause-visit', 'pause_visit');
  }
  resumeVisit(): void {
    void this.runAction('resume-visit', 'resume_visit');
  }
  finishVisit(): void {
    void this.runAction('finish-visit', 'finish_visit');
  }

  onFinishTaskClick(): void {
    const t = this.task();
    if (!t) return;
    if (this.isDeliveryTask(t)) {
      this.openDeliveryReceivedByModal();
      return;
    }
    void this.runAction('finish', 'finish_task');
  }

  isDeliveryTask(t: TaskDetail): boolean {
    return isAdminDeliveryAutoTaskRule(t);
  }

  isAdminDeliveryAutoTask(t: TaskDetail): boolean {
    return isAdminDeliveryAutoTaskRule(t);
  }

  canShowClientPaymentSection(t: TaskDetail): boolean {
    return canShowClientPaymentSectionRule(t);
  }

  canAddAdminDeliveryPayment(t: TaskDetail): boolean {
    return canAddAdminDeliveryPaymentRule(t);
  }

  hasAdminDeliveryDisplay(t: TaskDetail): boolean {
    return hasAdminDeliveryDisplayRule(t);
  }

  adminDeliveryReceiverName(t: TaskDetail): string | null {
    return t.admin_delivery_received_by_user_name ?? null;
  }

  formatPaymentAmount(amount: number | null | undefined): string {
    return formatPaymentAmountRule(amount);
  }

  openPaymentModal(): void {
    const t = this.task();
    if (!t?.is_main_technician) {
      void this.presentToast('Seul le technicien principal peut enregistrer le paiement.', 'warning');
      return;
    }
    this.paymentAmount.set(
      t.amount_paid != null && t.amount_paid !== undefined
        ? this.formatPaymentAmount(t.amount_paid)
        : ''
    );
    this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.paymentAmount.set('');
    this.isSavingPayment.set(false);
  }

  async savePayment(): Promise<void> {
    const t = this.task();
    if (!t?.is_main_technician) {
      await this.presentToast('Seul le technicien principal peut enregistrer le paiement.', 'warning');
      return;
    }
    const amount = parseFloat(this.paymentAmount());
    if (Number.isNaN(amount) || amount < 0) {
      await this.presentToast('Veuillez saisir un montant valide.', 'warning');
      return;
    }
    this.isSavingPayment.set(true);
    this.taskBilling.recordPayment(this.taskId, amount).subscribe({
      next: async (res) => {
        this.isSavingPayment.set(false);
        if (res.success) {
          const paidAmount =
            res.task?.amount_paid != null ? Number(res.task.amount_paid) : amount;
          this.patchTask({ is_paid: true, amount_paid: paidAmount });
          await this.presentToast(res.message || 'Paiement enregistré avec succès', 'success');
          this.closePaymentModal();
        } else {
          await this.presentToast(res.message || "Erreur lors de l'enregistrement du paiement", 'danger');
        }
      },
      error: async (err) => {
        this.isSavingPayment.set(false);
        await this.presentToast(err?.error?.message ?? "Erreur lors de l'enregistrement du paiement", 'danger');
      },
    });
  }

  openAdminDeliveryPaymentModal(): void {
    if (!this.task()) return;
    this.adminDeliveryPaymentAmount.set('');
    this.adminDeliveryPaymentDate.set('');
    this.showAdminDeliveryPaymentModal.set(true);
  }

  closeAdminDeliveryPaymentModal(): void {
    this.showAdminDeliveryPaymentModal.set(false);
    this.adminDeliveryPaymentAmount.set('');
    this.adminDeliveryPaymentDate.set('');
    this.isSavingAdminDeliveryPayment.set(false);
  }

  async saveAdminDeliveryPayment(): Promise<void> {
    const t = this.task();
    if (!t) return;
    const amount = parseFloat(this.adminDeliveryPaymentAmount());
    if (Number.isNaN(amount) || amount < 0) {
      await this.presentToast('Veuillez saisir un montant valide', 'warning');
      return;
    }
    const deliveryDate = this.adminDeliveryPaymentDate() || this.todayIsoDate();
    this.isSavingAdminDeliveryPayment.set(true);
    this.taskBilling.recordAdminDelivery(this.taskId, amount, deliveryDate).subscribe({
      next: async (res) => {
        this.isSavingAdminDeliveryPayment.set(false);
        if (res.success) {
          this.patchTask({
            admin_delivery_amount: res.task?.admin_delivery_amount ?? amount,
            admin_delivery_task_id: res.task?.admin_delivery_task_id ?? null,
          });
          await this.presentToast(res.message || 'Paiement à remettre enregistré', 'success');
          this.closeAdminDeliveryPaymentModal();
        } else {
          await this.presentToast(res.message || "Erreur lors de l'enregistrement", 'danger');
        }
      },
      error: async (err) => {
        this.isSavingAdminDeliveryPayment.set(false);
        await this.presentToast(
          err?.error?.message ?? "Erreur lors de l'enregistrement du paiement à remettre",
          'danger'
        );
      },
    });
  }

  openDeliveryReceivedByModal(): void {
    this.deliveryReceivedByUserId.set(null);
    this.showDeliveryReceivedByModal.set(true);
    if (this.allUsers().length) return;
    this.loadingUsers.set(true);
    this.taskBilling.getUsers().subscribe({
      next: (res) => {
        this.allUsers.set(res.users ?? []);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
        void this.presentToast('Impossible de charger la liste des utilisateurs', 'danger');
      },
    });
  }

  closeDeliveryReceivedByModal(): void {
    this.showDeliveryReceivedByModal.set(false);
    this.deliveryReceivedByUserId.set(null);
  }

  finishTaskWithReceivedBy(): void {
    const userId = this.deliveryReceivedByUserId();
    if (!userId) {
      void this.presentToast('Veuillez sélectionner la personne qui a reçu le paiement.', 'warning');
      return;
    }
    this.actionLoading.set('finish_task');
    this.taskActions.postAction(this.taskId, 'finish', { received_by_user_id: userId }).subscribe({
      next: async (res) => {
        this.actionLoading.set(null);
        if (res.success) {
          const receivedByName =
            this.allUsers().find((u) => u.id === userId)?.name ?? null;
          this.patchTask({
            admin_delivery_received_by_user_id: userId,
            admin_delivery_received_by_user_name: receivedByName,
          });
          this.applyProgressionActionResult(res, 'finish_task');
          this.syncTaskProgress();
          await this.presentToast(res.message || 'Tâche terminée avec succès', 'success');
          this.closeDeliveryReceivedByModal();
        } else {
          await this.presentToast(res.message || 'Erreur lors de la finalisation', 'danger');
        }
      },
      error: async (err) => {
        this.actionLoading.set(null);
        await this.presentToast(err?.error?.message ?? 'Erreur lors de la finalisation de la tâche', 'danger');
      },
    });
  }

  onServiceSearchInput(value: string): void {
    this.serviceSearch.set(value);
    this.filterServices();
  }

  filterServices(): void {
    const term = this.serviceSearch().toLowerCase().trim();
    const list = this.availableServices();
    if (!term) {
      this.filteredServices.set(list);
      return;
    }
    this.filteredServices.set(
      list.filter((s) => {
        const name = (s.name || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        return name.includes(term) || desc.includes(term);
      })
    );
  }

  async openServicesModal(): Promise<void> {
    const t = this.task();
    if (!t || !this.canManageServices(t)) {
      await this.presentToast('Seul le technicien principal peut gérer les services.', 'warning');
      return;
    }

    this.serviceSearch.set('');
    this.catalog.getAllServices().subscribe({
      next: (data) => {
        const services = data.services ?? [];
        this.availableServices.set(services);
        this.filteredServices.set(services);
        this.selectedServiceIds.set((t.services ?? []).map((s) => s.id));
        this.showServicesModal.set(true);
      },
      error: async () => {
        await this.presentToast('Erreur lors du chargement des services', 'danger');
      },
    });
  }

  closeServicesModal(): void {
    this.showServicesModal.set(false);
    this.serviceSearch.set('');
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds().includes(id);
  }

  toggleServiceSelection(id: number): void {
    const current = this.selectedServiceIds();
    if (current.includes(id)) {
      this.selectedServiceIds.set(current.filter((x) => x !== id));
    } else {
      this.selectedServiceIds.set([...current, id]);
    }
  }

  saveServices(): void {
    const t = this.task();
    if (!t || this.savingServices()) return;

    this.savingServices.set(true);
    this.catalog.updateTaskServices(this.taskId, this.selectedServiceIds()).subscribe({
      next: async (res) => {
        this.savingServices.set(false);
        if (res.success) {
          this.patchTaskServices(res.services);
          this.closeServicesModal();
          await this.presentToast(res.message || 'Services mis à jour', 'success');
        } else {
          await this.presentToast(res.message || 'Erreur', 'danger');
        }
      },
      error: async (err) => {
        this.savingServices.set(false);
        await this.presentToast(err?.error?.message ?? 'Erreur lors de la sauvegarde', 'danger');
      },
    });
  }

  openProposeServiceModal(): void {
    const t = this.task();
    if (!t || !this.canManageServices(t)) {
      void this.presentToast('Seul le technicien principal peut proposer un service.', 'warning');
      return;
    }
    this.proposedServiceName.set('');
    this.showProposeServiceModal.set(true);
  }

  closeProposeServiceModal(): void {
    this.showProposeServiceModal.set(false);
    this.proposedServiceName.set('');
    this.isProposingService.set(false);
  }

  submitServiceProposal(): void {
    const t = this.task();
    const name = this.proposedServiceName().trim();
    if (!t || !this.canManageServices(t)) {
      void this.presentToast('Seul le technicien principal peut proposer un service.', 'warning');
      return;
    }
    if (!name) {
      void this.presentToast('Veuillez saisir un nom de service.', 'warning');
      return;
    }

    this.isProposingService.set(true);
    this.catalog.proposeService(this.taskId, name).subscribe({
      next: async (res) => {
        this.isProposingService.set(false);
        if (res.success) {
          if (res.proposition) {
            this.appendServiceProposition(res.proposition);
          }
          this.closeProposeServiceModal();
          await this.presentToast(res.message || 'Proposition envoyée', 'success');
        } else {
          await this.presentToast(res.message || 'Erreur', 'danger');
        }
      },
      error: async (err) => {
        this.isProposingService.set(false);
        await this.presentToast(err?.error?.message ?? "Erreur lors de l'envoi", 'danger');
      },
    });
  }

  openServicePropositionDetails(p: ServiceProposition): void {
    this.selectedProposition.set(p);
    this.showPropositionDetailsModal.set(true);
  }

  closePropositionDetailsModal(): void {
    this.showPropositionDetailsModal.set(false);
    this.selectedProposition.set(null);
  }

  clientImage(t: TaskDetail): string {
    const name = t.client_name || 'Client';
    return resolveStorageUrl(t.client_image) ?? resolveAvatarUrl(name, null);
  }

  private patchTask(partial: Partial<TaskDetail>): void {
    const current = this.task();
    if (current) {
      this.task.set({ ...current, ...partial });
    }
  }

  private applyProgressionActionResult(res: TaskActionResponse, loadingKey: string): void {
    const current = this.task();
    if (!current) {
      return;
    }
    this.task.set(applyProgressionActionResult(current, res, loadingKey, this.auth.user()));
  }

  private patchTaskServices(services: TaskService[]): void {
    const t = this.task();
    if (!t) return;
    this.task.set({ ...t, services: services ?? [] });
  }

  private patchTaskDescription(description: string): void {
    const t = this.task();
    if (!t) return;
    this.task.set({ ...t, description: description || null });
  }

  private appendServiceProposition(proposition: ServiceProposition): void {
    const t = this.task();
    if (!t) return;
    const list = [...(t.service_propositions ?? [])];
    if (!list.some((p) => p.id === proposition.id)) {
      list.push(proposition);
    }
    this.task.set({ ...t, service_propositions: list });
  }

  private todayIsoDate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'bottom' });
    await t.present();
  }
}
