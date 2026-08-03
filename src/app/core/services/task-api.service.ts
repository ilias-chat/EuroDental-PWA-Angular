import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  CreateTaskPayload,
  CreateTaskResponse,
  TaskCreateClientsResponse,
  TaskDetail,
  TaskEventsResponse,
  TaskListItem,
  TaskTypesResponse,
} from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getTodayTasks() {
    return this.http.get<{ success: boolean; date: string; tasks: TaskListItem[] }>(
      `${this.base}/tasks/today`
    );
  }

  getTasksInRange(start: string, end: string) {
    return this.http.get<{ success: boolean; start: string; end: string; tasks: TaskListItem[] }>(
      `${this.base}/tasks/range`,
      { params: { start, end } }
    );
  }

  getPastTasks() {
    return this.http.get<{
      success: boolean;
      past_tasks: TaskListItem[];
      count: number;
      message?: string;
    }>(`${this.base}/tasks/past`);
  }

  getTask(id: number) {
    return this.http.get<{ success: boolean; task: TaskDetail }>(`${this.base}/tasks/${id}`);
  }

  getTaskEvents(taskId: number) {
    return this.http.get<TaskEventsResponse>(`${this.base}/tasks/${taskId}/events`);
  }

  getUserLastEvent(taskId: number) {
    return this.http.get<{ success: boolean; last_event: string | null }>(
      `${this.base}/tasks/${taskId}/user-last-event`
    );
  }

  updateDescription(taskId: number, description: string) {
    return this.http.post<{ success: boolean; message?: string; description: string }>(
      `${this.base}/tasks/${taskId}/update-description`,
      { description }
    );
  }

  createTask(payload: CreateTaskPayload) {
    return this.http.post<CreateTaskResponse>(`${this.base}/tasks`, payload);
  }

  taskTypes() {
    return this.http.get<TaskTypesResponse>(`${this.base}/task-types`);
  }

  searchCreateClients(q = '', page = 1, perPage = 20) {
    return this.http.get<TaskCreateClientsResponse>(`${this.base}/tasks/create/clients`, {
      params: { q, page, per_page: perPage },
    });
  }
}
