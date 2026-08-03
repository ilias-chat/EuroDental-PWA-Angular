import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskBillingService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  recordPayment(taskId: number, amountPaid: number) {
    return this.http.post<{
      success: boolean;
      message?: string;
      task?: { id: number; is_paid: boolean; amount_paid: number | null };
    }>(`${this.base}/tasks/${taskId}/payment`, { amount_paid: amountPaid });
  }

  recordAdminDelivery(taskId: number, amount: number, deliveryDate: string) {
    return this.http.post<{
      success: boolean;
      message?: string;
      task?: {
        id: number;
        admin_delivery_amount: number | null;
        admin_delivery_task_id: number | null;
      };
      delivery_task_id?: number;
    }>(`${this.base}/tasks/${taskId}/admin-delivery-payment`, {
      amount,
      delivery_date: deliveryDate,
    });
  }

  getUsers() {
    return this.http.get<{
      success: boolean;
      users: { id: number; name: string; image: string | null }[];
    }>(`${this.base}/users`);
  }
}
