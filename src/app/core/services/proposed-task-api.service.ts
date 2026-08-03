import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProposedTaskDeleteResponse,
  ProposedTaskFormPayload,
  ProposedTaskMutationResponse,
  ProposedTasksIndexResponse,
  ProposedTaskStoreResponse,
} from '../models/proposed-task.model';

@Injectable({ providedIn: 'root' })
export class ProposedTaskApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proposed-tasks`;

  index(): Observable<ProposedTasksIndexResponse> {
    return this.http.get<ProposedTasksIndexResponse>(this.base);
  }

  store(payload: ProposedTaskFormPayload): Observable<ProposedTaskStoreResponse> {
    return this.http.post<ProposedTaskStoreResponse>(this.base, payload);
  }

  update(id: number, payload: ProposedTaskFormPayload): Observable<ProposedTaskMutationResponse> {
    return this.http.put<ProposedTaskMutationResponse>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<ProposedTaskDeleteResponse> {
    return this.http.delete<ProposedTaskDeleteResponse>(`${this.base}/${id}`);
  }
}
