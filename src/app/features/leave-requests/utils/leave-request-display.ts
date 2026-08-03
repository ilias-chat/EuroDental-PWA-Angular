import { LeaveRequestItem, LeaveRequestStatus } from '@core/models/leave-request.model';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacances',
  sick_leave: 'Maladie',
  personal: 'Personnel',
  other: 'Autre',
};

const JUSTIFICATION_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  telegram: 'Telegram',
  other: 'Autre',
};

const STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  waiting: 'En attente',
  denied: 'Refusé',
  accepted: 'Accepté',
  on_leave: 'En congé',
  completed: 'Terminé',
};

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateWithDay(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString.replace(' ', 'T'));
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function leaveDaysLabel(count: number): string {
  return `${count} jour${count > 1 ? 's' : ''}`;
}

export function getLeaveTypeLabel(type: string | null | undefined): string {
  if (!type) return '';
  return LEAVE_TYPE_LABELS[type] ?? type;
}

export function getJustificationLabel(method: string | null | undefined): string {
  if (!method) return '';
  return JUSTIFICATION_LABELS[method] ?? method;
}

export function getStatusLabel(status: LeaveRequestStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusBadgeClass(status: LeaveRequestStatus): string {
  if (status === 'accepted') {
    return 'stock-badge stock-badge--high';
  }
  if (status === 'denied') {
    return 'stock-badge stock-badge--low';
  }
  return `leave-status-badge leave-status-badge--${status}`;
}

export function canCancelLeaveRequest(request: LeaveRequestItem): boolean {
  if (request.status !== 'accepted') return false;
  const start = new Date(`${request.start_date}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start > today;
}
