export type TicketStatusCode = 'open' | 'in_progress' | 'solved';

const STATUS_LABELS: Record<TicketStatusCode, string> = {
  open: 'En attente',
  in_progress: 'En cours',
  solved: 'Résolu',
};

export function ticketStatusLabel(status: string): string {
  return STATUS_LABELS[status as TicketStatusCode] ?? status;
}

/** Same chip tokens as tasks list (`stock-badge` + task status variants). */
export function ticketStatusBadgeClass(status: string): string {
  switch (status) {
    case 'open':
      return 'stock-badge stock-badge--low';
    case 'in_progress':
      return 'stock-badge stock-badge--medium';
    case 'solved':
      return 'stock-badge task-status-badge--info';
    default:
      return 'stock-badge stock-badge--low';
  }
}
