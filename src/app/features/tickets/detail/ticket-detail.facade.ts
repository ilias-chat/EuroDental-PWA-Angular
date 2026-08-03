import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { TicketApiService } from '@core/services/ticket-api.service';
import { TicketDetail } from '@core/models/ticket.model';

interface ReplyFormState {
  body: string;
  attachment: File | null;
}

@Injectable()
export class TicketDetailFacade {
  private readonly api = inject(TicketApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastController);

  readonly loading = signal(true);
  readonly ticket = signal<TicketDetail | null>(null);
  readonly ticketsListBackHref = signal('/tabs/tickets');

  readonly showReplyModal = signal(false);
  readonly showResolveConfirm = signal(false);
  readonly submittingReply = signal(false);
  readonly resolving = signal(false);
  readonly replyForm = signal<ReplyFormState>({ body: '', attachment: null });
  readonly replyAttachmentPreview = signal<string | null>(null);

  private ticketId = 0;

  init(ticketId: number): void {
    this.ticketId = ticketId;
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? history.state) as { ticketsListBackHref?: string };
    if (state?.ticketsListBackHref) {
      this.ticketsListBackHref.set(state.ticketsListBackHref);
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .show(this.ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.success || !res.ticket) {
            void this.presentToast(res.message ?? 'Impossible de charger le ticket.');
            this.loading.set(false);
            return;
          }
          this.ticket.set(res.ticket);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          void this.presentToast(err?.error?.message ?? 'Impossible de charger le ticket.');
        },
      });
  }

  openReplyModal(): void {
    this.replyForm.set({ body: '', attachment: null });
    this.clearReplyAttachmentPreview();
    this.showReplyModal.set(true);
  }

  closeReplyModal(): void {
    this.showReplyModal.set(false);
    this.replyForm.set({ body: '', attachment: null });
    this.clearReplyAttachmentPreview();
  }

  setReplyBody(value: string): void {
    this.replyForm.update((f) => ({ ...f, body: value }));
  }

  setReplyAttachment(file: File | null): void {
    this.clearReplyAttachmentPreview();
    this.replyForm.update((f) => ({ ...f, attachment: file }));
    if (file?.type.startsWith('image/')) {
      this.replyAttachmentPreview.set(URL.createObjectURL(file));
    }
  }

  clearReplyAttachment(): void {
    this.clearReplyAttachmentPreview();
    this.replyForm.update((f) => ({ ...f, attachment: null }));
  }

  submitReply(): void {
    const form = this.replyForm();
    if (!form.body.trim() || this.submittingReply()) return;

    this.submittingReply.set(true);
    this.api
      .storeReply(this.ticketId, { body: form.body, attachment: form.attachment })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submittingReply.set(false);
          if (!res.success || !res.ticket) {
            void this.presentToast(res.message ?? 'Erreur lors de l\'envoi.');
            return;
          }
          this.ticket.set(res.ticket);
          this.closeReplyModal();
          void this.presentToast(res.message ?? 'Réponse ajoutée.');
        },
        error: (err) => {
          this.submittingReply.set(false);
          void this.presentToast(err?.error?.message ?? 'Erreur lors de l\'envoi.');
        },
      });
  }

  openResolveConfirm(): void {
    this.showResolveConfirm.set(true);
  }

  closeResolveConfirm(): void {
    this.showResolveConfirm.set(false);
    this.resolving.set(false);
  }

  confirmResolve(): void {
    if (this.resolving()) return;
    this.resolving.set(true);
    this.api
      .resolve(this.ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resolving.set(false);
          if (!res.success || !res.ticket) {
            void this.presentToast(res.message ?? 'Erreur lors de la résolution.');
            return;
          }
          this.ticket.set(res.ticket);
          this.closeResolveConfirm();
          void this.presentToast(res.message ?? 'Ticket marqué comme résolu.');
        },
        error: (err) => {
          this.resolving.set(false);
          void this.presentToast(err?.error?.message ?? 'Erreur lors de la résolution.');
        },
      });
  }

  private clearReplyAttachmentPreview(): void {
    const preview = this.replyAttachmentPreview();
    if (preview) URL.revokeObjectURL(preview);
    this.replyAttachmentPreview.set(null);
  }

  private async presentToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2800, position: 'bottom' });
    await t.present();
  }
}
