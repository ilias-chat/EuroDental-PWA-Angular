import { TaskActionResponse, TaskDetail, TaskEvent, TaskEventsResponse } from '@core/models/task.model';

export function formatActionEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function normalizeActionEvent(
  raw: TaskActionResponse['event'] | undefined,
  currentUser: { id: number; name: string; image: string | null } | null | undefined
): TaskEvent | null {
  if (!raw) {
    return null;
  }

  const type = raw.event_type ?? raw.type;
  if (!type) {
    return null;
  }

  const eventTime = raw.event_time ?? new Date().toISOString();

  return {
    id: raw.id ?? Date.now(),
    type,
    event_type: type,
    event_time: eventTime,
    formatted_time: formatActionEventTime(eventTime),
    user_id: raw.user_id ?? currentUser?.id ?? null,
    user_name: currentUser?.name ?? null,
    user_image: currentUser?.image ?? null,
  };
}

export function applyProgressionActionResult(
  task: TaskDetail,
  res: TaskActionResponse,
  loadingKey: string,
  currentUser: { id: number; name: string; image: string | null } | null | undefined
): TaskDetail {
  const userLast =
    res.user_last_event ?? res.event?.event_type ?? res.event?.type ?? loadingKey;

  const next: TaskDetail = {
    ...task,
    user_last_event: userLast,
  };

  if (res.task_status) {
    next.status = res.task_status;
  }
  if (typeof res.has_ongoing_visit === 'boolean') {
    next.has_ongoing_visit = res.has_ongoing_visit;
  }
  if (typeof res.current_user_has_active_visit === 'boolean') {
    next.current_user_has_active_visit = res.current_user_has_active_visit;
  }

  const newEvent = normalizeActionEvent(res.event, currentUser);
  if (newEvent) {
    const list = [...(task.events ?? [])];
    if (!list.some((e) => e.id === newEvent.id)) {
      list.push(newEvent);
      next.events = list;
    }
  }

  return next;
}

export function mergeTaskEventsResponse(task: TaskDetail, eventsRes: TaskEventsResponse): TaskDetail {
  return {
    ...task,
    events: eventsRes.events,
    user_last_event: eventsRes.user_last_event ?? task.user_last_event,
    status: eventsRes.task_status ?? task.status,
    is_paid: eventsRes.is_paid,
    amount_paid: eventsRes.amount_paid,
    admin_delivery_amount: eventsRes.admin_delivery_amount,
    admin_delivery_received_by_user_name:
      eventsRes.admin_delivery_received_by_user_name ?? task.admin_delivery_received_by_user_name,
    service_propositions: eventsRes.service_propositions ?? task.service_propositions,
    warranty_products: eventsRes.warranty_products,
  };
}
