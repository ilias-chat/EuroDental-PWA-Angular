export type TicketStatus = 'open' | 'in_progress' | 'solved';

export type TicketStatusFilter = TicketStatus | 'all';

export interface TicketAttachmentItem {
  id: number;
  url: string;
}

export interface TicketReplyItem {
  id: number;
  body: string;
  user_id: number | null;
  user_name: string | null;
  created_at: string | null;
  created_at_label: string | null;
  is_creator: boolean;
  attachments: TicketAttachmentItem[];
}

export interface TicketListItem {
  id: number;
  subject: string;
  status: TicketStatus;
  status_label: string;
  user_id: number;
  user_name: string | null;
  replies_count: number;
  updated_at: string | null;
  updated_at_label: string | null;
  created_at: string | null;
  created_at_label: string | null;
}

export interface TicketDetail extends TicketListItem {
  body: string;
  is_author: boolean;
  can_reply: boolean;
  can_resolve: boolean;
  can_manage_status: boolean;
  attachments: TicketAttachmentItem[];
  replies: TicketReplyItem[];
}

export interface TicketPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface TicketsListResponse {
  success: boolean;
  has_manage: boolean;
  tickets: TicketListItem[];
  pagination: TicketPagination;
  message?: string;
}

export interface TicketShowResponse {
  success: boolean;
  ticket: TicketDetail;
  message?: string;
}

export interface TicketMutationResponse {
  success: boolean;
  message?: string;
  ticket_id?: number;
  ticket?: TicketDetail;
  reply?: TicketReplyItem;
}
