import { TaskUserRef, type ClientSearchItem, type CreateTaskPayload, type TaskTypeItem } from './task.model';

export type { ClientSearchItem, TaskTypeItem };

export interface DeploymentMember {
  id: number;
  name: string;
  image: string | null;
}

export interface DeploymentListItem {
  id: number;
  title: string;
  deployment_date: string | null;
  description?: string | null;
  city_id?: number | null;
  city_name?: string | null;
  responsible_id?: number | null;
  responsible_name?: string | null;
  responsible_image?: string | null;
  driver_id?: number | null;
  driver_name?: string | null;
  driver_image?: string | null;
  team_member_ids?: number[];
  team_members?: DeploymentMember[];
  tasks_count: number;
  tasks?: DeploymentTaskSummary[];
  all_tasks_completed?: boolean;
  completed_tasks_count?: number;
  completion_percentage?: number;
}

export interface DeploymentMonthBadge {
  id: number;
  deployment_date: string | null;
  tasks_count: number;
  all_tasks_completed: boolean;
}

export interface DeploymentTaskSummary {
  id: number;
  task_name: string;
  status: string;
  task_type: string;
  description?: string | null;
  urgent?: boolean;
  has_ongoing_visit?: boolean;
  is_main_technician?: boolean;
  is_helping_user?: boolean;
  user_can_act?: boolean;
  technician?: TaskUserRef | null;
  helping_users?: TaskUserRef[];
  client_name?: string | null;
  client_city?: string | null;
}

export interface DeploymentExpense {
  id: number;
  description: string;
  amount: number;
  expense_date: string;
  category?: string | null;
}

export const DEPLOYMENT_EXPENSE_CATEGORIES = [
  'Carburant',
  'Nourriture',
  'Hôtel',
  'Transport',
  'Péage',
  'Parking',
  'Restaurant',
  'Fournitures',
  'Autre',
] as const;

export type DeploymentExpenseCategory = (typeof DEPLOYMENT_EXPENSE_CATEGORIES)[number];

export interface DeploymentEvent {
  id: number;
  event_type: 'start' | 'end' | 'joined' | string;
  user_id?: number | null;
  user_name?: string | null;
  user_image?: string | null;
  event_time?: string | null;
  created_at?: string | null;
}

export interface DeploymentDetail extends DeploymentListItem {
  tasks: DeploymentTaskSummary[];
  expenses: DeploymentExpense[];
  events: DeploymentEvent[];
  is_responsible: boolean;
  hosters?: number[];
  hosters_detail?: DeploymentMember[];
}

export interface DeploymentDayResponse {
  success: boolean;
  deployments: DeploymentListItem[];
  message?: string;
}

export interface DeploymentMonthResponse {
  success: boolean;
  deployments: Record<string, DeploymentMonthBadge[]>;
  message?: string;
}

export interface PastDeploymentsCountResponse {
  success: boolean;
  count: number;
  message?: string;
}

export interface PastDeploymentsResponse {
  success: boolean;
  past_deployments: DeploymentListItem[];
  count: number;
  message?: string;
}

export interface DeploymentShowResponse {
  success: boolean;
  deployment: DeploymentDetail;
  message?: string;
}

export interface DeploymentExpensePayload {
  description: string;
  amount: number;
  expense_date: string;
  category?: string | null;
}

export interface DeploymentEventPayload {
  event_type: 'start' | 'end' | 'joined';
  user_id?: number | null;
  event_time?: string | null;
}

export type CreateDeploymentTaskPayload = CreateTaskPayload & {
  deployment_id: number;
};

export type DeplacementViewMode = 'day' | 'month';
