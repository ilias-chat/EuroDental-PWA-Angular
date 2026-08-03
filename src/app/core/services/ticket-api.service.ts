import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  TicketMutationResponse,
  TicketShowResponse,
  TicketsListResponse,
  TicketStatus,
  TicketStatusFilter,
} from '@core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tickets`;

  list(status: TicketStatusFilter = 'all', page = 1) {
    let params = new HttpParams().set('page', String(page));
    if (status !== 'all') {
      params = params.set('status', status);
    }
    return this.http.get<TicketsListResponse>(this.base, { params });
  }

  show(id: number) {
    return this.http.get<TicketShowResponse>(`${this.base}/${id}`);
  }

  create(payload: { subject: string; body: string; attachment?: File | null }) {
    const form = new FormData();
    form.append('subject', payload.subject.trim());
    form.append('body', payload.body.trim());
    if (payload.attachment) {
      form.append('attachment', payload.attachment);
    }
    return this.http.post<TicketMutationResponse>(this.base, form);
  }

  storeReply(id: number, payload: { body: string; attachment?: File | null }) {
    const form = new FormData();
    form.append('body', payload.body.trim());
    if (payload.attachment) {
      form.append('attachment', payload.attachment);
    }
    return this.http.post<TicketMutationResponse>(`${this.base}/${id}/replies`, form);
  }

  resolve(id: number) {
    return this.http.post<TicketMutationResponse>(`${this.base}/${id}/resolve`, {});
  }

  updateStatus(id: number, status: TicketStatus) {
    return this.http.patch<TicketMutationResponse>(`${this.base}/${id}/status`, { status });
  }
}
