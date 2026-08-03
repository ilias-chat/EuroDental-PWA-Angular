import { TaskListItem } from '../../core/models/task.model';
import { statusDotColor as taskStatusDotColor } from './task-status';

export type TasksViewMode = 'day' | 'month';

export interface CalendarDayCell {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  taskCount: number;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDate(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

export function getDateLabel(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDate(target, today)) return " (Aujourd'hui)";
  if (isSameDate(target, yesterday)) return ' (Hier)';
  if (isSameDate(target, tomorrow)) return ' (Demain)';
  return '';
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('fr-FR');
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start: formatDateKey(start), end: formatDateKey(end) };
}

export function rangeAroundMonth(date: Date, paddingMonths = 1): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth() - paddingMonths, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + paddingMonths + 1, 0);
  return { start: formatDateKey(start), end: formatDateKey(end) };
}

export function generateCalendarDays(selectedDate: Date, tasksByDate: Map<string, TaskListItem[]>): CalendarDayCell[] {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const days: CalendarDayCell[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      taskCount: tasksByDate.get(key)?.length ?? 0,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date()),
      taskCount: tasksByDate.get(key)?.length ?? 0,
    });
  }

  const remaining = 42 - days.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    const key = formatDateKey(date);
    days.push({
      date: key,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      taskCount: tasksByDate.get(key)?.length ?? 0,
    });
  }

  return days;
}

export function tasksByDateMap(tasks: TaskListItem[]): Map<string, TaskListItem[]> {
  const map = new Map<string, TaskListItem[]>();
  for (const task of tasks) {
    const key = task.task_date?.slice(0, 10);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }
  return map;
}

export function tasksForDate(tasks: TaskListItem[], dateKey: string): TaskListItem[] {
  return tasks.filter((t) => t.task_date?.slice(0, 10) === dateKey);
}

export function taskCountForMonth(tasks: TaskListItem[], year: number, month: number): number {
  return tasks.filter((t) => {
    const d = parseDateKey(t.task_date?.slice(0, 10) ?? '');
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export function statusDotColor(status: string): string {
  return taskStatusDotColor(status);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
