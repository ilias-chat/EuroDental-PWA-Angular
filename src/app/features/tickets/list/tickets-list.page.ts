import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { TicketApiService } from '@core/services/ticket-api.service';
import {
  TicketListItem,
  TicketPagination,
  TicketStatusFilter,
} from '@core/models/ticket.model';
import {
  TICKET_STATUS_FILTERS,
} from '../utils/ticket-display';
import { TicketStatusBadgeComponent } from '@shared/components/ticket-status-badge/ticket-status-badge.component';

interface CreateFormState {
  subject: string;
  body: string;
  attachment: File | null;
}

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    IonContent,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    FormsModule,
    TicketStatusBadgeComponent,
  ],
  templateUrl: './tickets-list.page.html',
  styleUrl: './tickets-list.page.scss',
})
export class TicketsListPage implements OnInit, ViewWillEnter {
  private readonly api = inject(TicketApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tickets = signal<TicketListItem[]>([]);
  readonly pagination = signal<TicketPagination | null>(null);
  readonly hasManage = signal(false);
  readonly statusFilter = signal<TicketStatusFilter>('all');
  readonly currentPage = signal(1);

  readonly showCreateModal = signal(false);
  readonly creating = signal(false);
  readonly createForm = signal<CreateFormState>({ subject: '', body: '', attachment: null });
  readonly createAttachmentPreview = signal<string | null>(null);

  readonly statusFilters = TICKET_STATUS_FILTERS;
  readonly canCreate = signal(this.auth.canCreateTickets());

  ngOnInit(): void {
    this.fetchTickets(true);
  }

  ionViewWillEnter(): void {
    this.fetchTickets(false);
  }

  onRefresh(event: CustomEvent): void {
    this.fetchTickets(false, event);
  }

  fetchTickets(showLoading: boolean, refreshEvent?: CustomEvent, page = this.currentPage()): void {
    if (showLoading) {
      this.loading.set(true);
      this.error.set(null);
    }

    this.api
      .list(this.statusFilter(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.tickets.set(res.tickets ?? []);
          this.pagination.set(res.pagination ?? null);
          this.hasManage.set(!!res.has_manage);
          this.currentPage.set(res.pagination?.current_page ?? page);
          this.loading.set(false);
          refreshEvent?.target && (refreshEvent.target as HTMLIonRefresherElement).complete();
        },
        error: (err) => {
          const msg =
            err?.status === 403
              ? "Vous n'êtes pas autorisé à accéder aux tickets."
              : 'Impossible de charger les tickets.';
          this.error.set(msg);
          this.tickets.set([]);
          this.loading.set(false);
          refreshEvent?.target && (refreshEvent.target as HTMLIonRefresherElement).complete();
        },
      });
  }

  setStatusFilter(value: TicketStatusFilter): void {
    if (this.statusFilter() === value) return;
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.fetchTickets(true, undefined, 1);
  }

  goToPage(page: number): void {
    const pagination = this.pagination();
    if (!pagination || page < 1 || page > pagination.last_page || page === pagination.current_page) {
      return;
    }
    this.fetchTickets(true, undefined, page);
  }

  openTicket(ticket: TicketListItem): void {
    void this.router.navigate(['/tickets', ticket.id], {
      state: { ticketsListBackHref: '/tabs/tickets' },
    });
  }

  openCreateModal(): void {
    this.createForm.set({ subject: '', body: '', attachment: null });
    this.clearCreateAttachmentPreview();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createForm.set({ subject: '', body: '', attachment: null });
    this.clearCreateAttachmentPreview();
  }

  updateCreateField<K extends keyof CreateFormState>(key: K, value: CreateFormState[K]): void {
    this.createForm.update((f) => ({ ...f, [key]: value }));
  }

  onCreateAttachmentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.clearCreateAttachmentPreview();
    this.createForm.update((f) => ({ ...f, attachment: file }));
    if (file?.type.startsWith('image/')) {
      this.createAttachmentPreview.set(URL.createObjectURL(file));
    }
  }

  clearCreateAttachment(): void {
    this.clearCreateAttachmentPreview();
    this.createForm.update((f) => ({ ...f, attachment: null }));
  }

  submitCreate(): void {
    const form = this.createForm();
    if (!form.subject.trim() || !form.body.trim() || this.creating()) return;

    this.creating.set(true);
    this.api
      .create({ subject: form.subject, body: form.body, attachment: form.attachment })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (res) => {
          this.creating.set(false);
          if (!res.success || !res.ticket_id) {
            await this.presentToast(res.message ?? 'Erreur lors de la création.');
            return;
          }
          this.closeCreateModal();
          await this.presentToast(res.message ?? 'Ticket créé.');
          void this.router.navigate(['/tickets', res.ticket_id], {
            state: { ticketsListBackHref: '/tabs/tickets' },
          });
        },
        error: async (err) => {
          this.creating.set(false);
          await this.presentToast(err?.error?.message ?? 'Erreur lors de la création.');
        },
      });
  }

  private clearCreateAttachmentPreview(): void {
    const preview = this.createAttachmentPreview();
    if (preview) URL.revokeObjectURL(preview);
    this.createAttachmentPreview.set(null);
  }

  private async presentToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2800, position: 'bottom' });
    await t.present();
  }
}
