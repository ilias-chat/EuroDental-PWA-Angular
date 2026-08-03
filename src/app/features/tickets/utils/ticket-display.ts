import { TicketStatus } from '@core/models/ticket.model';

export { ticketStatusBadgeClass, ticketStatusLabel } from '@shared/utils/ticket-status';

export const TICKET_STATUS_FILTERS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'solved', label: 'Résolus' },
];

export function ticketUserInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
