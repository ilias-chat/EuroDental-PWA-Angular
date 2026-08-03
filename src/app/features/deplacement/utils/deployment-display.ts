import {
  DeploymentMonthBadge,
  DeplacementViewMode,
} from '@core/models/deployment.model';
import {
  formatDateKey,
  formatDisplayDate,
  formatMonthYear,
  getDateLabel,
  isSameDate,
  parseDateKey,
} from '@shared/utils/task-calendar';
import { formatTimelineDate, TimelineEventMeta } from '@shared/utils/timeline-event';

export interface DeploymentCalendarDayCell {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  deployments: DeploymentMonthBadge[];
}

export function formatMonthParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function deploymentCountLabel(count: number): string {
  return `${count} déplacement${count > 1 ? 's' : ''}`;
}

export function formatDeploymentDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return formatDisplayDate(parseDateKey(iso));
}

export function dayHeaderLabel(date: Date): string {
  return formatDisplayDate(date) + getDateLabel(date);
}

export function deploymentEventLabel(type: string, userName?: string | null): string {
  switch (type) {
    case 'start':
      return 'Début du déploiement';
    case 'end':
      return 'Fin du déploiement';
    case 'joined':
      return `${userName || 'Membre'} a rejoint`;
    default:
      return type;
  }
}

export function deploymentEventIcon(type: string): string {
  return getDeploymentTimelineEventMeta(type).icon.replace('fa-solid ', '');
}

export function getDeploymentTimelineEventMeta(type: string): TimelineEventMeta {
  switch (type) {
    case 'start':
      return { label: 'Début du déploiement', icon: 'fa-solid fa-play', color: '#22c55e' };
    case 'end':
      return { label: 'Fin du déploiement', icon: 'fa-solid fa-stop', color: '#ef4444' };
    case 'joined':
      return { label: 'Membre a rejoint', icon: 'fa-solid fa-user-plus', color: '#3b82f6' };
    default:
      return { label: type, icon: 'fa-solid fa-circle', color: '#727785' };
  }
}

export function formatEventDateTime(iso: string | null | undefined): string {
  return formatTimelineDate(iso ?? '');
}

export function formatExpenseAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function expensesTotal(
  expenses: { amount: number }[] | null | undefined
): number {
  if (!expenses?.length) return 0;
  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

export function generateDeploymentCalendarDays(
  selectedDate: Date,
  monthDeployments: Record<string, DeploymentMonthBadge[]>
): DeploymentCalendarDayCell[] {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const days: DeploymentCalendarDayCell[] = [];
  const today = new Date();

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDate(date, today),
      deployments: monthDeployments[key] ?? [],
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: isSameDate(date, today),
      deployments: monthDeployments[key] ?? [],
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDate(date, today),
      deployments: monthDeployments[key] ?? [],
    });
  }

  return days;
}

export function monthDeploymentCount(
  monthDeployments: Record<string, DeploymentMonthBadge[]>,
  year: number,
  month: number
): number {
  let count = 0;
  for (const [key, items] of Object.entries(monthDeployments)) {
    const d = parseDateKey(key);
    if (d.getFullYear() === year && d.getMonth() === month) {
      count += items.length;
    }
  }
  return count;
}

export function parseViewFromQuery(view: string | null): DeplacementViewMode {
  return view === 'month' ? 'month' : 'day';
}

export { formatMonthYear, formatDateKey, parseDateKey };
