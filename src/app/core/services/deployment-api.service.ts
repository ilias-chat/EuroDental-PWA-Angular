import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  DeploymentDayResponse,
  DeploymentEventPayload,
  DeploymentExpensePayload,
  DeploymentMonthResponse,
  PastDeploymentsCountResponse,
  PastDeploymentsResponse,
  DeploymentShowResponse,
} from '@core/models/deployment.model';

interface ExpenseMutationResponse {
  success: boolean;
  message?: string;
  expense?: {
    id: number;
    description: string;
    amount: number;
    expense_date: string;
    category?: string | null;
  };
}

interface EventMutationResponse {
  success: boolean;
  message?: string;
  event?: {
    id: number;
    event_type: string;
    user_id?: number | null;
    user_name?: string | null;
    user_image?: string | null;
    event_time?: string | null;
    created_at?: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class DeploymentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/deployments`;

  day(date: string) {
    return this.http.get<DeploymentDayResponse>(`${this.base}/day`, { params: { date } });
  }

  month(month: string) {
    return this.http.get<DeploymentMonthResponse>(`${this.base}/month`, { params: { month } });
  }

  pastCount() {
    return this.http.get<PastDeploymentsCountResponse>(`${this.base}/past/count`);
  }

  pastList() {
    return this.http.get<PastDeploymentsResponse>(`${this.base}/past`);
  }

  show(id: number) {
    return this.http.get<DeploymentShowResponse>(`${this.base}/${id}`);
  }

  createExpense(deploymentId: number, payload: DeploymentExpensePayload) {
    return this.http.post<ExpenseMutationResponse>(`${this.base}/${deploymentId}/expenses`, payload);
  }

  updateExpense(deploymentId: number, expenseId: number, payload: DeploymentExpensePayload) {
    return this.http.put<ExpenseMutationResponse>(
      `${this.base}/${deploymentId}/expenses/${expenseId}`,
      payload
    );
  }

  deleteExpense(deploymentId: number, expenseId: number) {
    return this.http.delete<{ success: boolean; message?: string }>(
      `${this.base}/${deploymentId}/expenses/${expenseId}`
    );
  }

  createEvent(deploymentId: number, payload: DeploymentEventPayload) {
    return this.http.post<EventMutationResponse>(
      `${this.base}/${deploymentId}/events`,
      payload
    );
  }
}
