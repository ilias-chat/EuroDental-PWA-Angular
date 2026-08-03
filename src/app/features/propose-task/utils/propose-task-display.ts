import { ProposedTaskClientOption } from '@core/models/proposed-task.model';

export function isPendingProposal(status: string): boolean {
  return (status ?? 'en attente') === 'en attente';
}

export function proposalStatusBadgeClass(status: string): string {
  switch (status) {
    case 'approuvée':
      return 'stock-badge stock-badge--high';
    case 'rejetée':
      return 'stock-badge stock-badge--low';
    default:
      return 'stock-badge stock-badge--medium';
  }
}

export function filterClients(
  clients: ProposedTaskClientOption[],
  search: string
): ProposedTaskClientOption[] {
  const q = search.trim().toLowerCase();
  if (!q) {
    return clients;
  }
  return clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.city?.toLowerCase().includes(q) ?? false)
  );
}
