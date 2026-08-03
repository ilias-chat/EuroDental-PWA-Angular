import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TrackingEventsResponse,
  TrackingRangeResponse,
  TrackingUser,
} from '@core/models/tracking.model';

@Injectable({ providedIn: 'root' })
export class TrackingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  usersWithTasks() {
    return this.http.get<TrackingUser[]>(`${this.base}/tasks/tracking/users`);
  }

  trackingEvents(userId: number, date: string) {
    return this.http.get<TrackingEventsResponse>(`${this.base}/tasks/tracking/${userId}`, {
      params: { date },
    });
  }

  tasksRange(start: string, end: string, userId: number | null = null) {
    const params: Record<string, string> = { start, end };
    if (userId != null) {
      params['user_id'] = String(userId);
    }
    return this.http.get<TrackingRangeResponse>(`${this.base}/tasks/tracking/range`, { params });
  }
}
