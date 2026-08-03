import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { TaskActionResponse } from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskActionsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  postAction(taskId: number, action: string, body: Record<string, unknown> = {}) {
    return this.http.post<TaskActionResponse>(`${this.base}/tasks/${taskId}/${action}`, body);
  }
}
