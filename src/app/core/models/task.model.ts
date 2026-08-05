export interface TaskUserRef {
  id: number;
  name: string;
  image: string | null;
}

export interface TaskListItem {
  id: number;
  reference: string | null;
  client_id: number | null;
  task_name: string;
  task_type: string;
  description: string | null;
  status: string;
  current_visit_status: string | null;
  has_ongoing_visit: boolean;
  current_user_has_active_visit: boolean;
  urgent: boolean;
  task_date: string;
  started_at: string | null;
  finished_at: string | null;
  is_main_technician: boolean;
  is_helping_user: boolean;
  is_paid: boolean;
  amount_paid: number | null;
  admin_delivery_amount: number | null;
  technician: TaskUserRef | null;
  helping_users: TaskUserRef[];
  client_name: string | null;
  client_city: string | null;
  client_image: string | null;
}

export interface TaskEvent {
  id: number;
  type: string;
  event_type?: string;
  formatted_time?: string;
  event_time?: string;
  user_id?: number | null;
  user_name: string | null;
  user_image: string | null;
}

export interface TaskService {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
}

export interface ServiceProposition {
  id: number;
  name: string;
  proposed_by_name: string | null;
  created_at: string;
}

export interface WarrantyProduct {
  delivery_note_item_id: number;
  product_name: string;
  delivered_quantity: number;
  days_left: number;
  purchase_date: string;
  warranty_end: string;
}

export interface TaskDetail extends TaskListItem {
  events: TaskEvent[];
  services: TaskService[];
  service_propositions: ServiceProposition[];
  task_products: { id: number; product_name: string; quantity: number }[];
  warranty_products?: WarrantyProduct[];
  user_last_event: string | null;
  can_manage_task?: boolean;
  cancellation_reason?: string | null;
  admin_delivery_task_id?: number | null;
  admin_delivery_received_by_user_id?: number | null;
  admin_delivery_received_by_user_name?: string | null;
  current_user_id?: number;
}

export interface TaskEventsResponse {
  success: boolean;
  events: TaskEvent[];
  warranty_products: WarrantyProduct[];
  user_last_event: string | null;
  service_propositions: ServiceProposition[];
  is_paid: boolean;
  amount_paid: number | null;
  admin_delivery_amount: number | null;
  admin_delivery_received_by_user_name: string | null;
  task_status: string;
}

/** Response shape from POST /tasks/{id}/start-route, finish-visit, etc. */
export interface TaskActionResponse {
  success: boolean;
  message?: string;
  event?: {
    id?: number;
    event_type?: string;
    type?: string;
    event_time?: string;
    user_id?: number | null;
  };
  task_status?: string;
  user_last_event?: string | null;
  has_ongoing_visit?: boolean;
  current_user_has_active_visit?: boolean;
  current_user_is_en_route?: boolean;
  current_visit_status?: string | null;
}

export interface TaskTypeItem {
  id: number;
  name: string;
}

export interface ClientSearchItem {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  city?: string | null;
  image?: string | null;
}

export interface TaskFormUserOption {
  id: number;
  name: string;
  image?: string | null;
}

export interface ClientPickerPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface TaskCreateClientsResponse {
  clients: ClientSearchItem[];
  pagination: ClientPickerPagination;
}

export interface CreateTaskPayload {
  task_name: string;
  reference?: string | null;
  task_type: string;
  description?: string | null;
  client_id?: number | null;
  technician_id?: number | null;
  task_date: string;
  deployment_id?: number | null;
  helping_user_ids?: number[];
}

export interface CreateTaskResponse {
  success: boolean;
  message?: string;
  task?: { id: number; reference?: string | null };
}

export interface TaskTypesResponse {
  success: boolean;
  task_types: TaskTypeItem[];
}

export interface ClientSearchResponse {
  clients: ClientSearchItem[];
}
