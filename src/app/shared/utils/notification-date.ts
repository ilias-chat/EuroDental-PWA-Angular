/** Relative time labels (aligned with eurodental mobile web). */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) {
    return "À l'instant";
  }
  if (diffHours < 24) {
    const h = Math.floor(diffHours);
    return h <= 1 ? 'Il y a 1 h' : `Il y a ${h} h`;
  }
  if (diffHours < 168) {
    const d = Math.floor(diffHours / 24);
    return d <= 1 ? 'Il y a 1 j' : `Il y a ${d} j`;
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
