/** Calendar dot colors (aligned with chip border tokens). */
export const TASK_STATUS_DOT_COLOR: Record<string, string> = {
  'en attente': '#b91c1c',
  'en route': '#f97316',
  'en cours': '#ca8a04',
  'terminée': '#1d4ed8',
  'en pause': '#047857',
  'annulée': '#a855f7',
};

export function taskStatusBadgeClass(status: string): string {
  switch (status) {
    case 'en attente':
      return 'stock-badge stock-badge--low';
    case 'en cours':
      return 'stock-badge stock-badge--medium';
    case 'en pause':
      return 'stock-badge stock-badge--high';
    case 'terminée':
      return 'stock-badge task-status-badge--info';
    case 'en route':
      return 'stock-badge task-status-badge--route';
    case 'annulée':
      return 'stock-badge task-status-badge--cancelled';
    default:
      return 'stock-badge stock-badge--low';
  }
}

export function statusDotColor(status: string): string {
  return TASK_STATUS_DOT_COLOR[status] ?? '#727785';
}

export function getEventLabel(type: string): string {
  const labels: Record<string, string> = {
    start_route: 'En route',
    end_route: 'Trajet annulé',
    start_visit: 'Visite démarrée',
    pause_visit: 'Visite en pause',
    resume_visit: 'Visite reprise',
    finish_visit: 'Visite terminée',
    finish_task: 'Tâche terminée',
    cancel_task: 'Tâche annulée',
  };
  return labels[type] ?? type;
}

export function formatFrenchDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export function warrantyStatusClass(daysLeft: number): { bg: string; text: string } {
  if (daysLeft <= 0) return { bg: '#fee2e2', text: '#b91c1c' };
  if (daysLeft <= 30) return { bg: '#ffedd5', text: '#c2410c' };
  return { bg: '#dcfce7', text: '#15803d' };
}
