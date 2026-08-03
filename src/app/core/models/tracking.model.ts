export interface TrackingLeaveRequest {
  start_date: string;
  end_date: string;
}

export interface TrackingUser {
  id: number;
  name: string;
  image: string | null;
  profile: string;
  profile_id: number | null;
  tasks_count: number;
  last_event_status: 'waiting' | 'working' | 'paused' | 'route' | string;
  leave_requests: TrackingLeaveRequest[];
}

export type TrackingUserView = TrackingUser & { available: boolean };

export interface TrackingEvent {
  id: string;
  event_type: string;
  time: string;
  formatted_time: string;
  timestamp: number;
  task_name: string | null;
  task_type: string | null;
  status: string | null;
  original_status: string | null;
  client_name: string | null;
  client_city: string | null;
  client_image: string | null;
  has_ongoing_visit: boolean;
  user_id: number;
  user_name: string | null;
  user_image: string | null;
  city_name: string | null;
}

export interface TrackingEventsResponse {
  success: boolean;
  tracking: TrackingEvent[];
}

export interface TrackingRangeResponse {
  success: boolean;
  start: string;
  end: string;
  tasks: import('./task.model').TaskListItem[];
}

export type SuiviTab = 'calendar' | 'tracking';

export interface TrackingWeekDay {
  date: string;
  dayName: string;
  dayNumber: number;
}
