import { getEventLabel } from './task-status';

export interface TimelineEventMeta {
  label: string;
  icon: string;
  color: string;
}

const EVENT_TIMELINE: Record<string, TimelineEventMeta> = {
  finish_task: { label: 'Tâche terminée', icon: 'fa-solid fa-check', color: '#3b82f6' },
  finish_visit: { label: 'Visite terminée', icon: 'fa-solid fa-check', color: '#ef4444' },
  start_route: { label: 'En route', icon: 'fa-solid fa-truck', color: '#f97316' },
  end_route: { label: 'Trajet annulé', icon: 'fa-solid fa-route', color: '#727785' },
  start_visit: { label: 'Démarrée', icon: 'fa-solid fa-play', color: '#eab308' },
  resume_visit: { label: 'Reprise', icon: 'fa-solid fa-play', color: '#eab308' },
  pause_visit: { label: 'En pause', icon: 'fa-solid fa-pause', color: '#22c55e' },
  cancel_task: { label: 'Tâche annulée', icon: 'fa-solid fa-ban', color: '#a855f7' },
};

export function getTimelineEventMeta(type: string): TimelineEventMeta {
  const key = type?.trim();
  if (key && EVENT_TIMELINE[key]) {
    return EVENT_TIMELINE[key];
  }
  return {
    label: getEventLabel(key),
    icon: 'fa-solid fa-circle',
    color: '#727785',
  };
}

export function userInitials(name: string | null | undefined): string {
  if (!name?.trim()) {
    return '?';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatTimelineDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (hours === '00' && minutes === '00') {
    return `${day}/${month}/${year}`;
  }
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
