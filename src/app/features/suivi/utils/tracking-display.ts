import { TrackingEvent, TrackingUser, TrackingUserView, TrackingWeekDay } from '@core/models/tracking.model';
import { formatDateKey, parseDateKey } from '@shared/utils/task-calendar';

const WEEKDAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function trackingWeekDays(trackingDate: string): TrackingWeekDay[] {
  const current = parseDateKey(trackingDate);
  const monday = startOfWeekMonday(current);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i);
    return {
      date: formatDateKey(day),
      dayName: WEEKDAY_SHORT[day.getDay()],
      dayNumber: day.getDate(),
    };
  });
}

export function shiftTrackingWeek(trackingDate: string, deltaWeeks: number): string {
  const current = parseDateKey(trackingDate);
  const monday = startOfWeekMonday(current);
  const offsetFromMonday = current.getDay() === 0 ? 6 : current.getDay() - 1;
  const newMonday = addDays(monday, deltaWeeks * 7);
  return formatDateKey(addDays(newMonday, offsetFromMonday));
}

export function formatTrackingLongDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function userAvailableOnDate(user: TrackingUser, date: string): boolean {
  for (const leave of user.leave_requests ?? []) {
    if (date >= leave.start_date && date <= leave.end_date) {
      return false;
    }
  }
  return true;
}

export function mapTrackingUsers(users: TrackingUser[], date: string): TrackingUserView[] {
  return users.map((u) => ({
    ...u,
    available: userAvailableOnDate(u, date),
  }));
}

export function trackingEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    start_deployment: 'Déplacement',
    finish_deployment: 'Retour',
    start_visit: 'Début visite',
    start_route: 'En route',
    end_route: 'Annulation trajet',
    pause_visit: 'En pause',
    resume_visit: 'Reprise visite',
    finish_visit: 'Fin visite',
    finish_task: 'Tâche terminée',
    cancel_task: 'Tâche annulée',
  };
  return labels[eventType] ?? eventType;
}

export function trackingTimelineDotClass(eventType: string): string {
  if (eventType === 'start_deployment' || eventType === 'finish_deployment' || eventType === 'finish_task') {
    return 'suivi-timeline-dot--blue';
  }
  if (eventType === 'start_visit' || eventType === 'resume_visit') {
    return 'suivi-timeline-dot--yellow';
  }
  if (eventType === 'start_route') {
    return 'suivi-timeline-dot--orange';
  }
  if (eventType === 'end_route') {
    return 'suivi-timeline-dot--gray';
  }
  if (eventType === 'pause_visit' || eventType === 'finish_visit') {
    return 'suivi-timeline-dot--green';
  }
  if (eventType === 'cancel_task') {
    return 'suivi-timeline-dot--purple';
  }
  return 'suivi-timeline-dot--blue';
}

export function trackingPillClass(eventType: string): string {
  if (eventType === 'start_deployment' || eventType === 'finish_deployment') {
    return 'suivi-timeline-pill--blue';
  }
  if (eventType === 'start_visit' || eventType === 'resume_visit') {
    return 'suivi-timeline-pill--yellow';
  }
  if (eventType === 'start_route') {
    return 'suivi-timeline-pill--orange';
  }
  if (eventType === 'end_route') {
    return 'suivi-timeline-pill--gray';
  }
  if (eventType === 'pause_visit' || eventType === 'finish_visit') {
    return 'suivi-timeline-pill--green';
  }
  if (eventType === 'finish_task') {
    return 'suivi-timeline-pill--blue';
  }
  if (eventType === 'cancel_task') {
    return 'suivi-timeline-pill--purple';
  }
  return 'suivi-timeline-pill--blue';
}

export function trackingEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    start_deployment: 'fa-plane-departure',
    finish_deployment: 'fa-plane-arrival',
    start_visit: 'fa-play',
    start_route: 'fa-route',
    end_route: 'fa-xmark',
    pause_visit: 'fa-pause',
    resume_visit: 'fa-play',
    finish_visit: 'fa-check',
    finish_task: 'fa-flag-checkered',
    cancel_task: 'fa-times',
  };
  return icons[eventType] ?? 'fa-circle';
}

export function trackingEventDescription(ev: TrackingEvent): string {
  switch (ev.event_type) {
    case 'start_deployment':
      return ev.city_name ? `Déplacement démarré vers ${ev.city_name}` : 'Déplacement démarré';
    case 'finish_deployment':
      return 'Déplacement terminé';
    case 'finish_task':
      return `Achève la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'cancel_task':
      return `Annule la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'start_route':
      return `Démarre le trajet vers la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'end_route':
      return `Annule le trajet vers la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'pause_visit':
      return `Met en pause la visite pour la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'resume_visit':
      return `Reprend la visite pour la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'start_visit':
      return `Commence une visite pour la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    case 'finish_visit':
      return `Termine la visite pour la tâche ${ev.task_type ?? ''}: ${ev.task_name ?? ''}`.trim();
    default:
      return ev.event_type;
  }
}

export function userStatusBorderClass(user: TrackingUserView): string {
  if (!user.available) return 'suivi-user-card__avatar--leave';
  switch (user.last_event_status) {
    case 'working':
      return 'suivi-user-card__avatar--working';
    case 'paused':
      return 'suivi-user-card__avatar--paused';
    case 'route':
      return 'suivi-user-card__avatar--route';
    default:
      return 'suivi-user-card__avatar--waiting';
  }
}
