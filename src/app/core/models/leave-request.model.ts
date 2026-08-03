export type LeaveRequestStatus =
  | 'waiting'
  | 'denied'
  | 'accepted'
  | 'on_leave'
  | 'completed';

export type LeaveType = 'vacation' | 'sick_leave' | 'personal' | 'other' | '';

export type JustificationMethod = 'whatsapp' | 'email' | 'telegram' | 'other' | '';

export interface LeaveRequestItem {
  id: number;
  start_date: string;
  end_date: string;
  leave_type: LeaveType | null;
  description: string | null;
  status: LeaveRequestStatus;
  justification_method: JustificationMethod | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface LeaveRequestsListResponse {
  leave_requests: LeaveRequestItem[];
}

export interface LeaveRequestMutationResponse {
  success: boolean;
  message: string;
  leave_request?: LeaveRequestItem;
}

export interface LeaveRequestFormPayload {
  start_date: string;
  end_date: string;
  leave_type?: string;
  description?: string;
  justification_method?: string;
}
