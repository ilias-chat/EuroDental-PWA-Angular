import { TaskDetail, TaskEvent } from '@core/models/task.model';

export function canUseProgressionActions(t: TaskDetail): boolean {
  return t.is_main_technician || t.is_helping_user;
}

export function showEnRouteButton(t: TaskDetail): boolean {
  const last = t.user_last_event;
  return last === null || last === 'end_route' || last === 'finish_visit';
}

export function hasCurrentUserFinishedVisit(
  t: TaskDetail,
  events: TaskEvent[],
  currentUserId: number | undefined
): boolean {
  if (!currentUserId) {
    return false;
  }
  const list = events.length > 0 ? events : (t.events ?? []);
  return list.some((ev) => {
    const type = ev.type || ev.event_type;
    if (type !== 'finish_visit') {
      return false;
    }
    return ev.user_id == null || ev.user_id === currentUserId;
  });
}

export function showFinishTaskButton(
  t: TaskDetail,
  events: TaskEvent[],
  currentUserId: number | undefined
): boolean {
  if (!t.is_main_technician || t.technician?.id !== currentUserId) {
    return false;
  }
  if (!hasCurrentUserFinishedVisit(t, events, currentUserId)) {
    return false;
  }
  const last = t.user_last_event;
  if (
    last === 'start_route' ||
    last === 'start_visit' ||
    last === 'resume_visit' ||
    last === 'pause_visit'
  ) {
    return false;
  }
  return true;
}
