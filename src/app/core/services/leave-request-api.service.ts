import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  LeaveRequestFormPayload,
  LeaveRequestMutationResponse,
  LeaveRequestsListResponse,
} from '@core/models/leave-request.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/leave-requests`;

  list() {
    return this.http.get<LeaveRequestsListResponse>(this.base);
  }

  create(payload: LeaveRequestFormPayload) {
    return this.http.post<LeaveRequestMutationResponse>(this.base, payload);
  }

  update(id: number, payload: LeaveRequestFormPayload) {
    return this.http.put<LeaveRequestMutationResponse>(`${this.base}/${id}`, payload);
  }

  cancel(id: number) {
    return this.http.post<LeaveRequestMutationResponse>(`${this.base}/${id}/cancel`, {});
  }

  delete(id: number) {
    return this.http.delete<LeaveRequestMutationResponse>(`${this.base}/${id}`);
  }
}
