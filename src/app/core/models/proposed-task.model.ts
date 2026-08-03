export interface ProposedTaskClientOption {
  id: number;
  name: string;
  image: string | null;
  city: string | null;
}

export interface ProposedTaskTypeOption {
  id: number;
  name: string;
}

export interface ProposedTaskItem {
  id: number;
  task_name: string;
  task_type: string;
  description: string;
  urgent: boolean;
  status: string;
  created_at: string;
  client_id: number | null;
  client_name: string | null;
  client_image: string | null;
  client_city: string | null;
}

export interface ProposedTaskFormPayload {
  task_name: string;
  task_type: string;
  client_id: number | null;
  description: string;
  urgent: boolean;
}

export interface ProposedTasksIndexResponse {
  proposed_tasks: ProposedTaskItem[];
  clients: ProposedTaskClientOption[];
  task_types: ProposedTaskTypeOption[];
}

export interface ProposedTaskMutationResponse {
  success: boolean;
  message: string;
  proposal?: ProposedTaskItem;
  errors?: Record<string, string[]>;
}

export type ProposedTaskStoreResponse = ProposedTaskMutationResponse;

export interface ProposedTaskDeleteResponse {
  success: boolean;
  message: string;
}
