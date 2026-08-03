export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  is_sent: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsFeedResponse {
  success: boolean;
  notifications: AppNotification[];
  unread_count: number;
}
