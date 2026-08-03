import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { CatalogServiceItem } from '@core/models/catalog.model';
import { ServiceProposition, TaskService } from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getAllServices() {
    return this.http.get<{ success: boolean; services: CatalogServiceItem[] }>(
      `${this.base}/services`
    );
  }

  updateTaskServices(taskId: number, serviceIds: number[]) {
    return this.http.post<{
      success: boolean;
      message?: string;
      services: TaskService[];
    }>(`${this.base}/tasks/${taskId}/services`, { service_ids: serviceIds });
  }

  proposeService(taskId: number, name: string) {
    return this.http.post<{
      success: boolean;
      message?: string;
      proposition?: ServiceProposition;
    }>(`${this.base}/tasks/${taskId}/propose-service`, { name });
  }
}
